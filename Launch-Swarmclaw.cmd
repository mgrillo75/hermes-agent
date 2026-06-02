@echo off
setlocal EnableExtensions

set "ROOT=%~dp0"
set "BACKEND_PORT=9119"
set "FRONTEND_PORT=5174"
set "BACKEND_URL=http://127.0.0.1:%BACKEND_PORT%"
set "SWARMCLAW_URL=http://127.0.0.1:%FRONTEND_PORT%/swarmclaw.html"

echo.
echo Hermes Swarmclaw launcher
echo Repo: %ROOT%
echo.

call :ResolveHermes
if errorlevel 1 exit /b 1

call :IsPortListening %BACKEND_PORT%
if errorlevel 1 (
  echo Starting backend on %BACKEND_URL% ...
  start "Hermes Swarmclaw Backend" cmd /k "cd /d ""%ROOT%"" && ""%HERMES_EXE%"" dashboard --no-open --port %BACKEND_PORT%"
) else (
  echo Backend already listening on %BACKEND_URL%.
)

call :WaitForPort %BACKEND_PORT% "backend"
if errorlevel 1 exit /b 1

call :IsPortListening %FRONTEND_PORT%
if errorlevel 1 (
  echo Starting frontend on http://127.0.0.1:%FRONTEND_PORT% ...
  start "Hermes Swarmclaw Frontend" cmd /k "cd /d ""%ROOT%web"" && set ""HERMES_DASHBOARD_URL=%BACKEND_URL%"" && npm.cmd run dev -- --host 127.0.0.1 --port %FRONTEND_PORT% --strictPort"
) else (
  echo Frontend already listening on http://127.0.0.1:%FRONTEND_PORT%.
)

call :WaitForPort %FRONTEND_PORT% "frontend"
if errorlevel 1 exit /b 1

call :WaitForUrl "%SWARMCLAW_URL%" "Swarmclaw page"
if errorlevel 1 exit /b 1

echo.
echo Opening %SWARMCLAW_URL%
start "" "%SWARMCLAW_URL%"
echo.
echo Ready. Leave the backend/frontend windows open while using Swarmclaw.
exit /b 0

:ResolveHermes
set "HERMES_EXE=%ROOT%.venv\Scripts\hermes.exe"
if exist "%HERMES_EXE%" exit /b 0

set "HERMES_EXE="
for /f "delims=" %%H in ('where hermes 2^>nul') do (
  if not defined HERMES_EXE set "HERMES_EXE=%%H"
)

if defined HERMES_EXE exit /b 0

echo ERROR: Could not find hermes.exe.
echo Expected %ROOT%.venv\Scripts\hermes.exe or a hermes command on PATH.
exit /b 1

:IsPortListening
powershell -NoProfile -ExecutionPolicy Bypass -Command "if (Get-NetTCPConnection -LocalPort %~1 -State Listen -ErrorAction SilentlyContinue) { exit 0 } exit 1"
exit /b %ERRORLEVEL%

:WaitForPort
set "WAIT_PORT=%~1"
set "WAIT_NAME=%~2"
for /l %%I in (1,1,45) do (
  call :IsPortListening %WAIT_PORT%
  if not errorlevel 1 (
    echo %WAIT_NAME% is listening on port %WAIT_PORT%.
    exit /b 0
  )
  timeout /t 1 /nobreak >nul
)

echo ERROR: Timed out waiting for %WAIT_NAME% on port %WAIT_PORT%.
exit /b 1

:WaitForUrl
set "WAIT_URL=%~1"
set "WAIT_LABEL=%~2"
for /l %%I in (1,1,30) do (
  powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $res = Invoke-WebRequest -Uri '%WAIT_URL%' -UseBasicParsing -TimeoutSec 2; if ($res.StatusCode -ge 200 -and $res.StatusCode -lt 400) { exit 0 } } catch { }; exit 1"
  if not errorlevel 1 (
    echo %WAIT_LABEL% is responding at %WAIT_URL%.
    exit /b 0
  )
  timeout /t 1 /nobreak >nul
)

echo ERROR: Timed out waiting for %WAIT_LABEL% at %WAIT_URL%.
exit /b 1
