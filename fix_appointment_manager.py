#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复 components/AppointmentManager.tsx 中的无效 CSS 变量
"""

import re

FILE_PATH = r"C:\Users\cdl83\.qclaw\workspace\lizixiu-beauty\components\AppointmentManager.tsx"

PATTERN = re.compile(r'var\(-([a-z][a-z0-9-]*)\)')

def main():
    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    matches = PATTERN.findall(content)
    for match in set(matches):
        old = f'var(-{match})'
        new = f'var(--{match})'
        content = content.replace(old, new)
        print(f"替换: {old} → {new}")
    
    if content != original:
        with open(FILE_PATH, 'w', encoding='utf-8') as f:
            f.write(content)
        print("修复完成")
    else:
        print("无需修改")

if __name__ == "__main__":
    main()
