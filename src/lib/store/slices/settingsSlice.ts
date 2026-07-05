import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { RootState } from "../index";

export type ThemeMode = "light" | "dark";

export interface SettingsState {
  theme: ThemeMode;
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
  privateAccount: boolean;
  showActivityStatus: boolean;
}

export type TogglePrefKey = Exclude<keyof SettingsState, "theme">;

const STORAGE_KEY = "blogify_settings";

function loadFromStorage(): Partial<SettingsState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveToStorage(state: SettingsState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota / security errors
  }
}

const defaultState: SettingsState = {
  theme: "light",
  emailNotifications: true,
  pushNotifications: true,
  weeklyDigest: false,
  privateAccount: false,
  showActivityStatus: true,
};

function buildInitialState(): SettingsState {
  const persisted = loadFromStorage();
  return { ...defaultState, ...persisted };
}

const settingsSlice = createSlice({
  name: "settings",
  initialState: buildInitialState,
  reducers: {
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.theme = action.payload;
      saveToStorage({ ...state });
    },
    toggleTheme(state) {
      state.theme = state.theme === "light" ? "dark" : "light";
      saveToStorage({ ...state });
    },
    setPref(
      state,
      action: PayloadAction<{ key: TogglePrefKey; value: boolean }>
    ) {
      state[action.payload.key] = action.payload.value;
      saveToStorage({ ...state });
    },
  },
});

export const { setTheme, toggleTheme, setPref } = settingsSlice.actions;
export default settingsSlice.reducer;

export const selectTheme = (state: RootState): ThemeMode => state.settings.theme;
export const selectSettings = (state: RootState): SettingsState => state.settings;
