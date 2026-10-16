import { useState } from "react"

import { AppSidebar, type AppPage } from "@/components/app-sidebar"
import { AppearanceSettings } from "@/components/appearance-settings"
import { AppsPanel } from "@/components/apps-panel"
import { BraviaRemote } from "@/components/bravia-remote"
import { ConnectionSettings } from "@/components/connection-settings"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useBraviaConfig } from "@/hooks/use-bravia"
import { useAppLayout } from "@/hooks/use-app-layout"

const PAGE_TITLE: Record<AppPage, string> = {
  remote: "Remote",
  apps: "Apps",
  settings: "Settings",
}

export function App() {
  const { config, update } = useBraviaConfig()
  const { layout, setLayout } = useAppLayout()
  const [page, setPage] = useState<AppPage>("remote")
  const wide = layout === "wide"

  return (
    <SidebarProvider>
      <AppSidebar page={page} onNavigate={setPage} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger />
          <h1 className="text-sm font-semibold tracking-widest uppercase">
            {PAGE_TITLE[page]}
          </h1>
        </header>
        <main
          className={
            wide
              ? "mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 p-6 pt-0"
              : "mx-auto flex w-full max-w-md flex-1 flex-col gap-4 p-6 pt-0"
          }
        >
          {page === "remote" ? (
            <BraviaRemote config={config} wide={wide} />
          ) : null}
          {page === "apps" ? <AppsPanel config={config} /> : null}
          {page === "settings" ? (
            <>
              <AppearanceSettings layout={layout} setLayout={setLayout} />
              <ConnectionSettings config={config} update={update} />
            </>
          ) : null}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default App
