# ── Etapa 1: build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app
RUN apk add --no-cache postgresql-client python3 py3-pip
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# ── Etapa 2: runtime ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache postgresql-client python3 py3-pip  # ✅ ya lo tenías
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/dist ./dist

COPY scripts/ ./scripts/
COPY schema.sql ./schema.sql
COPY data/ ./data/
COPY seeds/ ./seeds/

# ── Instalar dependencias Python del seed ─────────────────────────────────────
# Solo si seeds/ tiene requirements.txt; si no, omite esta línea
RUN pip install --no-cache-dir --break-system-packages -r seeds/requirements.txt 2>/dev/null || true
# ─────────────────────────────────────────────────────────────────────────────

COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

ENV HOST=0.0.0.0
ENV PORT=8080

EXPOSE 8080

ENTRYPOINT ["./entrypoint.sh"]