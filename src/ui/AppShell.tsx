import {
  Activity,
  BookOpen,
  Cat,
  ChevronRight,
  Lock,
  Pencil,
  Puzzle,
  Star,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { ParentView } from "../features/parent/ParentScreen";
import { avatarEmoji } from "../data";
import type { Profile } from "../domain";
import type { Route, RouteName } from "../app/routes";
import { useOnline } from "../platform/online";
import { Icon } from "./Icon";
import "./app-shell.css";

export interface AppShellProps {
  readonly profile: Profile;
  readonly active: RouteName;
  readonly parentView: ParentView;
  readonly onNavigate: (route: Route) => void;
  readonly onParent: () => void;
  readonly onReport: () => void;
  readonly onSwitchProfile: () => void;
  readonly children: ReactNode;
}

interface NavItem {
  readonly key: string;
  readonly label: string;
  readonly icon: LucideIcon;
  readonly active: boolean;
  readonly onClick: () => void;
}

/**
 * The desktop frame: a fixed sidebar plus the scrolling page.
 *
 * At phone widths the sidebar is not rendered at all — the revamp keeps the
 * mobile screens chrome-free, with the child navigating from the home grid
 * and the back button, exactly as the pen.dev design does.
 */
export function AppShell({
  profile,
  active,
  parentView,
  onNavigate,
  onParent,
  onReport,
  onSwitchProfile,
  children,
}: AppShellProps) {
  const { t } = useTranslation();
  const online = useOnline();

  const learn: readonly NavItem[] = [
    {
      key: "home",
      label: t("nav.home"),
      icon: BookOpen,
      active: active === "home",
      onClick: () => onNavigate({ name: "home" }),
    },
    {
      key: "play",
      label: t("nav.writing"),
      icon: Pencil,
      active: active === "play",
      onClick: () => onNavigate({ name: "play" }),
    },
    {
      key: "games",
      label: t("nav.games"),
      icon: Puzzle,
      active: active === "games",
      onClick: () => onNavigate({ name: "games" }),
    },
    {
      key: "collection",
      label: t("nav.collection"),
      icon: Star,
      active: active === "collection",
      onClick: () => onNavigate({ name: "collection" }),
    },
    {
      key: "avatar",
      label: t("nav.avatar"),
      icon: Cat,
      active: active === "avatar",
      onClick: () => onNavigate({ name: "avatar" }),
    },
  ];

  const parent: readonly NavItem[] = [
    {
      key: "parent",
      label: t("parent.title"),
      icon: Lock,
      active: active === "parent" && parentView !== "report",
      onClick: onParent,
    },
    {
      key: "report",
      label: t("parent.navReport"),
      icon: Activity,
      active: active === "parent" && parentView === "report",
      onClick: onReport,
    },
  ];

  const renderItem = (item: NavItem) => (
    <button
      key={item.key}
      type="button"
      className={`sidebar__nav${item.active ? " sidebar__nav--active" : ""}`}
      aria-current={item.active ? "page" : undefined}
      onClick={item.onClick}
    >
      <Icon glyph={item.icon} size={18} />
      <span className="sidebar__nav-label">{item.label}</span>
    </button>
  );

  return (
    <div className="shell">
      <aside className="sidebar" aria-label={t("nav.mainLabel")}>
        <div className="sidebar__brand">
          <span className="sidebar__logo" aria-hidden="true">
            A
          </span>
          <span className="sidebar__wordmark">{t("app.name")}</span>
        </div>

        <p className="sidebar__group">{t("nav.groupLearn")}</p>
        {learn.map(renderItem)}

        <div className="sidebar__divider" role="presentation" />

        <p className="sidebar__group">{t("nav.groupParent")}</p>
        {parent.map(renderItem)}

        <div className="sidebar__spacer" />

        <p className={`sidebar__online${online ? "" : " sidebar__online--off"}`}>
          <span className="sidebar__dot" aria-hidden="true" />
          {online ? t("nav.offlineReady") : t("nav.offlineActive")}
        </p>

        <button
          type="button"
          className="sidebar__child"
          onClick={onSwitchProfile}
        >
          <span className="sidebar__child-avatar" aria-hidden="true">
            {avatarEmoji(profile.avatarId)}
          </span>
          <span className="sidebar__child-copy">
            <span className="sidebar__child-name">{profile.name}</span>
            <span className="sidebar__child-meta">{t("nav.mainProfile")}</span>
          </span>
          <Icon
            glyph={ChevronRight}
            size={14}
            className="sidebar__chevron"
          />
        </button>

        <button
          type="button"
          className="sidebar__switch"
          onClick={onSwitchProfile}
        >
          {t("parent.switchProfile")}
        </button>
      </aside>

      <div className="shell__main">{children}</div>
    </div>
  );
}
