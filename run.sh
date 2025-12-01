#!/bin/bash

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

clear

echo -e "${CYAN}"
echo " ================================================================"
echo ""
echo "     SSSSS  H   H  AAAAA  RRRRR  EEEEE  IIIII  TTTTT"
echo "    S       H   H  A   A  R   R  E        I      T"
echo "     SSSSS  H   H  AAAAA  RRRRR  EEEEE    I      T"
echo "         S  H   H  A   A  R  R   E        I      T"
echo "     SSSSS  H   H  A   A  R   R  EEEEE  IIIII    T"
echo ""
echo " ================================================================"
echo "          POWERED BY ORUZENLAB  |  LOCAL FILE SHARING"
echo " ================================================================"
echo -e "${NC}"

echo -e "[INFO] Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}[ERROR] Python3 is not installed!${NC}"
    exit 1
fi

echo -e "[INFO] Checking dependencies..."
pip3 install -r requirements.txt > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}[SUCCESS] Dependencies are ready.${NC}"
else
    echo -e "${RED}[WARNING] Failed to install dependencies. Trying to run anyway...${NC}"
fi

echo ""
echo -e "${GREEN}[START] Launching ShareIt Server...${NC}"
echo -e "[INFO] Your browser should open automatically."
echo ""

python3 app.py
