#!/bin/bash

echo "Copiying assets into apk dir..."
# Define source and destination directories
SRC_DIR=./src
DEST_DIR=./android/src/main/assets/

# Create the destination directory if it doesn't exist
mkdir -p $DEST_DIR

# Copy all files and directories from SRC_DIR to DEST_DIR
cp -r $SRC_DIR/* $DEST_DIR/
