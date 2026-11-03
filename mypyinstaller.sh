#!/bin/sh

folder1="./build"
folder2="./dist"
file1="./webserver.spec"

if [ -d "$folder1" ]; then
	rm -rf "$folder1"
fi

if [ -d "$folder2" ]; then
	rm -rf "$folder2"
fi

if [ -f "$file1" ]; then
	rm -f "$file1"
fi

python_ok() {
    command -v "$1" >/dev/null 2>&1 || return 1
    "$1" -c 'import sys; sys.exit(0 if sys.version_info >= (3, 10) else 1)' >/dev/null 2>&1
}

PYTHON_CMD=""

if [ -n "$PYTHON" ]; then
    # 1. Explicit override
    if python_ok "$PYTHON"; then
        PYTHON_CMD="$PYTHON"
    else
        echo "ERROR: '$PYTHON' was not found or is older than Python 3.10."
        exit 1
    fi

elif [ -n "$VIRTUAL_ENV" ]; then
    # 2. Active virtual environment (venv / virtualenv)
    for candidate in \
        "$VIRTUAL_ENV/bin/python" \
        "$VIRTUAL_ENV/bin/python3" \
        "$VIRTUAL_ENV/Scripts/python.exe"
    do
        if [ -x "$candidate" ]; then
            if python_ok "$candidate"; then
                PYTHON_CMD="$candidate"
                break
            else
                echo "ERROR: The active virtual environment ($VIRTUAL_ENV)"
                echo "       uses Python older than 3.10."
                exit 1
            fi
        fi
    done

    if [ -z "$PYTHON_CMD" ]; then
        echo "ERROR: VIRTUAL_ENV is set ($VIRTUAL_ENV) but no Python executable was found in it."
        exit 1
    fi

else
    # 3. System Python, in priority order
    for candidate in python python3.10 python3; do
        if python_ok "$candidate"; then
            PYTHON_CMD="$candidate"
            break
        fi
    done
fi

if [ -z "$PYTHON_CMD" ]; then
    echo "ERROR: Python 3.10 or newer was not found."
    exit 1
fi

"$PYTHON_CMD" -m pip install --upgrade pillow
"$PYTHON_CMD" -m pip install --upgrade pyinstaller


pyinstaller \
--hidden-import json \
--hidden-import urllib \
--hidden-import collections \
--hidden-import PIL \
--onefile webserver.py
