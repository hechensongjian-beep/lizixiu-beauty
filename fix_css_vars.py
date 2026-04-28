#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复无效 CSS 变量语法：var(-xxx) → var(--xxx)
"""

import os
import re
from pathlib import Path

BASE_DIR = Path(r"C:\Users\cdl83\.qclaw\workspace\lizixiu-beauty\app")

# 匹配 var(-xxx) 但不是 var(--xxx) 的模式
PATTERN = re.compile(r'var\(-([a-z][a-z0-9-]*)\)')

def fix_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        # 替换 var(-xxx) → var(--xxx)
        matches = PATTERN.findall(content)
        if matches:
            for match in set(matches):
                old = f'var(-{match})'
                new = f'var(--{match})'
                content = content.replace(old, new)
                print(f"  {filepath.name}: {old} → {new}")
        
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Error: {filepath} - {e}")
        return False

def main():
    print("修复无效 CSS 变量语法...")
    print()
    
    tsx_files = list(BASE_DIR.rglob("*.tsx"))
    fixed_count = 0
    
    for filepath in tsx_files:
        if fix_file(filepath):
            fixed_count += 1
    
    print()
    print(f"修复了 {fixed_count} 个文件")

if __name__ == "__main__":
    main()
