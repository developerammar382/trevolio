#!/bin/bash

# Backup the .env file
cp .env .env.backup

# Remove all BROADCAST_CONNECTION and REVERB lines
sed -i.tmp '/^BROADCAST_CONNECTION=/d' .env
sed -i.tmp '/^REVERB_/d' .env
sed -i.tmp '/^VITE_REVERB_/d' .env

# Add the correct configuration at the end
cat >> .env << 'EOF'

# Broadcasting & Reverb Configuration
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=a3c2a5ed6fc0f227
REVERB_APP_KEY=54beebf3104f217582d2dfb39545fd28
REVERB_APP_SECRET=f77436dd30bac7441d7442eb2fc50bd0
REVERB_HOST=0.0.0.0
REVERB_PORT=8080
REVERB_SCHEME=http

VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
EOF

# Remove temporary file
rm -f .env.tmp

echo "✅ Fixed .env configuration"
echo "📋 Backup saved to .env.backup"
