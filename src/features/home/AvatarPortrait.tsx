import { Suspense, lazy, useEffect, useState } from "react";
import { AVATAR_PARTS } from "../../data";
import {
  defaultAvatarConfig,
  resolveAvatar,
  type AvatarConfig,
  type ProfileId,
  type ResolvedAvatar,
} from "../../domain";
import { runTask } from "../../platform/task";
import { supportsWebgl } from "../../platform/webgl";
import { loadAvatar } from "../../storage";

const LazyAvatar3D = lazy(() => import("../avatar/Avatar3DScene"));

export interface AvatarPortraitProps {
  readonly profileId: ProfileId;
  readonly reduceMotion: boolean;
  /** Shown while the 3D chunk loads or when WebGL is unavailable. */
  readonly fallback: string;
  readonly label: string;
}

/**
 * A single 3D render of the child's character, used as the home hero mascot.
 *
 * The heavy three.js scene stays lazy: the home screen is the app's landing
 * screen, so nothing is paid for until the hero actually mounts. Small
 * avatars elsewhere (sidebar, greeting) keep the flat emoji so the app does
 * not spin up a second WebGL context just to draw 34 pixels.
 */
export function AvatarPortrait({
  profileId,
  reduceMotion,
  fallback,
  label,
}: AvatarPortraitProps) {
  const [avatar, setAvatar] = useState<ResolvedAvatar | null>(null);

  useEffect(() => {
    let active = true;

    void (async () => {
      const result = await runTask(loadAvatar(profileId));
      if (!active) return;
      const config: AvatarConfig =
        result._tag === "Right" && result.right
          ? result.right
          : defaultAvatarConfig(AVATAR_PARTS);
      setAvatar(resolveAvatar(config, AVATAR_PARTS));
    })();

    return () => {
      active = false;
    };
  }, [profileId]);

  if (!avatar || !supportsWebgl()) {
    return (
      <span className="portrait portrait--fallback" role="img" aria-label={label}>
        {fallback}
      </span>
    );
  }

  return (
    <span className="portrait" role="img" aria-label={label}>
      <Suspense
        fallback={
          <span className="portrait__fallback" aria-hidden="true">
            {fallback}
          </span>
        }
      >
        <LazyAvatar3D avatar={avatar} reduceMotion={reduceMotion} spin={false} />
      </Suspense>
    </span>
  );
}
