import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Route } from "./app/routes";
import { RewardsProvider } from "./app/RewardsContext";
import { SessionProvider } from "./app/SessionContext";
import {
  setAudio,
  setHaptics,
  setLocale,
  setReduceMotion,
  type AppSettings,
  type Locale,
  type Profile,
} from "./domain";
import { HomeScreen } from "./features/home/HomeScreen";
import { GamesScreen } from "./features/games/GamesScreen";
import { AvatarScreen } from "./features/avatar/AvatarScreen";
import { CollectionScreen } from "./features/rewards/CollectionScreen";
import { RewardCelebration } from "./features/rewards/RewardCelebration";
import {
  ParentScreen,
  type ParentView,
} from "./features/parent/ParentScreen";
import { PlayScreen } from "./features/play/PlayScreen";
import { ProfileScreen } from "./features/profiles/ProfileScreen";
import { GlyphPreviewScreen } from "./features/preview/GlyphPreviewScreen";
import { SessionGate } from "./features/session/SessionGate";
import { changeLocale } from "./i18n";
import { runTask } from "./platform/task";
import {
  deleteProfileCascade,
  listProfiles,
  loadSettings,
  resetDatabase,
  saveProfile,
  saveSettings,
} from "./storage";
import { Button, Screen } from "./ui";

type Status = "loading" | "ready" | "error";

const CHILD_ROUTES: readonly Route["name"][] = [
  "home",
  "play",
  "games",
  "collection",
  "avatar",
];

const needsReset = (message: string): boolean =>
  /upgrade|primary key|databaseclosed|invalidstate|version/i.test(message);

export function App() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<Status>("loading");
  const [dbError, setDbError] = useState("");
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [profiles, setProfiles] = useState<readonly Profile[]>([]);
  const [current, setCurrent] = useState<Profile | null>(null);
  const [route, setRoute] = useState<Route>({ name: "profiles" });
  const [parentView, setParentView] = useState<ParentView>("menu");

  useEffect(() => {
    let active = true;

    void (async () => {
      const loadedSettings = await runTask(loadSettings());
      if (!active) return;
      if (loadedSettings._tag === "Left") {
        setDbError(loadedSettings.left.message);
        setStatus("error");
        return;
      }

      await changeLocale(loadedSettings.right.locale);

      const loadedProfiles = await runTask(listProfiles());
      if (!active) return;
      if (loadedProfiles._tag === "Left") {
        setDbError(loadedProfiles.left.message);
        setStatus("error");
        return;
      }

      const list = loadedProfiles.right;
      const first = list[0] ?? null;
      setSettings(loadedSettings.right);
      setProfiles(list);
      setCurrent(first);
      setRoute(first ? { name: "home" } : { name: "profiles" });
      setStatus("ready");
    })();

    return () => {
      active = false;
    };
  }, []);

  const persistSettings = useCallback((next: AppSettings) => {
    setSettings(next);
    void runTask(saveSettings(next));
  }, []);

  const handleChangeLocale = useCallback(
    (locale: Locale) => {
      if (!settings) return;
      const result = setLocale(settings, locale);
      if (result._tag === "Left") return;
      void changeLocale(locale);
      persistSettings(result.right);
    },
    [settings, persistSettings],
  );

  const handleToggleHaptics = useCallback(
    (enabled: boolean) => {
      if (!settings) return;
      persistSettings(setHaptics(settings, enabled));
    },
    [settings, persistSettings],
  );

  const handleToggleAudio = useCallback(
    (enabled: boolean) => {
      if (!settings) return;
      persistSettings(setAudio(settings, enabled));
    },
    [settings, persistSettings],
  );

  const handleToggleReduceMotion = useCallback(
    (enabled: boolean) => {
      if (!settings) return;
      persistSettings(setReduceMotion(settings, enabled));
    },
    [settings, persistSettings],
  );

  useEffect(() => {
    document.documentElement.dataset.motion = settings?.reduceMotion
      ? "reduced"
      : "full";
  }, [settings?.reduceMotion]);

  const handleCreateProfile = useCallback((profile: Profile) => {
    setProfiles((prev) => [...prev, profile]);
    void runTask(saveProfile(profile));
    setCurrent(profile);
    setParentView("menu");
    setRoute({ name: "home" });
  }, []);

  const handleSelectProfile = useCallback((profile: Profile) => {
    setCurrent(profile);
    setParentView("menu");
    setRoute({ name: "home" });
  }, []);

  const handleDeleteProfile = useCallback(
    (profile: Profile) => {
      const remaining = profiles.filter((entry) => entry.id !== profile.id);
      if (remaining.length === 0) return;
      setProfiles(remaining);
      void runTask(deleteProfileCascade(profile.id));
      if (current?.id === profile.id) {
        setCurrent(remaining[0] ?? null);
        setParentView("menu");
        setRoute({ name: "home" });
      }
    },
    [profiles, current],
  );

  const openParent = useCallback((view: ParentView) => {
    setParentView(view);
    setRoute({ name: "parent" });
  }, []);

  const handleReload = useCallback(() => {
    window.location.reload();
  }, []);

  const handleReset = useCallback(() => {
    void resetDatabase()
      .then(() => window.location.reload())
      .catch(() => window.location.reload());
  }, []);

  if (status === "loading") {
    return (
      <main className="app-shell app-shell--center">
        <p>{t("common.loading")}</p>
      </main>
    );
  }

  if (status === "error" || !settings) {
    return (
      <main className="app-shell app-shell--center">
        <Screen center>
          <p role="alert">{t("error.storage")}</p>
          <Button label={t("error.retry")} onClick={handleReload} />
          {needsReset(dbError) ? (
            <>
              <Button
                variant="ghost"
                label={t("error.reset")}
                onClick={handleReset}
              />
              <p>{t("error.resetHint")}</p>
            </>
          ) : null}
        </Screen>
      </main>
    );
  }

  const renderRoute = () => {
    if (route.name === "home" && current) {
      return (
        <HomeScreen
          profile={current}
          onNavigate={setRoute}
          onParent={() => openParent("menu")}
          onSwitchProfile={() => openParent("children")}
        />
      );
    }

    if (route.name === "play" && current) {
      return (
        <PlayScreen
          profile={current}
          settings={settings}
          onBack={() => setRoute({ name: "home" })}
        />
      );
    }

    if (route.name === "games" && current) {
      return (
        <GamesScreen
          profile={current}
          settings={settings}
          onBack={() => setRoute({ name: "home" })}
        />
      );
    }

    if (route.name === "collection" && current) {
      return <CollectionScreen onBack={() => setRoute({ name: "home" })} />;
    }

    if (route.name === "avatar" && current) {
      return (
        <AvatarScreen
          profile={current}
          reduceMotion={settings.reduceMotion}
          onBack={() => setRoute({ name: "home" })}
        />
      );
    }

    if (route.name === "preview") {
      return <GlyphPreviewScreen onBack={() => setRoute({ name: "parent" })} />;
    }

    if (route.name === "parent" && current) {
      return (
        <ParentScreen
          profile={current}
          profiles={profiles}
          settings={settings}
          view={parentView}
          onViewChange={setParentView}
          onChangeLocale={handleChangeLocale}
          onToggleHaptics={handleToggleHaptics}
          onToggleAudio={handleToggleAudio}
          onToggleReduceMotion={handleToggleReduceMotion}
          onSelectProfile={handleSelectProfile}
          onDeleteProfile={handleDeleteProfile}
          onClose={() => setRoute({ name: "home" })}
          onPreview={() => setRoute({ name: "preview" })}
        />
      );
    }

    return (
      <ProfileScreen
        profiles={profiles}
        onSelect={handleSelectProfile}
        onCreate={handleCreateProfile}
      />
    );
  };

  if (!current) {
    return <main className="app-shell">{renderRoute()}</main>;
  }

  const content = renderRoute();
  const guarded = CHILD_ROUTES.includes(route.name) ? (
    <SessionGate>{content}</SessionGate>
  ) : (
    content
  );

  return (
    <RewardsProvider profileId={current.id}>
      <SessionProvider profileId={current.id}>
        <main className="app-shell">{guarded}</main>
        <RewardCelebration
          audioEnabled={settings.audioEnabled}
          hapticsEnabled={settings.hapticsEnabled}
        />
      </SessionProvider>
    </RewardsProvider>
  );
}

export default App;
