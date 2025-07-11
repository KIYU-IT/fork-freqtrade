#!/bin/bash

# Kill any existing process on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Wait a moment for port to be released
sleep 2

# Start the development server
echo "Starting development server on port 3000..."
npm run dev