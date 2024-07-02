#!/bin/bash

# Copy assets from src to app/assets
docker-compose exec android-build bash -c /app/scripts/copy_assets.sh

docker-compose exec android-build bash -c ./build.sh
# Check if ADB server is running and restart if necessary
adb kill-server
adb start-server

# Wait for any device to be connected
adb devices
adb wait-for-device

# Install the APK
adb install -r app/build/outputs/apk/debug/app-debug.apk
