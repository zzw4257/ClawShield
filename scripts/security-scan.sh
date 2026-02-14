#!/usr/bin/env bash
set -euo pipefail

if command -v gitleaks >/dev/null 2>&1; then
  echo "[security:scan] using local gitleaks"
  gitleaks git . --config .gitleaks.toml --redact --exit-code 1 --no-banner
  exit 0
fi

if command -v docker >/dev/null 2>&1; then
  echo "[security:scan] using dockerized gitleaks"
  docker run --rm -v "$PWD:/repo" zricethezav/gitleaks:latest git \
    /repo \
    --config /repo/.gitleaks.toml \
    --redact \
    --exit-code 1 \
    --no-banner
  exit 0
fi

echo "[security:scan] gitleaks not found; downloading portable binary"
OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"
case "$ARCH" in
  x86_64) ARCH="x64" ;;
  arm64|aarch64) ARCH="arm64" ;;
esac

VERSION="8.24.2"
TMP_DIR="$(mktemp -d)"
ARCHIVE="${TMP_DIR}/gitleaks.tar.gz"
URL="https://github.com/gitleaks/gitleaks/releases/download/v${VERSION}/gitleaks_${VERSION}_${OS}_${ARCH}.tar.gz"

curl -sSL "$URL" -o "$ARCHIVE"
tar -xzf "$ARCHIVE" -C "$TMP_DIR" gitleaks
"$TMP_DIR/gitleaks" git . --config .gitleaks.toml --redact --exit-code 1 --no-banner
