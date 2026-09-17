import { Application, Container, Graphics } from "pixi.js";
import { useEffect, useRef } from "react";
import {
  createSession,
  currentStroke,
  designTransform,
  toDesignSpace,
  toScreenSpace,
  tracePoint,
  type ModuleItem,
  type TraceEvent,
  type TraceSession,
} from "../../domain";
import { HAPTIC, vibrate } from "../../platform/haptics";
import {
  playOffTrack,
  playPop,
  playStrokeComplete,
  playSuccess,
} from "../audio";
import "./tracing.css";

export interface TracingCanvasProps {
  readonly item: ModuleItem;
  readonly resetKey: number;
  readonly audioEnabled: boolean;
  readonly hapticsEnabled: boolean;
  readonly onEvent: (event: TraceEvent, session: TraceSession) => void;
  readonly onCoverage: (coverage: number) => void;
}

const GUIDE_COLOR = 0xe7d8c4;
const ACTIVE_COLOR = 0xffd166;
const PROGRESS_COLOR = 0xff7a45;
const MARKER_COLOR = 0x4cc9f0;

export function TracingCanvas({
  item,
  resetKey,
  audioEnabled,
  hapticsEnabled,
  onEvent,
  onCoverage,
}: TracingCanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<TraceSession>(createSession(item.strokes));
  const flagsRef = useRef({ audioEnabled, hapticsEnabled });
  const handlersRef = useRef({ onEvent, onCoverage });

  useEffect(() => {
    flagsRef.current = { audioEnabled, hapticsEnabled };
  }, [audioEnabled, hapticsEnabled]);

  useEffect(() => {
    handlersRef.current = { onEvent, onCoverage };
  }, [onEvent, onCoverage]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const app = new Application();
    const guide = new Graphics();
    const progress = new Graphics();
    const marker = new Container();
    const markerDot = new Graphics();
    markerDot.circle(0, 0, 15).fill({ color: MARKER_COLOR, alpha: 0.9 });
    marker.addChild(markerDot);

    let initialized = false;
    let disposed = false;
    let drawing = false;
    let activePointer: number | null = null;
    let coverage = 0;

    sessionRef.current = createSession(item.strokes);

    const draw = () => {
      const session = sessionRef.current;
      if (app.screen.width < 1 || app.screen.height < 1) return;
      const transform = designTransform({
        width: app.screen.width,
        height: app.screen.height,
      });

      guide.clear();
      session.strokes.forEach((stroke, index) => {
        const active =
          index === session.strokeIndex && session.phase !== "completed";
        if (stroke.points.length === 0) return;
        for (const point of stroke.points) {
          const screen = toScreenSpace(point, transform);
          guide.circle(screen.x, screen.y, active ? 3.4 : 2.4);
        }
        guide.fill({ color: active ? ACTIVE_COLOR : GUIDE_COLOR });
      });

      progress.clear();
      let hasProgress = false;
      session.covered.forEach((covered, strokeIndex) => {
        const stroke = session.strokes[strokeIndex];
        if (!stroke) return;
        for (let i = 0; i < covered.length; i += 1) {
          if (!covered[i]) continue;
          const a = toScreenSpace(stroke.points[i]!, transform);
          const b = toScreenSpace(stroke.points[i + 1]!, transform);
          progress.moveTo(a.x, a.y).lineTo(b.x, b.y);
          hasProgress = true;
        }
      });
      if (hasProgress) {
        progress.stroke({
          width: 13,
          color: PROGRESS_COLOR,
          cap: "round",
          join: "round",
        });
      }

      const active = currentStroke(session);
      const start = active?.points[0];
      if (start && session.phase !== "completed") {
        const screen = toScreenSpace(start, transform);
        marker.visible = true;
        marker.position.set(screen.x, screen.y);
      } else {
        marker.visible = false;
      }
    };

    const emit = (event: TraceEvent) => {
      const flags = flagsRef.current;
      switch (event._tag) {
        case "OffTrack":
          playOffTrack(flags.audioEnabled);
          vibrate(HAPTIC.offTrack, flags.hapticsEnabled);
          break;
        case "StrokeCompleted":
          playStrokeComplete(flags.audioEnabled);
          vibrate(HAPTIC.tap, flags.hapticsEnabled);
          coverage = 0;
          handlersRef.current.onCoverage(0);
          break;
        case "ItemCompleted":
          playSuccess(flags.audioEnabled);
          vibrate(HAPTIC.success, flags.hapticsEnabled);
          coverage = 1;
          handlersRef.current.onCoverage(1);
          break;
        case "Progress":
        case "Ignored":
          break;
      }
      handlersRef.current.onEvent(event, sessionRef.current);
    };

    const handlePointer = (event: PointerEvent) => {
      const session = sessionRef.current;
      if (session.phase === "completed") return;
      if (app.screen.width < 1 || app.screen.height < 1) return;

      const rect = app.canvas.getBoundingClientRect();
      const design = toDesignSpace({ x: event.clientX, y: event.clientY }, rect);
      const step = tracePoint(session, design, performance.now());
      sessionRef.current = step.session;
      draw();

      if (step.event._tag === "Progress") {
        if (step.event.coverage - coverage >= 0.08) {
          coverage = step.event.coverage;
          handlersRef.current.onCoverage(coverage);
          playPop(flagsRef.current.audioEnabled);
        }
        return;
      }

      emit(step.event);
    };

    const onDown = (event: PointerEvent) => {
      event.preventDefault();
      if (activePointer !== null) return;
      activePointer = event.pointerId;
      drawing = true;
      app.canvas.setPointerCapture(event.pointerId);
      handlePointer(event);
    };

    const onMove = (event: PointerEvent) => {
      if (!drawing || event.pointerId !== activePointer) return;
      event.preventDefault();
      handlePointer(event);
    };

    const onUp = (event: PointerEvent) => {
      if (event.pointerId !== activePointer) return;
      drawing = false;
      activePointer = null;
      if (app.canvas.hasPointerCapture(event.pointerId)) {
        app.canvas.releasePointerCapture(event.pointerId);
      }
    };

    const pulse = () => {
      marker.scale.set(1 + Math.sin(performance.now() / 300) * 0.12);
    };

    void (async () => {
      await app.init({
        backgroundAlpha: 0,
        antialias: true,
        resizeTo: host,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: true,
      });

      if (disposed) {
        app.destroy(true, { children: true });
        return;
      }

      initialized = true;
      host.appendChild(app.canvas);
      app.canvas.style.touchAction = "none";
      app.stage.addChild(guide, progress, marker);
      app.canvas.addEventListener("pointerdown", onDown);
      app.canvas.addEventListener("pointermove", onMove);
      app.canvas.addEventListener("pointerup", onUp);
      app.canvas.addEventListener("pointercancel", onUp);
      app.ticker.add(pulse);
      window.addEventListener("resize", draw);
      window.addEventListener("orientationchange", draw);
      draw();
    })();

    return () => {
      disposed = true;
      if (!initialized) return;
      app.canvas.removeEventListener("pointerdown", onDown);
      app.canvas.removeEventListener("pointermove", onMove);
      app.canvas.removeEventListener("pointerup", onUp);
      app.canvas.removeEventListener("pointercancel", onUp);
      window.removeEventListener("resize", draw);
      window.removeEventListener("orientationchange", draw);
      app.ticker.remove(pulse);
      app.destroy(true, { children: true });
    };
  }, [item, resetKey]);

  return <div className="tracing-canvas" ref={hostRef} />;
}
