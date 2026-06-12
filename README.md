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

The app runs on physical devices over **tunnel mode** — scan the QR code with [Expo Go](https://expo.dev/go). `@expo/ngrok` is already a dependency, so no extra install is needed.

```bash
# First run: build the image and start Metro in tunnel mode
docker compose run --rm app npx expo start --tunnel

# Rebuild after package.json / package-lock.json changes
docker compose build
```

Scan the QR code with Expo Go. Metro hot reload works automatically on file save.

One-off commands (lint, typecheck):
```bash
docker compose run --rm app npx tsc --noEmit
docker compose run --rm app npm run lint
```

### Option B: Native (required for iOS/Android simulator)

Requires Node.js 20+, plus Xcode (iOS) or Android Studio (Android).

```bash
npm install --legacy-peer-deps
npx expo start --tunnel
```

Scan the QR code with the Expo Go app on your device.

### Environment

Copy `.env.example` to `.env` and fill in the Supabase credentials (ask the team for the values):
```bash
cp .env.example .env
```

| Works in Docker | Requires native setup |
|---|---|
| Tunnel mode for physical devices | iOS Simulator (`npm run ios`) |
| Typecheck, lint | Android Emulator (`npm run android`) |
| Supabase JS (hosted) | EAS / Xcode builds |

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
