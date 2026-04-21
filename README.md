# Atlestismo

## Local (Postgres en Docker)

1. Configura tu `.env` (puedes copiar de `.env.example`)
2. Levanta la base de datos y aplica el esquema:
   - `npm run db:init`
3. Inicia la web:
   - `npm run dev`

Adminer (UI de la base de datos):
- `http://localhost:8080`
- Server: `db`
- User/Password/DB: los de tu `.env`

