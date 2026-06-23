import { configureStore } from "@reduxjs/toolkit";

import settingsReducer from "./slices/settingsSlice";
import { blogifyApi } from "./api/blogifyApi";

export function makeStore() {
  return configureStore({
    reducer: {
      settings: settingsReducer,
      [blogifyApi.reducerPath]: blogifyApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(blogifyApi.middleware),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
