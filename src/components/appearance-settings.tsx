import { Columns2, Monitor, Moon, Smartphone, Sun } from "lucide-react"

import { useTheme } from "@/components/theme-provider"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { AppLayout } from "@/hooks/use-app-layout"

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const

type Theme = (typeof THEMES)[number]["value"]

function isTheme(value: string | undefined): value is Theme {
  return value === "light" || value === "dark" || value === "system"
}

const LAYOUTS = [
  { value: "compact", label: "Compact", icon: Smartphone },
  { value: "wide", label: "Wide", icon: Columns2 },
] as const

function isLayout(value: string | undefined): value is AppLayout {
  return value === "compact" || value === "wide"
}

export function AppearanceSettings({
  layout,
  setLayout,
}: {
  layout: AppLayout
  setLayout: (layout: AppLayout) => void
}) {
  const { theme, setTheme } = useTheme()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Theme and layout</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <Field>
          <FieldLabel htmlFor="appearance-theme">Theme</FieldLabel>
          <ToggleGroup
            id="appearance-theme"
            variant="outline"
            value={[theme]}
            onValueChange={(value) => {
              const next = value[0]
              if (isTheme(next)) setTheme(next)
            }}
          >
            {THEMES.map((item) => (
              <ToggleGroupItem
                key={item.value}
                value={item.value}
                aria-label={`${item.label} theme`}
              >
                <item.icon data-icon="inline-start" />
                {item.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <FieldDescription>
            Press <kbd>d</kbd> anywhere to toggle dark mode.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="appearance-layout">Layout</FieldLabel>
          <ToggleGroup
            id="appearance-layout"
            variant="outline"
            value={[layout]}
            onValueChange={(value) => {
              const next = value[0]
              if (isLayout(next)) setLayout(next)
            }}
          >
            {LAYOUTS.map((item) => (
              <ToggleGroupItem
                key={item.value}
                value={item.value}
                aria-label={`${item.label} layout`}
              >
                <item.icon data-icon="inline-start" />
                {item.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <FieldDescription>
            Compact centers a narrow column; wide uses the full screen width.
          </FieldDescription>
        </Field>
      </CardContent>
    </Card>
  )
}
