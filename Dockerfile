# Two-stage build. The final image needs full node_modules (not just
# production deps) because this project runs its custom server and
# server-side modules directly via `tsx` rather than a compiled bundle.

FROM node:20-bookworm-slim AS builder
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
# `next build` pre-renders dynamic routes (news/podcasts slugs) via
# generateStaticParams, which queries Prisma directly at build time.
# Render's Docker build step doesn't inject the service's runtime env
# vars, so give the build its own throwaway migrated (but empty) SQLite
# db just so those build-time queries succeed instead of throwing. It's
# discarded — the runner stage creates and seeds the real one on boot.
ENV DATABASE_URL="file:./prisma/build.db"
RUN npx prisma migrate deploy
RUN npm run build
RUN rm -f prisma/build.db prisma/build.db-journal

FROM node:20-bookworm-slim AS runner
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/package.json ./package.json

# Render injects PORT; the app already reads process.env.PORT.
# Disk is ephemeral, so the SQLite file is (re)created and seeded on every
# container start, not baked into the image at build time.
CMD ["sh", "-c", "npx prisma migrate deploy && npx tsx prisma/seed.ts && npm run start"]
