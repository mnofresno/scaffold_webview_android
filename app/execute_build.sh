#!/bin/bash

cd /app
./gradlew assembleDebug

# Check if ADB server is running and restart if necessary
adb kill-server
adb start-server

# Wait for any device to be connected
adb wait-for-device

# Install the APK
adb install -r /app/app/build/outputs/apk/debug/app-debug.apk
