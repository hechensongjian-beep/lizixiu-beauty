#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复 admin/staff/page.tsx 中的英文错误提示
"""

FILE_PATH = r"C:\Users\cdl83\.qclaw\workspace\lizixiu-beauty\app\admin\staff\page.tsx"

replacements = [
    (
        "setMsg({ type: 'error', text: 'Error: ' + e.message });",
        "setMsg({ type: 'error', text: '操作失败：' + e.message });"
    ),
]

def main():
    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    for old, new in replacements:
        if old in content:
            content = content.replace(old, new)
            print(f"替换: {old} → {new}")
        else:
            print(f"未找到: {old}")
    
    if content != original:
        with open(FILE_PATH, 'w', encoding='utf-8') as f:
            f.write(content)
        print("修复完成")
    else:
        print("无需修改")

if __name__ == "__main__":
    main()
