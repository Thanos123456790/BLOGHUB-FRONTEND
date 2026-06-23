"use client";

import * as React from "react";
import { Provider } from "react-redux";

import { makeStore, type AppStore } from "@/lib/store";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  const [store] = React.useState<AppStore>(() => makeStore());

  return <Provider store={store}>{children}</Provider>;
}
