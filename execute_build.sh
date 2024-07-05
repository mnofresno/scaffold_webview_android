#!/bin/bash

docker-compose up -d

docker-compose exec android-build yarn install
docker-compose exec android-build yarn run build
docker-compose exec android-build ./gradlew assembleDebug
adb kill-server
adb start-server
adb devices
adb wait-for-device
adb install -r android/build/outputs/apk/debug/android-debug.apk
