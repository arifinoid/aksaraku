import { useTranslation } from "react-i18next";
import { Screen } from "../../ui";

export interface PlayScreenProps {
  readonly onBack: () => void;
}

export function PlayScreen({ onBack }: PlayScreenProps) {
  const { t } = useTranslation();

  return (
    <Screen title={t("play.title")} onBack={onBack} center>
      <p className="panel__hint">{t("play.comingSoon")}</p>
    </Screen>
  );
}
