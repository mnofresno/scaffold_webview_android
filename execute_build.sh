#!/bin/bash

docker-compose up -d

echo "Copiying assets into apk dir..."
# Define source and destination directories
SRC_DIR=./src
DEST_DIR=./android/src/main/assets/

# Create the destination directory if it doesn't exist
mkdir -p $DEST_DIR

# Copy all files and directories from SRC_DIR to DEST_DIR
cp -r $SRC_DIR/* $DEST_DIR/

# Instala dependencias
docker-compose exec android-build bash -c "cd /app && yarn install"

# Construye el proyecto usando Gradle
docker-compose exec android-build ./gradlew assembleDebug


# Comprueba si el servidor ADB está funcionando y reinícialo si es necesario
adb kill-server
adb start-server

# Espera a que cualquier dispositivo esté conectado
adb devices
adb wait-for-device

# Install the APK
adb install -r android/build/outputs/apk/debug/android-debug.apk
