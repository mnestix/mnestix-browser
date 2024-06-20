#!/bin/sh
SCRIPT_DIR=$(dirname "$0")
# Render Mnestix Logo
cat "$SCRIPT_DIR/lib/mnestix-logo.txt"

HOSTNAME=0.0.0.0 PORT=3000 node server.js