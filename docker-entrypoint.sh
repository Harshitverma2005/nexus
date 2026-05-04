#!/bin/sh
set -eu

# Postgres can be "healthy" before Django can migrate; retry briefly.
n=0
until python manage.py migrate --noinput; do
  n=$((n + 1))
  if [ "$n" -ge 60 ]; then
    echo "ERROR: migrations failed after ${n} attempts — fix DB connection or migration errors." >&2
    exit 1
  fi
  echo "Waiting for database / migrations (${n}/60)..."
  sleep 1
done

exec python manage.py runserver 0.0.0.0:8000
