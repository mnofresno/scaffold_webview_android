#!/bin/bash
$ANDROID_HOME/build-tools/$BUILD_TOOLS_VERSION/aapt dump badging $1 | awk -v FS="'" '/package: name=/{print $2}'
