@echo off
echo Clearing Metro bundler cache...
cd /d "%~dp0"
rmdir /s /q .expo 2>nul
rmdir /s /q node_modules\.cache 2>nul
echo Cache cleared!
echo.
echo Now run: npx expo start -c
pause
