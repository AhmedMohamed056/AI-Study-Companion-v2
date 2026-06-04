@echo off
REM Start both backend and frontend

echo.
echo ========================================
echo Starting StudyAI Development Servers
echo ========================================
echo.

REM Start backend in new window
echo [1/2] Starting Backend on http://localhost:3000
start cmd /k "cd backend && npm run dev"

REM Wait 3 seconds for backend to start
timeout /t 3 /nobreak

REM Start frontend in new window
echo [2/2] Starting Frontend on http://localhost:5173
start cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo Both servers starting!
echo ========================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5173
echo.
pause
