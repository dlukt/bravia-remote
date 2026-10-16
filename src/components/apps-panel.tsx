import { useState } from "react"
import { Play, Square } from "lucide-react"
import { AlertTriangle } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import type { BraviaConfig } from "@/lib/bravia"
import {
  useApplicationList,
  useSetActiveApp,
  useTerminateApps,
} from "@/hooks/use-bravia"

export function AppsPanel({ config }: { config: BraviaConfig }) {
  const apps = useApplicationList(config)
  const launchApp = useSetActiveApp(config)
  const terminate = useTerminateApps(config)
  const [appFilter, setAppFilter] = useState("")

  const appEntries = apps.data?.[0] ?? []
  const filteredApps = appEntries.filter((app) =>
    app.title.toLowerCase().includes(appFilter.trim().toLowerCase())
  )
  const launchingUri =
    launchApp.isPending && typeof launchApp.variables === "string"
      ? launchApp.variables
      : null

  const error =
    launchApp.error instanceof Error
      ? launchApp.error.message
      : terminate.error instanceof Error
        ? terminate.error.message
        : apps.error instanceof Error
          ? `App list: ${apps.error.message}`
          : null

  return (
    <div className="flex flex-col gap-4">
      {error ? (
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>Apps failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>Apps</CardTitle>
          <CardDescription>
            {apps.isLoading
              ? "Loading installed apps…"
              : `${filteredApps.length} of ${appEntries.length} apps`}
          </CardDescription>
          <CardAction>
            <Button
              variant="ghost"
              size="sm"
              disabled={terminate.isPending}
              onClick={() => terminate.mutate()}
              title="Close running apps"
            >
              {terminate.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <Square data-icon="inline-start" />
              )}
              Close
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Field>
            <FieldLabel htmlFor="bravia-app-filter">Filter apps</FieldLabel>
            <Input
              id="bravia-app-filter"
              placeholder="YouTube, Kodi, Netflix…"
              value={appFilter}
              onChange={(e) => setAppFilter(e.target.value)}
            />
          </Field>
          {apps.isLoading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : filteredApps.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No apps match. The TV reported {appEntries.length} apps.
            </p>
          ) : (
            <div className="flex max-h-72 flex-col gap-1 overflow-y-auto">
              {filteredApps.map((app) => {
                const launching = launchingUri === app.uri
                return (
                  <div key={app.uri} className="flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {app.title}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={launchApp.isPending}
                      onClick={() => launchApp.mutate(app.uri)}
                      aria-label={`Launch ${app.title}`}
                    >
                      {launching ? (
                        <Spinner data-icon="inline-start" />
                      ) : (
                        <Play data-icon="inline-start" />
                      )}
                      Open
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
