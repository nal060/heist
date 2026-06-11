# syntax=docker/dockerfile:1

# ── Stage 1: install dependencies ─────────────────────────────────────────────
# Isolated layer so npm ci only re-runs when package.json/lock changes.
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# --legacy-peer-deps mirrors CI: react-native-reanimated 4.x has peer conflicts
# with React 19 that npm 10 rejects by default.
# HUSKY=0 prevents the prepare script from trying to run husky (no .git in build context).
RUN HUSKY=0 npm ci --legacy-peer-deps

# ── Stage 2: runtime image ─────────────────────────────────────────────────────
# node:20-slim (Debian) not alpine — native modules and @expo/ngrok-bin-linux-x64
# are compiled against glibc; alpine's musl libc would break them.
FROM node:20-slim
WORKDIR /app

# git is required by Expo SDK internals at startup.
RUN apt-get update && apt-get install -y --no-install-recommends git \
    && rm -rf /var/lib/apt/lists/*

# Copy Linux-native node_modules from the deps stage.
# Do NOT overwrite these with host node_modules — see docker-compose.yml volumes.
COPY --from=deps /app/node_modules ./node_modules

COPY . .

EXPOSE 8081

# Tunnel mode: ngrok exposes Metro publicly so Expo Go on any device can scan the QR code.
# --non-interactive disables the Expo CLI interactive prompt (no guaranteed TTY in all envs).
CMD ["sh", "-c", "HUSKY=0 npx expo start --tunnel --port 8081 --non-interactive"]
