@echo off
setlocal

set "folderToDelete1=.\build"
set "folderToDelete2=.\dist"
set "fileToDelete1=.\*.spec"

if exist "%folderToDelete1%" (
    rmdir /s /q "%folderToDelete1%"
    if errorlevel 1 (
        echo Error occurred while deleting the folder.
    )
)

if exist "%folderToDelete2%" (
    rmdir /s /q "%folderToDelete2%"
    if errorlevel 1 (
        echo Error occurred while deleting the folder.
    )
)

if exist "%fileToDelete1%" (
    del /s /q "%fileToDelete1%"
    if errorlevel 1 (
        echo Error occurred while deleting the file.
    )
)

set "PYTHON_CMD="
set "PY_EXE="

if defined PYTHON goto :use_override
if defined VIRTUAL_ENV goto :use_venv
goto :use_system

:use_override
call :python_ok "%PYTHON%"
if errorlevel 1 goto :err_override
set "PYTHON_CMD=%PYTHON%"
goto :python_found

:err_override
echo.
echo ERROR: "%PYTHON%" was not found or is older than Python 3.10.
goto :fail

:use_venv
set "VENV_PY=%VIRTUAL_ENV%\Scripts\python.exe"
if not exist "%VENV_PY%" goto :err_venv_missing
call :python_ok "%VENV_PY%"
if errorlevel 1 goto :err_venv_old
set "PYTHON_CMD=%VENV_PY%"
goto :python_found

:err_venv_missing
echo.
echo ERROR: VIRTUAL_ENV is set but no python.exe was found in:
echo        %VIRTUAL_ENV%\Scripts
goto :fail

:err_venv_old
echo.
echo ERROR: The active virtual environment uses Python older than 3.10:
echo        %VIRTUAL_ENV%
goto :fail

:use_system
for %%C in (python python3) do (
    if not defined PYTHON_CMD (
        call :python_ok "%%C"
        if not errorlevel 1 set "PYTHON_CMD=%%C"
    )
)
if defined PYTHON_CMD goto :python_found

rem Fall back to the Windows "py" launcher
where py >nul 2>&1
if errorlevel 1 goto :err_no_python
for /f "usebackq delims=" %%P in (`py -3 -c "import sys; print(sys.executable)" 2^>nul`) do set "PY_EXE=%%P"
if not defined PY_EXE goto :err_no_python
call :python_ok "%PY_EXE%"
if errorlevel 1 goto :err_no_python
set "PYTHON_CMD=%PY_EXE%"
goto :python_found

:err_no_python
echo.
echo ERROR: Python 3.10 or newer was not found.
goto :fail

:python_found

echo.
echo Using Python:
"%PYTHON_CMD%" --version
if errorlevel 1 goto :fail

rem ----------------------------------------------------------------------
rem Python runtime detection
rem ----------------------------------------------------------------------
echo.
echo ========================
echo Python runtime detection
echo ========================
"%PYTHON_CMD%" -c "import os, platform, sys; print('Operating system : ' + platform.system()); print('Architecture     : ' + platform.machine()); print('Python executable: ' + os.path.realpath(sys.executable)); sys.exit(0 if platform.system() == 'Windows' else 1)"
if errorlevel 1 goto :err_not_windows
goto :platform_ok

:err_not_windows
echo.
echo ERROR: This script builds the Windows wheel and must run on Windows.
echo        Use pypi_setup.sh on Linux, Termux and macOS.
goto :fail

:platform_ok

"%PYTHON_CMD%" -m pip install pillow
"%PYTHON_CMD%" -m pip install pyinstaller

pyinstaller ^
--hidden-import json ^
--hidden-import urllib ^
--hidden-import collections ^
--hidden-import PIL ^
--onefile webserver.py

:python_ok
"%~1" -c "import sys; sys.exit(0 if sys.version_info >= (3, 10) else 1)" >nul 2>&1
exit /b %errorlevel%
