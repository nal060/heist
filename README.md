# Heist

Surplus food marketplace for Latin America. Users discover and reserve surprise bags of unsold food from local businesses at a discount.

## Tech Stack

- **Expo SDK 54** / React Native 0.81 / React 19
- **TypeScript 5.9** (strict mode)
- **Expo Router v6** (file-based routing)
- **React Context** for state management

## Getting Started

### Option A: Docker (recommended — no Node.js required)

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) only.

```bash
# First run: build the image and start the web dev server
docker compose up --build

# Subsequent runs
docker compose up
```

Open **http://localhost:8081** in a browser. Metro hot reload works automatically on file save.

Rebuild after `package.json` / `package-lock.json` changes:
```bash
docker compose up --build
```

One-off commands (lint, typecheck):
```bash
docker compose run --rm app npx tsc --noEmit
docker compose run --rm app npm run lint
```

**Mobile device (tunnel mode):** scan the QR code with [Expo Go](https://expo.dev/go) — `@expo/ngrok` is already a dependency so no extra install is needed:
```bash
docker compose run --rm app npx expo start --tunnel --non-interactive
```

### Option B: Native (required for iOS/Android simulator)

Requires Node.js 20+, plus Xcode (iOS) or Android Studio (Android).

```bash
npm install --legacy-peer-deps
npx expo start
```

Scan the QR code with your phone camera (iOS) or Expo Go app (Android).

### Environment

Copy `.env.example` to `.env` and fill in the Supabase credentials (ask the team for the values):
```bash
cp .env.example .env
```

| Works in Docker | Requires native setup |
|---|---|
| Web dev (`expo start --web`) | iOS Simulator (`npm run ios`) |
| Typecheck, lint | Android Emulator (`npm run android`) |
| Supabase JS (hosted) | EAS / Xcode builds |
| Tunnel mode for physical devices | |

## Project Structure

```
app/                  # Expo Router file-based routes
  (tabs)/             # Bottom tab screens (Descubrir, Buscar, Favoritos, Perfil)
  bag/[id].tsx        # Bag detail
  checkout/[bagId].tsx
  order-confirmation/[orderId].tsx
  settings.tsx
  order-history.tsx

src/
  components/         # Reusable UI components
  theme/              # Colors, typography, spacing, shadows
  types/              # TypeScript interfaces
  constants/          # Spanish strings, category definitions
  data/               # Mock data and accessor functions
  context/            # React Context providers
  utils/              # Formatting helpers
```

## Notes

- All UI text is in Spanish
- Currently uses mock data (no backend connection)
- The `inspo/` folder (if present locally) is gitignored — reference screenshots, not part of the app
