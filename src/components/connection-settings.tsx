import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { BraviaConfig } from "@/lib/bravia"

export function ConnectionSettings({
  config,
  update,
}: {
  config: BraviaConfig
  update: (patch: Partial<BraviaConfig>) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connection</CardTitle>
        <CardDescription>KD-49X8305C · Sony REST + IRCC</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="bravia-host">TV host</FieldLabel>
            <Input
              id="bravia-host"
              inputMode="numeric"
              placeholder="192.168.1.2"
              value={config.host}
              onChange={(e) => update({ host: e.target.value })}
            />
            <FieldDescription>
              IP or hostname on your LAN. Discovered via Avahi as 192.168.1.2.
              Pre-filled from .env.local.
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="bravia-psk">Pre-shared key</FieldLabel>
            <Input
              id="bravia-psk"
              type="password"
              autoComplete="off"
              placeholder="Set on TV → Network → IP Control"
              value={config.psk}
              onChange={(e) => update({ psk: e.target.value })}
            />
            <FieldDescription>
              Required for IRCC key presses and app launching. Reads work
              without it.
            </FieldDescription>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
