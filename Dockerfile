# ── Etapa 1: build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar manifiestos de dependencias
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Instalar dependencias (incluye devDeps para el build)
RUN pnpm install --frozen-lockfile

# Copiar el resto del proyecto
COPY . .

# Build de Astro
RUN pnpm run build

# ── Etapa 2: runtime ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

RUN npm install -g pnpm

# Solo los manifiestos para instalar dependencias de producción
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Artefactos del build
COPY --from=builder /app/dist ./dist

# Scripts y archivos necesarios en runtime
COPY scripts/ ./scripts/
COPY schema.sql ./schema.sql
COPY data/ ./data/

# Entrypoint
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Cloud Run usa el puerto 8080 por defecto
ENV HOST=0.0.0.0
ENV PORT=8080

EXPOSE 8080

ENTRYPOINT ["./entrypoint.sh"]