import {
  ArrowLeft,
  ArrowRight,
  CircleAlert,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { createGateChallenge, isGateAnswerCorrect } from "../../domain";
import { Icon } from "../../ui";
import "./parent.css";

export interface ParentGateProps {
  readonly onUnlock: () => void;
  readonly onCancel: () => void;
  /** Session-lock context already draws its own card around the gate. */
  readonly compact?: boolean;
}

/**
 * The parent gate from the pen.dev "13 · Khusus Orang Tua" screen: a shield,
 * one sentence of reassurance, the arithmetic challenge in a card and a
 * single "Masuk" action. "24 · PIN Salah" supplies the error styling.
 */
export function ParentGate({
  onUnlock,
  onCancel,
  compact = false,
}: ParentGateProps) {
  const { t } = useTranslation();
  const [challenge, setChallenge] = useState(() =>
    createGateChallenge(Math.random),
  );
  const [value, setValue] = useState("");
  const [failed, setFailed] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (isGateAnswerCorrect(challenge, value)) {
      onUnlock();
      return;
    }
    setFailed(true);
    setValue("");
    setChallenge(createGateChallenge(Math.random));
  };

  return (
    <form
      className={compact ? "gate gate--compact" : "gate"}
      onSubmit={submit}
    >
      {compact ? null : (
        <header className="gate__top">
          <button type="button" className="gate__back" onClick={onCancel}>
            <Icon glyph={ArrowLeft} size={14} />
            <span>{t("common.back")}</span>
          </button>
        </header>
      )}

      <div className="gate__body">
        {compact ? null : (
          <div className="gate__intro">
            <span className="gate__badge" aria-hidden="true">
              <Icon glyph={ShieldCheck} size={34} />
            </span>
            <h1 className="gate__title">{t("parent.gateTitle")}</h1>
            <p className="gate__sub">{t("parent.gate.sub")}</p>
          </div>
        )}

        <div className={`gate__card${failed ? " gate__card--error" : ""}`}>
          <p className="gate__question">
            {t("parent.gate.question", { a: challenge.a, b: challenge.b })}
          </p>

          <label className="gate__field">
            <span className="visually-hidden">
              {t("parent.gate.placeholder")}
            </span>
            <input
              className="gate__input"
              inputMode="numeric"
              autoComplete="off"
              placeholder={t("parent.gate.placeholder")}
              value={value}
              aria-invalid={failed}
              onChange={(event) => setValue(event.currentTarget.value)}
            />
          </label>

          {failed ? (
            <p className="gate__error" role="alert">
              <Icon glyph={CircleAlert} size={14} />
              {t("parent.gate.wrong")}
            </p>
          ) : null}

          <div className="gate__actions">
            <button type="button" className="gate__cancel" onClick={onCancel}>
              {t("parent.gate.cancel")}
            </button>
            <button type="submit" className="gate__submit">
              <span>{t("parent.gate.submit")}</span>
              <Icon
                glyph={ArrowRight}
                size={17}
                className="gate__submit-icon"
              />
            </button>
          </div>
        </div>

        {compact ? null : (
          <p className="gate__note">
            <Icon glyph={Lock} size={14} />
            <span>{t("parent.gate.note")}</span>
          </p>
        )}
      </div>
    </form>
  );
}
