import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  createGateChallenge,
  isGateAnswerCorrect,
} from "../../domain";
import { Button } from "../../ui";
import "./parent.css";

export interface ParentGateProps {
  readonly onUnlock: () => void;
  readonly onCancel: () => void;
}

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
    <form className="parent__gate panel" onSubmit={submit}>
      <p className="parent__question">
        {t("parent.gate.question", { a: challenge.a, b: challenge.b })}
      </p>
      <label className="field">
        <span className="visually-hidden">{t("parent.gate.placeholder")}</span>
        <input
          className="field__input parent__input"
          inputMode="numeric"
          autoComplete="off"
          placeholder={t("parent.gate.placeholder")}
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
        />
      </label>
      {failed ? (
        <p className="parent__error" role="alert">
          {t("parent.gate.wrong")}
        </p>
      ) : null}
      <div className="parent__actions">
        <Button
          label={t("parent.gate.cancel")}
          variant="ghost"
          onClick={onCancel}
        />
        <Button label={t("parent.gate.submit")} type="submit" />
      </div>
    </form>
  );
}
