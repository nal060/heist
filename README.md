# Heist

Surplus food marketplace for Latin America. Users discover and reserve surprise bags of unsold food from local businesses at a discount.

## Tech Stack

- **Expo SDK 54** / React Native 0.81 / React 19
- **TypeScript 5.9** (strict mode)
- **Expo Router v6** (file-based routing)
- **React Context** for state management

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Expo Go](https://expo.dev/go) app on your phone (iOS or Android)

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npx expo start
```

Scan the QR code with your phone camera (iOS) or Expo Go app (Android).

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
