#!/bin/bash

# Path to the source image
SOURCE_IMAGE="icon_for_webview.webp"

# Destination directories
DEST_DIRS=("android/src/main/res/mipmap-mdpi"
           "android/src/main/res/mipmap-hdpi"
           "android/src/main/res/mipmap-xhdpi"
           "android/src/main/res/mipmap-xxhdpi"
           "android/src/main/res/mipmap-xxxhdpi")

# Create directories if they don't exist
for dir in "${DEST_DIRS[@]}"; do
    mkdir -p $dir
done

# Resize and copy the images
convert $SOURCE_IMAGE -resize 48x48 android/src/main/res/mipmap-mdpi/ic_launcher.png
convert $SOURCE_IMAGE -resize 48x48 android/src/main/res/mipmap-mdpi/ic_launcher_round.png

convert $SOURCE_IMAGE -resize 72x72 android/src/main/res/mipmap-hdpi/ic_launcher.png
convert $SOURCE_IMAGE -resize 72x72 android/src/main/res/mipmap-hdpi/ic_launcher_round.png

convert $SOURCE_IMAGE -resize 96x96 android/src/main/res/mipmap-xhdpi/ic_launcher.png
convert $SOURCE_IMAGE -resize 96x96 android/src/main/res/mipmap-xhdpi/ic_launcher_round.png

convert $SOURCE_IMAGE -resize 144x144 android/src/main/res/mipmap-xxhdpi/ic_launcher.png
convert $SOURCE_IMAGE -resize 144x144 android/src/main/res/mipmap-xxhdpi/ic_launcher_round.png

convert $SOURCE_IMAGE -resize 192x192 android/src/main/res/mipmap-xxxhdpi/ic_launcher.png
convert $SOURCE_IMAGE -resize 192x192 android/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png

echo "Icons generated and copied to respective directories."
