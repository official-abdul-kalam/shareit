@echo off
title ShareIt - OruzenLab Edition
color 0B
cls

echo.
echo  ================================================================
echo.
echo      SSSSS  H   H  AAAAA  RRRRR  EEEEE  IIIII  TTTTT
echo     S       H   H  A   A  R   R  E        I      T
echo      SSSSS  H   H  AAAAA  RRRRR  EEEEE    I      T
echo          S  H   H  A   A  R  R   E        I      T
echo      SSSSS  H   H  A   A  R   R  EEEEE  IIIII    T
echo.
echo  ================================================================
echo           POWERED BY ORUZENLAB  |  LOCAL FILE SHARING
echo  ================================================================
echo.

echo  [INFO] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Python is not installed! Please install Python to run this app.
    pause
    exit
)

echo  [INFO] Checking dependencies...
pip install -r requirements.txt >nul 2>&1
if %errorlevel% neq 0 (
    echo  [WARNING] Could not install dependencies automatically.
    echo  [INFO] Attempting to run anyway...
) else (
    echo  [SUCCESS] Dependencies are ready.
)

echo.
echo  [START] Launching ShareIt Server...
echo  [INFO] Your browser should open automatically.
echo  [INFO] Connect other devices using the QR code on the screen.
echo.
echo  Press Ctrl+C to stop the server.
echo.

python app.py

pause
