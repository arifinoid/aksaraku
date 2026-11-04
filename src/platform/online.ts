import { useEffect, useState } from "react";

const read = (): boolean =>
  typeof navigator === "undefined" ? true : navigator.onLine;

/**
 * Tracks connectivity for the sidebar status line.
 *
 * The app works offline once installed, so the indicator is reassurance
 * rather than a blocker: it flips to "offline" and everything keeps
 * working against the local database.
 */
export const useOnline = (): boolean => {
  const [online, setOnline] = useState(read);

  useEffect(() => {
    const update = () => setOnline(read());
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return online;
};
