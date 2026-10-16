import { useState } from "react"

export type AppLayout = "compact" | "wide"

const STORAGE_KEY = "bravia.layout"

function loadLayout(): AppLayout {
  if (typeof localStorage === "undefined") return "compact"
  return localStorage.getItem(STORAGE_KEY) === "wide" ? "wide" : "compact"
}

export function useAppLayout() {
  const [layout, setLayoutState] = useState<AppLayout>(loadLayout)

  const setLayout = (next: AppLayout) => {
    localStorage.setItem(STORAGE_KEY, next)
    setLayoutState(next)
  }

  return { layout, setLayout }
}
