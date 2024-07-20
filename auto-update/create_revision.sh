#!/bin/bash
echo "const sha1=\"$(git rev-parse HEAD)\";" > auto-update/public/revision.js
