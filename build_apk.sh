#!/bin/bash

cd "$(dirname "$0")"

IMAGE_NAME="ghcr.io/mnofresno/cordova-build-yarn-webpack:3.0.0"
CONTAINER_NAME="android-build"
WORKING_DIR="/app"
APK_PATH="platforms/android/app/build/outputs/apk/debug/app-debug.apk"
APK_PATH_INSIDE_CONTAINER="/app/$APK_PATH"
./auto-update/create_revision.sh

run_docker_command() {
  docker exec $CONTAINER_NAME "$@"
}
docker run -d --name $CONTAINER_NAME \
    --workdir $WORKING_DIR \
    -v $(pwd):/app \
    -e ANDROID_HOME=/usr/local/android-sdk \
    --network host \
    -e BUILD_TOOLS_VERSION="34.0.0" \
    $IMAGE_NAME tail -f /dev/null

run_docker_command cp google-services.json platforms/android/app/

PACKAGE_NAME=$(run_docker_command /app/get_package_name.sh "$APK_PATH_INSIDE_CONTAINER" | tr -d '\r')
MAIN_ACTIVITY="$PACKAGE_NAME/.MainActivity"

run_docker_command yarn install
run_docker_command yarn build

if [ -f "$APK_PATH" ]; then
  run_docker_command rm "$APK_PATH_INSIDE_CONTAINER"
fi
run_docker_command cordova prepare
run_docker_command cordova platform add android
run_docker_command cordova build android

while [[ "$#" -gt 0 ]]; do
  case $1 in
    --deploy) DEPLOY=true ;;
    --reset-after-run) RESET_AFTER_RUN=true ;;
    *) echo "Unknown parameter passed: $1"; exit 1 ;;
  esac
  shift
done

if [ ! -f "$APK_PATH" ]; then
  echo "APK file not found!"
  exit 1
fi

APK_SIZE=$(stat -c%s "$APK_PATH")
MIN_SIZE=$((1 * 1024 * 1024))
if [ "$APK_SIZE" -lt "$MIN_SIZE" ]; then
  echo "APK file size is less than 1 MB: ${APK_SIZE} bytes"
  exit 1
else
  echo "APK file size is sufficient: ${APK_SIZE} bytes"
fi

if [ "$DEPLOY" = true ]; then
  adb kill-server
  adb start-server
  adb devices
  adb wait-for-device
  adb uninstall "$PACKAGE_NAME"
  echo "Installing $MAIN_ACTIVITY"
  adb install -r "$APK_PATH"
  adb shell am start -n "$MAIN_ACTIVITY"
fi

if [ "$RESET_AFTER_RUN" = true ]; then
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
fi
