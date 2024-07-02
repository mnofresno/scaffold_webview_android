#!/bin/bash

# Path to the source image
SOURCE_IMAGE="icon_for_webview.webp"

# Destination directories
DEST_DIRS=("app/src/main/res/mipmap-mdpi"
           "app/src/main/res/mipmap-hdpi"
           "app/src/main/res/mipmap-xhdpi"
           "app/src/main/res/mipmap-xxhdpi"
           "app/src/main/res/mipmap-xxxhdpi")

# Create directories if they don't exist
for dir in "${DEST_DIRS[@]}"; do
    mkdir -p $dir
done

# Resize and copy the images
convert $SOURCE_IMAGE -resize 48x48 app/src/main/res/mipmap-mdpi/ic_launcher.png
convert $SOURCE_IMAGE -resize 48x48 app/src/main/res/mipmap-mdpi/ic_launcher_round.png

convert $SOURCE_IMAGE -resize 72x72 app/src/main/res/mipmap-hdpi/ic_launcher.png
convert $SOURCE_IMAGE -resize 72x72 app/src/main/res/mipmap-hdpi/ic_launcher_round.png

convert $SOURCE_IMAGE -resize 96x96 app/src/main/res/mipmap-xhdpi/ic_launcher.png
convert $SOURCE_IMAGE -resize 96x96 app/src/main/res/mipmap-xhdpi/ic_launcher_round.png

convert $SOURCE_IMAGE -resize 144x144 app/src/main/res/mipmap-xxhdpi/ic_launcher.png
convert $SOURCE_IMAGE -resize 144x144 app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png

convert $SOURCE_IMAGE -resize 192x192 app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
convert $SOURCE_IMAGE -resize 192x192 app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png

echo "Icons generated and copied to respective directories."
