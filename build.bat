@echo off
echo Building...
cmd /c "npx electron-builder --win"
echo Compressing...
node zip.js
echo Done
pause