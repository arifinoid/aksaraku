import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Route } from "./app/routes";
import {
  setAudio,
  setHaptics,
  setLocale,
  type AppSettings,
  type Locale,
  type Profile,
} from "./domain";
import { HomeScreen } from "./features/home/HomeScreen";
import { GamesScreen } from "./features/games/GamesScreen";
import { ParentScreen } from "./features/parent/ParentScreen";
import { PlayScreen } from "./features/play/PlayScreen";
import { ProfileScreen } from "./features/profiles/ProfileScreen";
import { GlyphPreviewScreen } from "./features/preview/GlyphPreviewScreen";
import { changeLocale } from "./i18n";
import { runTask } from "./platform/task";
import {
  listProfiles,
  loadSettings,
  saveProfile,
  saveSettings,
} from "./storage";
import { Screen } from "./ui";

type Status = "loading" | "ready" | "error";

export function App() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<Status>("loading");
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [profiles, setProfiles] = useState<readonly Profile[]>([]);
  const [current, setCurrent] = useState<Profile | null>(null);
  const [route, setRoute] = useState<Route>({ name: "profiles" });

  useEffect(() => {
    let active = true;

    void (async () => {
      const loadedSettings = await runTask(loadSettings());
      if (!active) return;
      if (loadedSettings._tag === "Left") {
        setStatus("error");
        return;
      }

      await changeLocale(loadedSettings.right.locale);

      const loadedProfiles = await runTask(listProfiles());
      if (!active) return;
      if (loadedProfiles._tag === "Left") {
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

  const handleCreateProfile = useCallback((profile: Profile) => {
    setProfiles((prev) => [...prev, profile]);
    void runTask(saveProfile(profile));
    setCurrent(profile);
    setRoute({ name: "home" });
  }, []);

  const handleSelectProfile = useCallback((profile: Profile) => {
    setCurrent(profile);
    setRoute({ name: "home" });
  }, []);

  const goToProfiles = useCallback(() => setRoute({ name: "profiles" }), []);

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
          onParent={() => setRoute({ name: "parent" })}
          onSwitchProfile={goToProfiles}
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

    if (route.name === "preview") {
      return <GlyphPreviewScreen onBack={() => setRoute({ name: "parent" })} />;
    }

    if (route.name === "parent") {
      return (
        <ParentScreen
          settings={settings}
          onChangeLocale={handleChangeLocale}
          onToggleHaptics={handleToggleHaptics}
          onToggleAudio={handleToggleAudio}
          onClose={() => setRoute(current ? { name: "home" } : { name: "profiles" })}
          onSwitchProfile={goToProfiles}
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

  return <main className="app-shell">{renderRoute()}</main>;
}

export default App;
