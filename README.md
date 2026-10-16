# bravia-remote

Web remote control for Sony Bravia TVs over the local network. Built with
React + TypeScript + Vite + shadcn/ui + TanStack Query. No backend required —
the browser talks to the TV directly.

Developed and tested against a **KD-49X8305C (BRAVIA 4K 2015, Android 7,
API generation 3.9.0)** at `192.168.1.2`, discovered via Avahi/mDNS.

## Features

- **Remote** — D-pad + Confirm, Back/Home/Options/Exit, transport keys,
  channel up/down + guide, number pad
- **Power & volume** — status badge, direct volume slider + mute switch
  (`/sony/audio`, no on-screen popup) alongside classic IRCC keys
- **Text entry** — type URLs / search terms with your keyboard, send via
  `setTextForm` to the focused field on the TV
- **Inputs & sources** — `Inputs…` OSD picker plus direct codes: Digital TV
  (`tv:dvbt`), Satellite (`tv:dvbs`), Cable, Analog, Hdmi1-4, Netflix,
  Play Store, streaming apps
- **Apps** — installed-app list (`getApplicationList`), launch, terminate-all
- **Settings** — TV host + pre-shared key, light/dark/system theme,
  compact/wide layout, all persisted locally

## Requirements

- TV and this device on the **same LAN** (the app calls
  `http://<tv-ip>/sony/*` straight from the browser)
- A pre-shared key set on the TV for anything that changes state
  (key presses, volume set, app launch). Reads — power status, volume info,
  remote-code table — work without one.

TV setup (2015 models):
`Settings → Network → Home Network Setup → IP Control → Authentication →
Normal and Pre-Shared Key`, then set a `Pre-Shared Key` (e.g. `0`).

## Quick start

```bash
npm install
cp .env.example .env.local
# edit .env.local:
#   VITE_BRAVIA_HOST=192.168.1.2
#   VITE_BRAVIA_PSK=0
npm run dev
```

Open the printed `http://localhost:5173` URL from a device on the same LAN.
Host/PSK can also be edited in the app under Settings; saved values in
`localStorage` override the `.env.local` pre-fill. Restart the dev server
after changing `.env.local` (Vite bakes `VITE_*` vars at startup).

## Scripts

| Command          | What it does              |
| ---------------- | ------------------------- |
| `npm run dev`    | Start the dev server      |
| `npm run build`  | Type-check + production build |
| `npm run preview`| Preview the production build |
| `npm run lint`   | ESLint                    |
| `npm run typecheck` | `tsc --noEmit`         |
| `npm run format` | Prettier write            |

## How it works

| Plane | Endpoint | Used for |
| ----- | -------- | -------- |
| Sony JSON-RPC | `POST http://<tv>/sony/system|audio|appControl|avContent` | power/volume status, direct volume, app list/launch, text entry |
| Sony IRCC (SOAP) | `POST http://<tv>/sony/IRCC` + `X-Auth-PSK` | all 117 remote keys from `getRemoteControllerInfo` |
| Avahi/mDNS | `_rfb._tcp` (5900), `_androidtvremote2._tcp` (6466), `_googlecast._tcp` (8009) | discovery |

Authenticated calls send `X-Auth-PSK`. The TV answers CORS preflights for
`localhost`, so no proxy is needed. IRCC without a valid PSK returns
`403`; `setTextForm` with no focused field returns error `7` (surfaced as a
hint to focus the URL bar first).

Other planes on this TV are intentionally out of scope: VNC `:5900`
(no auth, needs a `websockify` bridge for browsers), AndroidTV Remote2
`:6466/:6467` (TLS + pairing, needs a gateway for live keyboard), ADB
`:5555`, Cast `:8008/:8009`.

## Project layout

```
src/
  lib/bravia.ts            # Sony client: RPC, IRCC, IRCC_CODES, env/localStorage config
  hooks/use-bravia.ts      # React Query: power, volume, apps, text, IRCC mutations
  hooks/use-app-layout.ts  # compact/wide layout preference
  components/
    app-sidebar.tsx        # Remote / Apps / Settings navigation
    bravia-remote.tsx      # remote-control page
    apps-panel.tsx         # app launcher page
    connection-settings.tsx# host + PSK form
    appearance-settings.tsx# theme + layout
```

## Troubleshooting

- **403 on key presses** — set the PSK on the TV and enter the same value in
  Settings (or `.env.local`).
- **TV unreachable** — confirm the IP (Avahi: `avahi-browse -rv _rfb._tcp`),
  same subnet, TV powered on / network standby enabled.
- **Text send says nothing is focused** — highlight the URL/search field on
  the TV and press Confirm first.
