#!/usr/bin/env bash
# Creates throw-away ES256 keys for the docker compose api profile in .secrets/ (gitignored). Never use them outside your laptop.
set -euo pipefail
cd "$(dirname "$0")/../.."
mkdir -p .secrets && chmod 700 .secrets
[ -f .secrets/jwt_private.pem ] && { echo ".secrets/jwt_private.pem already exists"; exit 0; }
openssl genpkey -algorithm EC -pkeyopt ec_paramgen_curve:P-256 -out .secrets/jwt_private.pem
openssl pkey -in .secrets/jwt_private.pem -pubout -out .secrets/jwt_public.pem
# The api container runs as a non-root user and reads the secret files.
chmod 644 .secrets/jwt_private.pem .secrets/jwt_public.pem
echo "Wrote .secrets/jwt_private.pem and .secrets/jwt_public.pem"
