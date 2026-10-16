export const DEFAULT_BRAVIA_HOST = "192.168.1.2"

const HOST_STORAGE_KEY = "bravia.host"
const PSK_STORAGE_KEY = "bravia.psk"

const ENV_HOST = import.meta.env.VITE_BRAVIA_HOST?.trim() || DEFAULT_BRAVIA_HOST
const ENV_PSK = import.meta.env.VITE_BRAVIA_PSK ?? ""

export type BraviaConfig = {
  host: string
  psk: string
}

export function loadBraviaConfig(): BraviaConfig {
  const storedHost =
    typeof localStorage !== "undefined"
      ? localStorage.getItem(HOST_STORAGE_KEY)
      : null
  const storedPsk =
    typeof localStorage !== "undefined"
      ? localStorage.getItem(PSK_STORAGE_KEY)
      : null
  const host = (storedHost ?? ENV_HOST).trim() || DEFAULT_BRAVIA_HOST
  const psk = storedPsk ?? ENV_PSK
  return { host, psk }
}

export function saveBraviaConfig(config: BraviaConfig): void {
  localStorage.setItem(HOST_STORAGE_KEY, config.host.trim())
  localStorage.setItem(PSK_STORAGE_KEY, config.psk)
}

function baseUrl(host: string): string {
  const trimmed = host.trim().replace(/\/+$/, "")
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `http://${trimmed}`
}

export class BraviaError extends Error {
  code?: number | string
  status?: number
  constructor(
    message: string,
    opts?: { code?: number | string; status?: number }
  ) {
    super(message)
    this.name = "BraviaError"
    this.code = opts?.code
    this.status = opts?.status
  }
}

type SonyService = "system" | "audio" | "avContent" | "appControl"

type SonyRpcResponse<T> = {
  result?: T
  error?: [number, string]
  id: number
}

async function sonyRpc<T>(
  service: SonyService,
  method: string,
  params: unknown[] = [],
  version = "1.0",
  config: BraviaConfig,
  timeoutMs = 8000
): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    if (config.psk) headers["X-Auth-PSK"] = config.psk
    const res = await fetch(`${baseUrl(config.host)}/sony/${service}`, {
      method: "POST",
      headers,
      body: JSON.stringify({ method, id: 1, params, version }),
      signal: controller.signal,
    })
    if (!res.ok) {
      throw new BraviaError(`HTTP ${res.status} for ${method}`, {
        status: res.status,
      })
    }
    const data = (await res.json()) as SonyRpcResponse<T>
    if (data.error) {
      throw new BraviaError(`${method}: ${data.error[1]}`, {
        code: data.error[0],
        status: res.status,
      })
    }
    return data.result as T
  } catch (err) {
    if (err instanceof BraviaError) throw err
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new BraviaError(`Timed out reaching ${config.host}`)
    }
    throw new BraviaError(
      err instanceof Error ? err.message : "Unknown network error"
    )
  } finally {
    clearTimeout(timer)
  }
}

/** Full IRCC code table from getRemoteControllerInfo on KD-49X8305C (117 codes). */
export const IRCC_CODES = {
  Num1: "AAAAAQAAAAEAAAAAAw==",
  Num2: "AAAAAQAAAAEAAAABAw==",
  Num3: "AAAAAQAAAAEAAAACAw==",
  Num4: "AAAAAQAAAAEAAAADAw==",
  Num5: "AAAAAQAAAAEAAAAEAw==",
  Num6: "AAAAAQAAAAEAAAAFAw==",
  Num7: "AAAAAQAAAAEAAAAGAw==",
  Num8: "AAAAAQAAAAEAAAAHAw==",
  Num9: "AAAAAQAAAAEAAAAIAw==",
  Num0: "AAAAAQAAAAEAAAAJAw==",
  Num11: "AAAAAQAAAAEAAAAKAw==",
  Num12: "AAAAAQAAAAEAAAALAw==",
  Enter: "AAAAAQAAAAEAAAALAw==",
  GGuide: "AAAAAQAAAAEAAAAOAw==",
  ChannelUp: "AAAAAQAAAAEAAAAQAw==",
  ChannelDown: "AAAAAQAAAAEAAAARAw==",
  VolumeUp: "AAAAAQAAAAEAAAASAw==",
  VolumeDown: "AAAAAQAAAAEAAAATAw==",
  Mute: "AAAAAQAAAAEAAAAUAw==",
  TvPower: "AAAAAQAAAAEAAAAVAw==",
  Audio: "AAAAAQAAAAEAAAAXAw==",
  MediaAudioTrack: "AAAAAQAAAAEAAAAXAw==",
  Tv: "AAAAAQAAAAEAAAAkAw==",
  Input: "AAAAAQAAAAEAAAAlAw==",
  TvInput: "AAAAAQAAAAEAAAAlAw==",
  TvAntennaCable: "AAAAAQAAAAEAAAAqAw==",
  WakeUp: "AAAAAQAAAAEAAAAuAw==",
  PowerOff: "AAAAAQAAAAEAAAAvAw==",
  Sleep: "AAAAAQAAAAEAAAAvAw==",
  Right: "AAAAAQAAAAEAAAAzAw==",
  Left: "AAAAAQAAAAEAAAA0Aw==",
  SleepTimer: "AAAAAQAAAAEAAAA2Aw==",
  Analog2: "AAAAAQAAAAEAAAA4Aw==",
  TvAnalog: "AAAAAQAAAAEAAAA4Aw==",
  Display: "AAAAAQAAAAEAAAA6Aw==",
  Jump: "AAAAAQAAAAEAAAA7Aw==",
  PicOff: "AAAAAQAAAAEAAAA+Aw==",
  PictureOff: "AAAAAQAAAAEAAAA+Aw==",
  Teletext: "AAAAAQAAAAEAAAA/Aw==",
  Video1: "AAAAAQAAAAEAAABAAw==",
  Video2: "AAAAAQAAAAEAAABBAw==",
  AnalogRgb1: "AAAAAQAAAAEAAABDAw==",
  Home: "AAAAAQAAAAEAAABgAw==",
  Exit: "AAAAAQAAAAEAAABjAw==",
  PictureMode: "AAAAAQAAAAEAAABkAw==",
  Confirm: "AAAAAQAAAAEAAABlAw==",
  Up: "AAAAAQAAAAEAAAB0Aw==",
  Down: "AAAAAQAAAAEAAAB1Aw==",
  ClosedCaption: "AAAAAgAAAKQAAAAQAw==",
  Component1: "AAAAAgAAAKQAAAA2Aw==",
  Component2: "AAAAAgAAAKQAAAA3Aw==",
  Wide: "AAAAAgAAAKQAAAA9Aw==",
  EPG: "AAAAAgAAAKQAAABbAw==",
  PAP: "AAAAAgAAAKQAAAB3Aw==",
  TenKey: "AAAAAgAAAJcAAAAMAw==",
  BSCS: "AAAAAgAAAJcAAAAQAw==",
  Ddata: "AAAAAgAAAJcAAAAVAw==",
  Stop: "AAAAAgAAAJcAAAAYAw==",
  Pause: "AAAAAgAAAJcAAAAZAw==",
  Play: "AAAAAgAAAJcAAAAaAw==",
  Rewind: "AAAAAgAAAJcAAAAbAw==",
  Forward: "AAAAAgAAAJcAAAAcAw==",
  DOT: "AAAAAgAAAJcAAAAdAw==",
  Rec: "AAAAAgAAAJcAAAAgAw==",
  Return: "AAAAAgAAAJcAAAAjAw==",
  Blue: "AAAAAgAAAJcAAAAkAw==",
  Red: "AAAAAgAAAJcAAAAlAw==",
  Green: "AAAAAgAAAJcAAAAmAw==",
  Yellow: "AAAAAgAAAJcAAAAnAw==",
  SubTitle: "AAAAAgAAAJcAAAAoAw==",
  CS: "AAAAAgAAAJcAAAArAw==",
  BS: "AAAAAgAAAJcAAAAsAw==",
  Digital: "AAAAAgAAAJcAAAAyAw==",
  Options: "AAAAAgAAAJcAAAA2Aw==",
  Media: "AAAAAgAAAJcAAAA4Aw==",
  Prev: "AAAAAgAAAJcAAAA8Aw==",
  Next: "AAAAAgAAAJcAAAA9Aw==",
  DpadCenter: "AAAAAgAAAJcAAABKAw==",
  CursorUp: "AAAAAgAAAJcAAABPAw==",
  CursorDown: "AAAAAgAAAJcAAABQAw==",
  CursorLeft: "AAAAAgAAAJcAAABNAw==",
  CursorRight: "AAAAAgAAAJcAAABOAw==",
  ShopRemoteControlForcedDynamic: "AAAAAgAAAJcAAABqAw==",
  FlashPlus: "AAAAAgAAAJcAAAB4Aw==",
  FlashMinus: "AAAAAgAAAJcAAAB5Aw==",
  DemoMode: "AAAAAgAAAJcAAAB8Aw==",
  Analog: "AAAAAgAAAHcAAAANAw==",
  Mode3D: "AAAAAgAAAHcAAABNAw==",
  DigitalToggle: "AAAAAgAAAHcAAABSAw==",
  DemoSurround: "AAAAAgAAAHcAAAB7Aw==",
  AD: "AAAAAgAAABoAAAA7Aw==",
  AudioMixUp: "AAAAAgAAABoAAAA8Aw==",
  AudioMixDown: "AAAAAgAAABoAAAA9Aw==",
  PhotoFrame: "AAAAAgAAABoAAABVAw==",
  Tv_Radio: "AAAAAgAAABoAAABXAw==",
  SyncMenu: "AAAAAgAAABoAAABYAw==",
  Hdmi1: "AAAAAgAAABoAAABaAw==",
  Hdmi2: "AAAAAgAAABoAAABbAw==",
  Hdmi3: "AAAAAgAAABoAAABcAw==",
  Hdmi4: "AAAAAgAAABoAAABdAw==",
  TopMenu: "AAAAAgAAABoAAABgAw==",
  PopUpMenu: "AAAAAgAAABoAAABhAw==",
  OneTouchTimeRec: "AAAAAgAAABoAAABkAw==",
  OneTouchView: "AAAAAgAAABoAAABlAw==",
  DUX: "AAAAAgAAABoAAABzAw==",
  FootballMode: "AAAAAgAAABoAAAB2Aw==",
  iManual: "AAAAAgAAABoAAAB7Aw==",
  Netflix: "AAAAAgAAABoAAAB8Aw==",
  Assists: "AAAAAgAAAMQAAAA7Aw==",
  FeaturedApp: "AAAAAgAAAMQAAABEAw==",
  FeaturedAppVOD: "AAAAAgAAAMQAAABFAw==",
  GooglePlay: "AAAAAgAAAMQAAABGAw==",
  ActionMenu: "AAAAAgAAAMQAAABLAw==",
  Help: "AAAAAgAAAMQAAABNAw==",
  TvSatellite: "AAAAAgAAAMQAAABOAw==",
  WirelessSubwoofer: "AAAAAgAAAMQAAAB+Aw==",
  AndroidMenu: "AAAAAgAAAMQAAABPAw==",
} as const

export type IrccCodeName = keyof typeof IRCC_CODES

export async function sendIrcc(
  name: IrccCodeName,
  config: BraviaConfig,
  timeoutMs = 8000
): Promise<void> {
  const code = IRCC_CODES[name]
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    // SOAPACTION must be a plain header; fetch lowercases it fine.
    const res = await fetch(`${baseUrl(config.host)}/sony/IRCC`, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=UTF-8",
        SOAPACTION: '"urn:schemas-sony-com:service:IRCC:1#X_SendIRCC"',
        ...(config.psk ? { "X-Auth-PSK": config.psk } : {}),
      },
      body: `<?xml version="1.0"?><s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"><s:Body><u:X_SendIRCC xmlns:u="urn:schemas-sony-com:service:IRCC:1"><IRCCCode>${code}</IRCCCode></u:X_SendIRCC></s:Body></s:Envelope>`,
      signal: controller.signal,
    })
    if (res.status === 403) {
      throw new BraviaError(
        "TV rejected IRCC (403). Set Settings → Network → Home network → IP Control → Pre-Shared Key on the TV and enter it below.",
        { status: 403 }
      )
    }
    if (!res.ok) {
      throw new BraviaError(`IRCC ${name} failed: HTTP ${res.status}`, {
        status: res.status,
      })
    }
  } catch (err) {
    if (err instanceof BraviaError) throw err
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new BraviaError(`Timed out reaching ${config.host}`)
    }
    throw new BraviaError(
      err instanceof Error ? err.message : "Unknown network error"
    )
  } finally {
    clearTimeout(timer)
  }
}

export type PowerStatus = { status: string }

export function getPowerStatus(config: BraviaConfig) {
  return sonyRpc<PowerStatus[]>("system", "getPowerStatus", [], "1.0", config)
}

export type VolumeInfo = {
  target: string
  volume: number
  mute: boolean
  maxVolume: number
  minVolume: number
}

export function getVolumeInformation(config: BraviaConfig) {
  return sonyRpc<VolumeInfo[][]>(
    "audio",
    "getVolumeInformation",
    [],
    "1.0",
    config
  )
}

export function setAudioVolume(config: BraviaConfig, volume: number) {
  return sonyRpc<[]>(
    "audio",
    "setAudioVolume",
    [{ target: "speaker", volume: String(Math.round(volume)) }],
    "1.0",
    config
  )
}

export function setAudioMute(config: BraviaConfig, mute: boolean) {
  return sonyRpc<[]>("audio", "setAudioMute", [{ status: mute }], "1.0", config)
}

export type RemoteControlEntry = { name: string; value: string }

export function getRemoteControllerInfo(config: BraviaConfig) {
  return sonyRpc<[unknown, RemoteControlEntry[]]>(
    "system",
    "getRemoteControllerInfo",
    [],
    "1.0",
    config
  )
}

export type AppEntry = {
  title: string
  uri: string
  icon?: string
  data?: string
}

export function getApplicationList(config: BraviaConfig) {
  return sonyRpc<AppEntry[][]>(
    "appControl",
    "getApplicationList",
    [],
    "1.0",
    config
  )
}

export function setActiveApp(config: BraviaConfig, uri: string) {
  return sonyRpc<[]>(
    "appControl",
    "setActiveApp",
    [{ uri, data: "" }],
    "1.0",
    config
  )
}

export function terminateApps(config: BraviaConfig) {
  return sonyRpc<[]>("appControl", "terminateApps", [], "1.0", config)
}

export function setTextForm(config: BraviaConfig, text: string) {
  return sonyRpc<number>("appControl", "setTextForm", [text], "1.0", config)
}
