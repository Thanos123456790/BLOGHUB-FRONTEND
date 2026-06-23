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

const initialState: SettingsState = {
  theme: "light",
  emailNotifications: true,
  pushNotifications: true,
  weeklyDigest: false,
  privateAccount: false,
  showActivityStatus: true,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.theme = action.payload;
    },
    toggleTheme(state) {
      state.theme = state.theme === "light" ? "dark" : "light";
    },
    setPref(
      state,
      action: PayloadAction<{ key: TogglePrefKey; value: boolean }>
    ) {
      state[action.payload.key] = action.payload.value;
    },
  },
});

export const { setTheme, toggleTheme, setPref } = settingsSlice.actions;
export default settingsSlice.reducer;

export const selectTheme = (state: RootState): ThemeMode => state.settings.theme;
export const selectSettings = (state: RootState): SettingsState => state.settings;
