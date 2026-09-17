import { useTranslation } from "react-i18next";
import type { Route } from "../../app/routes";
import { avatarEmoji } from "../../data/avatars";
import type { Profile } from "../../domain";
import { Button, Screen, Tile } from "../../ui";

export interface HomeScreenProps {
  readonly profile: Profile;
  readonly onNavigate: (route: Route) => void;
  readonly onParent: () => void;
  readonly onSwitchProfile: () => void;
}

export function HomeScreen({
  profile,
  onNavigate,
  onParent,
  onSwitchProfile,
}: HomeScreenProps) {
  const { t } = useTranslation();

  return (
    <Screen
      title={t("home.greeting", { name: profile.name })}
      actions={
        <Button
          label={t("nav.parent")}
          icon="🔒"
          variant="secondary"
          size="sm"
          onClick={onParent}
        />
      }
    >
      <div className="tile-grid">
        <Tile
          label={t("home.tracing")}
          icon="✏️"
          tone="primary"
          onClick={() => onNavigate({ name: "play" })}
        />
        <Tile
          label={t("home.games")}
          icon="🎈"
          tone="secondary"
          onClick={() => onNavigate({ name: "games" })}
        />
        <Tile
          label={t("home.rewards")}
          icon="🏆"
          tone="accent"
          onClick={() => onNavigate({ name: "collection" })}
        />
        <Tile
          label={t("home.avatar")}
          icon={avatarEmoji(profile.avatarId)}
          tone="success"
          onClick={() => onNavigate({ name: "avatar" })}
        />
      </div>
      <Button
        label={t("parent.switchProfile")}
        variant="ghost"
        size="sm"
        onClick={onSwitchProfile}
      />
    </Screen>
  );
}
