#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
扫描全站英文错误提示
"""

import os
import re
from pathlib import Path

BASE_DIR = Path(r"C:\Users\cdl83\.qclaw\workspace\lizixiu-beauty\app")

patterns = [
    r"text:\s*['\"]Error",
    r"message:\s*['\"]Error",
    r"alert\(['\"]Error",
    r"throw new Error\(['\"]",
]

issues = []

def scan_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        rel_path = os.path.relpath(filepath, BASE_DIR.parent)
        
        for i, line in enumerate(lines, 1):
            for pattern in patterns:
                if re.search(pattern, line, re.IGNORECASE):
                    issues.append(f"{rel_path}:{i}: {line.strip()[:80]}")
                    break
    except Exception as e:
        pass

def main():
    tsx_files = list(BASE_DIR.rglob("*.tsx")) + list(BASE_DIR.rglob("*.ts"))
    
    for filepath in tsx_files:
        scan_file(filepath)
    
    if issues:
        print("发现英文错误提示：")
        for issue in issues:
            print(f"  {issue}")
    else:
        print("未发现英文错误提示")

if __name__ == "__main__":
    main()
