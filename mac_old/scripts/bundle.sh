#!/bin/bash
set -euo pipefail

APP_NAME="FileGuilei"
BUILD_DIR="$(dirname "$0")/.."
OUTPUT_DIR="${BUILD_DIR}/build"
APP_BUNDLE="${OUTPUT_DIR}/${APP_NAME}.app"

echo "Building ${APP_NAME} (release)..."
cd "${BUILD_DIR}"
swift build -c release

echo "Creating app bundle..."
rm -rf "${APP_BUNDLE}"
mkdir -p "${APP_BUNDLE}/Contents/MacOS"
mkdir -p "${APP_BUNDLE}/Contents/Resources"

cp ".build/release/${APP_NAME}" "${APP_BUNDLE}/Contents/MacOS/"
cp "Resources/Info.plist" "${APP_BUNDLE}/Contents/"

echo "Signing..."
codesign --force --sign - "${APP_BUNDLE}"

echo "Done: ${APP_BUNDLE}"
