import { ArrowLeft, ArrowRight, Lock, Shield } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  createGateChallenge,
  isGateAnswerCorrect,
} from "../../domain";
import { Icon } from "../../ui";
import "./parent.css";

export interface ParentGateProps {
  readonly onUnlock: () => void;
  readonly onCancel: () => void;
}

/*
 * Rebuilt to pen.dev frame 13 (and d9 on desktop): shield hero, centered
 * question card, and the locked-access note beneath it.
 */
export function ParentGate({ onUnlock, onCancel }: ParentGateProps) {
  const { t } = useTranslation();
  const [challenge, setChallenge] = useState(() => createGateChallenge(Math.random));
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
    <div className="pgate">
      <div className="pgate__top">
        <button type="button" className="back-pill" onClick={onCancel}>
          <Icon glyph={ArrowLeft} size={16} />
          <span>{t("common.back")}</span>
        </button>
      </div>

      <span className="pgate__shield" aria-hidden="true">
        <Icon glyph={Shield} size={34} strokeWidth={2.2} />
      </span>

      <h1 className="pgate__title">{t("parent.gateTitle")}</h1>
      <p className="pgate__sub">{t("parent.gate.sub")}</p>

      <form className="pgate__card" onSubmit={submit}>
        <p className="pgate__question">
          {t("parent.gate.question", { a: challenge.a, b: challenge.b })}
        </p>
        <label className="visually-hidden" htmlFor="parent-gate-answer">
          {t("parent.gate.placeholder")}
        </label>
        <input
          id="parent-gate-answer"
          className={`pgate__input${failed ? " pgate__input--error" : ""}`}
          inputMode="numeric"
          autoComplete="off"
          placeholder={t("parent.gate.placeholder")}
          value={value}
          aria-invalid={failed || undefined}
          aria-describedby={failed ? "parent-gate-error" : undefined}
          onChange={(event) => setValue(event.currentTarget.value)}
        />
        {failed ? (
          <p id="parent-gate-error" className="pgate__error" role="alert">
            {t("parent.gate.wrong")}
          </p>
        ) : null}
        <div className="pgate__actions">
          <button type="button" className="pgate__cancel" onClick={onCancel}>
            {t("parent.gate.cancel")}
          </button>
          <button type="submit" className="pgate__submit">
            <span>{t("parent.gate.submit")}</span>
            <Icon glyph={ArrowRight} size={16} />
          </button>
        </div>
      </form>

      <p className="pgate__note">
        <Icon glyph={Lock} size={14} />
        <span>{t("parent.gate.note")}</span>
      </p>
    </div>
  );
}
