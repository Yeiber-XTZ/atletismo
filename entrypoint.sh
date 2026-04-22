#!/bin/sh
set -e

echo ">>> Aplicando schema y seed..."
USE_LOCAL_DB=true node scripts/db-init.mjs

echo ">>> Creando/actualizando superusuario..."
node scripts/create-superuser.mjs

echo ">>> Iniciando servidor Astro..."
exec node ./dist/server/entry.mjs