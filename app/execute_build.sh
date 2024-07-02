#!/bin/bash

cd /app
./gradlew assembleDebug

# Get the IP address of the Docker host
HOST_IP=$(ip route | awk 'NR==1 {print $3}')

# Check if ADB server is running and restart if necessary
adb kill-server
adb start-server

# Wait for any device to be connected
adb connect $HOST_IP:5037
adb wait-for-device

# Install the APK
adb install -r /app/app/build/outputs/apk/debug/app-debug.apk
