#!/bin/bash

# Start Laravel Reverb WebSocket Server
echo "Starting Laravel Reverb WebSocket server..."
php artisan reverb:start --host=0.0.0.0 --port=8080
