@echo off
REM Diagnostic script to verify backend and frontend are running

echo.
echo ========================================
echo StudyAI System Diagnostics
echo ========================================
echo.

REM Test Backend
echo [1/3] Testing Backend Connection...
curl -s http://localhost:3000/api/health >nul 2>&1
if %errorlevel% equ 0 (
  echo ✓ Backend is running on http://localhost:3000
  curl -s http://localhost:3000/api/health
) else (
  echo ✗ Backend is NOT running on http://localhost:3000
  echo   Start it with: cd backend ^&^& npm run dev
)

echo.

REM Test Frontend
echo [2/3] Testing Frontend...
curl -s http://localhost:5173 >nul 2>&1
if %errorlevel% equ 0 (
  echo ✓ Frontend is running on http://localhost:5173
) else (
  echo ✗ Frontend is NOT running on http://localhost:5173
  echo   Start it with: cd frontend ^&^& npm run dev
)

echo.

REM Test Port Availability
echo [3/3] Checking Port Availability...
netstat -ano | findstr :3000 >nul 2>&1
if %errorlevel% equ 0 (
  echo ✓ Port 3000 is in use (backend)
) else (
  echo ✗ Port 3000 is available (backend not running)
)

netstat -ano | findstr :5173 >nul 2>&1
if %errorlevel% equ 0 (
  echo ✓ Port 5173 is in use (frontend)
) else (
  echo ✗ Port 5173 is available (frontend not running)
)

echo.
echo ========================================
echo Summary
echo ========================================
echo.
echo Backend URL:  http://localhost:3000/api
echo Frontend URL: http://localhost:5173
echo.
echo Next Steps:
echo 1. If backend or frontend shows ✗, start them:
echo    - cd backend ^&^& npm run dev
echo    - cd frontend ^&^& npm run dev
echo 2. Open http://localhost:5173 in your browser
echo 3. Check browser console (F12) for connection status
echo.
pause
