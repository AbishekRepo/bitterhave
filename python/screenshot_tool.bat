@echo off
REM Screenshot Tool Launcher
REM This runs the Python script hidden without a console window

REM Change this to the full path of your Python script
set SCRIPT_PATH=%~dp0screen_index.py

REM Run Python script hidden (no console window)
start /B pythonw "%SCRIPT_PATH%"

REM Alternative if pythonw doesn't work:
REM powershell -WindowStyle Hidden -Command "python '%SCRIPT_PATH%'"