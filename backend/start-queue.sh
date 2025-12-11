#!/bin/bash

# Laravel Queue Worker Starter Script
# This script starts the queue worker in the background

cd "$(dirname "$0")"

# Check if queue worker is already running
if [ -f queue-worker.pid ]; then
    PID=$(cat queue-worker.pid)
    if ps -p $PID > /dev/null 2>&1; then
        echo "⚠️  Queue worker is already running (PID: $PID)"
        echo "To stop it, run: kill $PID"
        exit 1
    fi
fi

# Start queue worker in background
echo "🚀 Starting Laravel queue worker..."
nohup php artisan queue:work --tries=3 --timeout=60 > storage/logs/queue-worker.log 2>&1 &

# Save PID
echo $! > queue-worker.pid

echo "✅ Queue worker started successfully!"
echo "📝 PID: $!"
echo "📄 Logs: storage/logs/queue-worker.log"
echo ""
echo "To stop the worker, run:"
echo "  kill \$(cat queue-worker.pid)"
echo "  rm queue-worker.pid"
