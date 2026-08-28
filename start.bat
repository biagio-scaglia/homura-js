@echo off
setlocal enabledelayedexpansion
title HomuraJS — Interactive State & History Engine Launcher

:MENU
cls
echo ======================================================================
echo    HOMURAJS -- Time Travel State ^& History Engine for JavaScript
echo                     "Git for application state"
echo ======================================================================
echo.
echo   [1] Mini RPG Inventory Showcase (Hero stats, Backpack, Shop, DevTools)
echo   [2] Interactive Playground (Full DAG Visualizer, State Tree, Diff)
echo   [3] React 18+ Demo (useHomura Hook + Floating DevTools)
echo   [4] Vue 3 Demo (Composition API + DevTools)
echo   [5] Vanilla JS Demo (bindState Two-Way DOM sync)
echo   [6] Run Complete Vitest Test Suite (38 tests)
echo   [7] Run Full Build and TypeScript Typecheck
echo   [0] Exit
echo.
echo ======================================================================
set /p CHOICE="Select an option (0-7): "

if "%CHOICE%"=="1" goto RPG
if "%CHOICE%"=="2" goto PLAYGROUND
if "%CHOICE%"=="3" goto REACT
if "%CHOICE%"=="4" goto VUE
if "%CHOICE%"=="5" goto VANILLA
if "%CHOICE%"=="6" goto TEST
if "%CHOICE%"=="7" goto BUILD
if "%CHOICE%"=="0" goto EXIT

echo.
echo [!] Invalid selection. Please choose a number from 0 to 7.
timeout /t 2 >nul
goto MENU

:RPG
cls
echo ======================================================================
echo  Launching Mini RPG Inventory Showcase...
echo  Local server: http://localhost:5173
echo ======================================================================
echo.
start http://localhost:5173
call pnpm --filter "@homurajs/example-rpg-inventory" run dev
pause
goto MENU

:PLAYGROUND
cls
echo ======================================================================
echo  Launching Interactive Playground...
echo  Local server: http://localhost:5173
echo ======================================================================
echo.
start http://localhost:5173
call pnpm --filter "@homurajs/playground" run dev
pause
goto MENU

:REACT
cls
echo ======================================================================
echo  Launching React 18+ Demo...
echo  Local server: http://localhost:5173
echo ======================================================================
echo.
start http://localhost:5173
call pnpm --filter "@homurajs/example-react" run dev
pause
goto MENU

:VUE
cls
echo ======================================================================
echo  Launching Vue 3 Demo...
echo  Local server: http://localhost:5173
echo ======================================================================
echo.
start http://localhost:5173
call pnpm --filter "@homurajs/example-vue" run dev
pause
goto MENU

:VANILLA
cls
echo ======================================================================
echo  Launching Vanilla JS Demo...
echo  Local server: http://localhost:5173
echo ======================================================================
echo.
start http://localhost:5173
call pnpm --filter "@homurajs/example-vanilla" run dev
pause
goto MENU

:TEST
cls
echo ======================================================================
echo  Running Vitest Test Suite across all packages...
echo ======================================================================
echo.
call pnpm test
echo.
pause
goto MENU

:BUILD
cls
echo ======================================================================
echo  Running TypeScript Typecheck and Monorepo Build...
echo ======================================================================
echo.
call pnpm tsc --noEmit
if %errorlevel% neq 0 (
  echo [!] TypeScript check failed!
  pause
  goto MENU
)
call pnpm build
echo.
echo [OK] Full build completed successfully!
pause
goto MENU

:EXIT
cls
echo.
echo Thank you for using HomuraJS! Time flows forward...
timeout /t 2 >nul
exit /b 0
