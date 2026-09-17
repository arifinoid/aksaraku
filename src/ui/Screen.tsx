import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./Button";
import "./screen.css";

export interface ScreenProps {
  readonly title?: string;
  readonly onBack?: () => void;
  readonly actions?: ReactNode;
  readonly children: ReactNode;
  readonly center?: boolean;
}

export function Screen({
  title,
  onBack,
  actions,
  children,
  center = false,
}: ScreenProps) {
  const { t } = useTranslation();

  return (
    <section className="screen">
      {(title || onBack || actions) && (
        <header className="screen__header">
          {onBack ? (
            <Button
              label={t("common.back")}
              icon="←"
              variant="secondary"
              size="sm"
              onClick={onBack}
            />
          ) : null}
          {title ? <h1 className="screen__title">{title}</h1> : null}
          {actions ? <div className="screen__actions">{actions}</div> : null}
        </header>
      )}
      <div className={`screen__content${center ? " screen__content--center" : ""}`}>
        {children}
      </div>
    </section>
  );
}
