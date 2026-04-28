#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
全站扫描 var(-xxx) 无效语法（包括 app 和 components）
"""

import os
import re
from pathlib import Path

BASE_DIR = Path(r"C:\Users\cdl83\.qclaw\workspace\lizixiu-beauty")

# 匹配 var(-xxx) 但不是 var(--xxx) 的模式
PATTERN = re.compile(r'var\(-([a-z][a-z0-9-]*)\)')

def scan_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        matches = PATTERN.findall(content)
        if matches:
            rel_path = os.path.relpath(filepath, BASE_DIR)
            for match in set(matches):
                print(f"{rel_path}: var(-{match})")
    except Exception as e:
        pass

def main():
    print("扫描无效 CSS 变量语法 var(-xxx)...")
    print()
    
    # 扫描 app 和 components 目录
    for pattern in ["**/*.tsx", "**/*.ts", "**/*.css"]:
        for filepath in BASE_DIR.glob(pattern):
            if "node_modules" in str(filepath) or ".next" in str(filepath):
                continue
            scan_file(filepath)

if __name__ == "__main__":
    main()
