#!/bin/bash
$ANDROID_HOME/build-tools/$BUILD_TOOLS_VERSION/aapt dump badging ./build/outputs/apk/debug/android-debug.apk | awk -v FS="'" '/package: name=/{print $2}'
