#!/bin/bash

SOURCE_ICON_IMAGE="icon_v2.webp"

ICON_DEST_DIRS=("android/src/main/res/mipmap-mdpi"
           "android/src/main/res/mipmap-hdpi"
           "android/src/main/res/mipmap-xhdpi"
           "android/src/main/res/mipmap-xxhdpi"
           "android/src/main/res/mipmap-xxxhdpi")

for dir in "${ICON_DEST_DIRS[@]}"; do
    mkdir -p $dir
done

convert $SOURCE_ICON_IMAGE -resize 48x48 android/src/main/res/mipmap-mdpi/ic_launcher.png
convert $SOURCE_ICON_IMAGE -resize 48x48 android/src/main/res/mipmap-mdpi/ic_launcher_round.png

convert $SOURCE_ICON_IMAGE -resize 72x72 android/src/main/res/mipmap-hdpi/ic_launcher.png
convert $SOURCE_ICON_IMAGE -resize 72x72 android/src/main/res/mipmap-hdpi/ic_launcher_round.png

convert $SOURCE_ICON_IMAGE -resize 96x96 android/src/main/res/mipmap-xhdpi/ic_launcher.png
convert $SOURCE_ICON_IMAGE -resize 96x96 android/src/main/res/mipmap-xhdpi/ic_launcher_round.png

convert $SOURCE_ICON_IMAGE -resize 144x144 android/src/main/res/mipmap-xxhdpi/ic_launcher.png
convert $SOURCE_ICON_IMAGE -resize 144x144 android/src/main/res/mipmap-xxhdpi/ic_launcher_round.png

convert $SOURCE_ICON_IMAGE -resize 192x192 android/src/main/res/mipmap-xxxhdpi/ic_launcher.png
convert $SOURCE_ICON_IMAGE -resize 192x192 android/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png

echo "Icons generated and copied to respective directories."

SOURCE_SPLASH_IMAGE="splash.webp"

DEST_SPLASH_DIR="resources/android/splash"

mkdir -p $DEST_SPLASH_DIR

convert $SOURCE_SPLASH_IMAGE -resize 320x480^ -gravity center -extent 320x480 $DEST_SPLASH_DIR/splash-mdpi.png
convert $SOURCE_SPLASH_IMAGE -resize 480x800^ -gravity center -extent 480x800 $DEST_SPLASH_DIR/splash-hdpi.png
convert $SOURCE_SPLASH_IMAGE -resize 720x1280^ -gravity center -extent 720x1280 $DEST_SPLASH_DIR/splash-xhdpi.png
convert $SOURCE_SPLASH_IMAGE -resize 960x1600^ -gravity center -extent 960x1600 $DEST_SPLASH_DIR/splash-xxhdpi.png
convert $SOURCE_SPLASH_IMAGE -resize 1280x1920^ -gravity center -extent 1280x1920 $DEST_SPLASH_DIR/splash-xxxhdpi.png

echo "Android splash screens generated and copied to $DEST_SPLASH_DIR."
