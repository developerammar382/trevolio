#!/bin/bash

# Laravel Queue Worker Stopper Script

cd "$(dirname "$0")"

if [ ! -f queue-worker.pid ]; then
    echo "❌ No queue worker PID file found"
    echo "Queue worker may not be running"
    exit 1
fi

PID=$(cat queue-worker.pid)

if ps -p $PID > /dev/null 2>&1; then
    echo "🛑 Stopping queue worker (PID: $PID)..."
    kill $PID
    rm queue-worker.pid
    echo "✅ Queue worker stopped successfully!"
else
    echo "⚠️  Process $PID is not running"
    rm queue-worker.pid
    echo "Cleaned up PID file"
fi
