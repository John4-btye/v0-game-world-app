#!/bin/bash
cd /vercel/share/v0-project/scripts
if [ ! -f "pyproject.toml" ]; then
  uv init --bare .
  uv add Pillow numpy
fi
uv run remove_bg.py
