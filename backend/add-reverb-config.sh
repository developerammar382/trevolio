#!/bin/bash

# Add Reverb configuration to .env
cat >> .env << 'EOF'

# Broadcasting & Reverb Configuration
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=a3c2a5ed6fc0f227
REVERB_APP_KEY=54beebf3104f217582d2dfb39545fd28
REVERB_APP_SECRET=f77436dd30bac7441d7442eb2fc50bd0
REVERB_HOST=0.0.0.0
REVERB_PORT=8080
REVERB_SCHEME=http

# Vite Reverb Configuration (for frontend)
VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
EOF

echo "Reverb configuration added to .env"
