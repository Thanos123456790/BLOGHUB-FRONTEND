"use client";

import * as React from "react";

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { selectTheme, setTheme } from "@/lib/store/slices/settingsSlice";

const THEME_STORAGE_KEY = "blogify-theme";

/**
 * Keeps <html class="dark"> and localStorage in sync with the Redux theme
 * value. A no-flash inline script in the document head already applies the
 * persisted theme class before hydration; this component takes over after
 * mount so subsequent toggles (and any drift from localStorage) stay in sync.
 */
export function ThemeSync() {
  const theme = useAppSelector(selectTheme);
  const dispatch = useAppDispatch();
  const hasSyncedFromStorage = React.useRef(false);

  React.useEffect(() => {
    if (hasSyncedFromStorage.current) return;
    hasSyncedFromStorage.current = true;
    try {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      if ((stored === "light" || stored === "dark") && stored !== theme) {
        dispatch(setTheme(stored));
      }
    } catch {
      // localStorage unavailable (e.g. private browsing) — ignore.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  return null;
}
