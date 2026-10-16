import { useState } from "react"
import type { LucideIcon } from "lucide-react"
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsDown,
  ChevronsUp,
  Home,
  Menu,
  Minus,
  Plus,
  Power,
  Volume2,
  VolumeX,
} from "lucide-react"
import { AlertTriangle } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { BraviaError, type BraviaConfig, type IrccCodeName } from "@/lib/bravia"
import {
  usePowerStatus,
  useSendIrcc,
  useSetAudioMute,
  useSetAudioVolume,
  useSetTextForm,
  useVolumeInformation,
} from "@/hooks/use-bravia"

function RemoteButton({
  code,
  label,
  icon: Icon,
  variant = "outline",
  size = "icon",
  disabled,
  onPress,
  pendingCode,
}: {
  code: IrccCodeName
  label: string
  icon: LucideIcon
  variant?: "outline" | "secondary" | "default" | "ghost" | "destructive"
  size?: "icon" | "icon-sm" | "icon-lg" | "sm" | "default"
  disabled?: boolean
  onPress: (code: IrccCodeName) => void
  pendingCode: IrccCodeName | null
}) {
  const pending = pendingCode === code
  return (
    <Button
      variant={variant}
      size={size}
      aria-label={label}
      title={label}
      disabled={disabled || pendingCode !== null}
      onClick={() => onPress(code)}
    >
      {pending ? (
        <Spinner data-icon="inline-start" />
      ) : (
        <Icon data-icon="inline-start" />
      )}
      <span className="sr-only">{label}</span>
    </Button>
  )
}

export function BraviaRemote({
  config,
  wide = false,
}: {
  config: BraviaConfig
  wide?: boolean
}) {
  const power = usePowerStatus(config)
  const volume = useVolumeInformation(config)
  const ircc = useSendIrcc(config)
  const setVolume = useSetAudioVolume(config)
  const setMute = useSetAudioMute(config)
  const sendText = useSetTextForm(config)
  const [draftVolume, setDraftVolume] = useState<number | null>(null)
  const [text, setText] = useState("")
  const pendingCode = ircc.isPending
    ? ((ircc.variables as IrccCodeName | undefined) ?? null)
    : null

  const press = (code: IrccCodeName) => ircc.mutate(code)

  const powerStatus = power.data?.[0]?.status
  const speaker = volume.data?.[0]?.find((v) => v.target === "speaker")
  const unreachable = power.isError && volume.isError
  const minVolume = speaker?.minVolume ?? 0
  const maxVolume = speaker?.maxVolume ?? 100
  const shownVolume = draftVolume ?? speaker?.volume ?? 0

  const commitVolume = (value: number | readonly number[]) => {
    const next = Math.round(Array.isArray(value) ? (value[0] ?? 0) : value)
    setDraftVolume(null)
    setVolume.mutate(next)
  }

  const textError =
    sendText.error instanceof BraviaError && sendText.error.code === 7
      ? "No text field is focused on the TV. Select the URL bar, press Confirm, then send again."
      : sendText.error instanceof Error
        ? sendText.error.message
        : null

  const commandError =
    ircc.error instanceof Error
      ? ircc.error.message
      : setVolume.error instanceof Error
        ? setVolume.error.message
        : setMute.error instanceof Error
          ? setMute.error.message
          : textError

  return (
    <div
      className={
        wide
          ? "grid grid-cols-1 items-start gap-4 xl:grid-cols-2 [&>*:first-child]:xl:col-span-2"
          : "flex flex-col gap-4"
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Bravia Remote</CardTitle>
          <CardDescription>KD-49X8305C · Sony REST + IRCC</CardDescription>
          <CardAction>
            {power.isLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <Badge
                variant={powerStatus === "active" ? "default" : "secondary"}
              >
                {powerStatus ?? "unknown"}
              </Badge>
            )}
          </CardAction>
        </CardHeader>
      </Card>

      {unreachable ? (
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>TV unreachable</AlertTitle>
          <AlertDescription>
            Cannot reach {config.host}:80. Check the IP and that the TV and this
            device share the same LAN.
          </AlertDescription>
        </Alert>
      ) : null}

      {commandError ? (
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>Command failed</AlertTitle>
          <AlertDescription>{commandError}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Power &amp; Volume</CardTitle>
          <CardDescription>
            {volume.isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : speaker ? (
              `Volume ${speaker.volume} · ${speaker.mute ? "muted" : "unmuted"}`
            ) : (
              "Volume unknown"
            )}
          </CardDescription>
          <CardAction>{ircc.isPending ? <Spinner /> : null}</CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <RemoteButton
              code="TvPower"
              label="Power toggle"
              icon={Power}
              variant="default"
              onPress={press}
              pendingCode={pendingCode}
            />
            <RemoteButton
              code="PowerOff"
              label="Power off"
              icon={Power}
              variant="outline"
              onPress={press}
              pendingCode={pendingCode}
            />
            <div className="ml-auto flex items-center gap-2">
              <RemoteButton
                code="VolumeDown"
                label="Volume down"
                icon={Minus}
                onPress={press}
                pendingCode={pendingCode}
              />
              <RemoteButton
                code="Mute"
                label={speaker?.mute ? "Unmute" : "Mute"}
                icon={speaker?.mute ? VolumeX : Volume2}
                onPress={press}
                pendingCode={pendingCode}
              />
              <RemoteButton
                code="VolumeUp"
                label="Volume up"
                icon={Plus}
                onPress={press}
                pendingCode={pendingCode}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Field orientation="horizontal">
              <FieldLabel htmlFor="bravia-volume">
                Volume {speaker ? shownVolume : "–"}
                {setVolume.isPending ? " · setting…" : ""}
              </FieldLabel>
              <FieldContent>
                <Slider
                  id="bravia-volume"
                  aria-label="Speaker volume"
                  value={[shownVolume]}
                  min={minVolume}
                  max={maxVolume}
                  step={1}
                  disabled={!speaker || setVolume.isPending}
                  onValueChange={(value) =>
                    setDraftVolume(
                      Math.round(Array.isArray(value) ? (value[0] ?? 0) : value)
                    )
                  }
                  onValueCommitted={commitVolume}
                />
              </FieldContent>
            </Field>
            <Field orientation="horizontal">
              <FieldLabel htmlFor="bravia-mute">
                Mute {speaker?.mute ? "on" : "off"}
              </FieldLabel>
              <FieldContent>
                <Switch
                  id="bravia-mute"
                  checked={speaker?.mute ?? false}
                  disabled={!speaker || setMute.isPending}
                  onCheckedChange={(checked) => setMute.mutate(checked)}
                />
              </FieldContent>
            </Field>
            <FieldDescription>
              Direct audio API — no on-screen volume popup.
            </FieldDescription>
          </div>

          <Separator />

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Channel
            </span>
            <div className="ml-auto flex items-center gap-2">
              <RemoteButton
                code="ChannelDown"
                label="Channel down"
                icon={ChevronsDown}
                onPress={press}
                pendingCode={pendingCode}
              />
              <RemoteButton
                code="GGuide"
                label="Guide"
                icon={Menu}
                onPress={press}
                pendingCode={pendingCode}
              />
              <RemoteButton
                code="ChannelUp"
                label="Channel up"
                icon={ChevronsUp}
                onPress={press}
                pendingCode={pendingCode}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Navigate</CardTitle>
          <CardDescription>D-pad, confirm and system keys</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="mx-auto grid w-fit grid-cols-3 gap-2">
            <span />
            <RemoteButton
              code="Up"
              label="Up"
              icon={ChevronUp}
              size="icon-lg"
              onPress={press}
              pendingCode={pendingCode}
            />
            <span />
            <RemoteButton
              code="Left"
              label="Left"
              icon={ChevronLeft}
              size="icon-lg"
              onPress={press}
              pendingCode={pendingCode}
            />
            <RemoteButton
              code="Confirm"
              label="Confirm"
              icon={Check}
              size="icon-lg"
              variant="default"
              onPress={press}
              pendingCode={pendingCode}
            />
            <RemoteButton
              code="Right"
              label="Right"
              icon={ChevronRight}
              size="icon-lg"
              onPress={press}
              pendingCode={pendingCode}
            />
            <span />
            <RemoteButton
              code="Down"
              label="Down"
              icon={ChevronDown}
              size="icon-lg"
              onPress={press}
              pendingCode={pendingCode}
            />
            <span />
          </div>

          <div className="flex items-center justify-center gap-2">
            <RemoteButton
              code="Return"
              label="Back"
              icon={ArrowLeft}
              onPress={press}
              pendingCode={pendingCode}
            />
            <RemoteButton
              code="Home"
              label="Home"
              icon={Home}
              onPress={press}
              pendingCode={pendingCode}
            />
            <RemoteButton
              code="Options"
              label="Options"
              icon={Menu}
              onPress={press}
              pendingCode={pendingCode}
            />
            <RemoteButton
              code="Exit"
              label="Exit"
              icon={ArrowLeft}
              onPress={press}
              pendingCode={pendingCode}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Text entry</CardTitle>
          <CardDescription>
            Type with your keyboard, then send to the focused field
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              if (text.trim() && !sendText.isPending) {
                sendText.mutate(text, { onSuccess: () => setText("") })
              }
            }}
          >
            <Field>
              <FieldLabel htmlFor="bravia-text">Text for TV</FieldLabel>
              <div className="flex gap-2">
                <Input
                  id="bravia-text"
                  placeholder="https://…"
                  autoComplete="off"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <Button
                  type="submit"
                  disabled={!text.trim() || sendText.isPending}
                >
                  {sendText.isPending ? (
                    <Spinner data-icon="inline-start" />
                  ) : null}
                  Send
                </Button>
              </div>
              <FieldDescription>
                First select the URL bar on the TV and press Confirm so the text
                field is focused.
              </FieldDescription>
            </Field>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Numbers</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                "Num1",
                "Num2",
                "Num3",
                "Num4",
                "Num5",
                "Num6",
                "Num7",
                "Num8",
                "Num9",
                "Num0",
                "Enter",
                "DOT",
              ] as IrccCodeName[]
            ).map((code) => (
              <Button
                key={code}
                variant="outline"
                disabled={pendingCode !== null}
                onClick={() => press(code)}
              >
                {pendingCode === code ? (
                  <Spinner data-icon="inline-start" />
                ) : null}
                {code.replace("Num", "")}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inputs &amp; sources</CardTitle>
          <CardDescription>
            Like the top-left button on the physical remote
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="default"
              size="sm"
              disabled={pendingCode !== null}
              onClick={() => press("Input")}
            >
              {pendingCode === "Input" ? (
                <Spinner data-icon="inline-start" />
              ) : null}
              Inputs…
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pendingCode !== null}
              onClick={() => press("Tv")}
            >
              TV
            </Button>
          </div>

          <Separator />

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Tuner (tv:dvbt / tv:dvbs)
            </span>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { code: "Digital", label: "Digital TV" },
                  { code: "TvSatellite", label: "Satellite" },
                  { code: "TvAntennaCable", label: "Cable" },
                  { code: "Analog", label: "Analog" },
                ] as { code: IrccCodeName; label: string }[]
              ).map(({ code, label }) => (
                <Button
                  key={code}
                  variant="secondary"
                  size="sm"
                  disabled={pendingCode !== null}
                  onClick={() => press(code)}
                >
                  {pendingCode === code ? (
                    <Spinner data-icon="inline-start" />
                  ) : null}
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              HDMI (extInput:hdmi)
            </span>
            <div className="flex flex-wrap gap-2">
              {(["Hdmi1", "Hdmi2", "Hdmi3", "Hdmi4"] as IrccCodeName[]).map(
                (code) => (
                  <Button
                    key={code}
                    variant="secondary"
                    size="sm"
                    disabled={pendingCode !== null}
                    onClick={() => press(code)}
                  >
                    {pendingCode === code ? (
                      <Spinner data-icon="inline-start" />
                    ) : null}
                    {code}
                  </Button>
                )
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Streaming
            </span>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { code: "Netflix", label: "Netflix" },
                  { code: "GooglePlay", label: "Play Store" },
                  { code: "FeaturedApp", label: "Apps" },
                  { code: "Media", label: "Media" },
                ] as { code: IrccCodeName; label: string }[]
              ).map(({ code, label }) => (
                <Button
                  key={code}
                  variant="secondary"
                  size="sm"
                  disabled={pendingCode !== null}
                  onClick={() => press(code)}
                >
                  {pendingCode === code ? (
                    <Spinner data-icon="inline-start" />
                  ) : null}
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
