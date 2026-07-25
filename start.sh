#!/bin/bash

# Navigate to script directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

echo "🚀 Starting CLM Backend (FastAPI)..."
cd "$DIR/backend"
source venv/bin/activate
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!

echo "🚀 Starting CLM Frontend (Vite)..."
cd "$DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo "✅ Backend running on http://localhost:8000 (PID: $BACKEND_PID)"
echo "✅ Frontend running on http://localhost:5173 (PID: $FRONTEND_PID)"

wait $BACKEND_PID $FRONTEND_PID
