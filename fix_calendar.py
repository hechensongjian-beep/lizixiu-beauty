#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复 calendar/page.tsx 中的亮色渐变按钮对比度问题
"""

FILE_PATH = r"C:\Users\cdl83\.qclaw\workspace\lizixiu-beauty\app\calendar\page.tsx"

replacements = [
    # 待确认卡片：黄色渐变 → 深金棕色渐变
    (
        'from-yellow-400 to-amber-500',
        'from-[#b8945f] to-[#8b6914]'
    ),
    # 已完成卡片：亮绿渐变 → 深绿渐变（与已确认统一色系）
    (
        'from-green-400 to-emerald-500',
        'from-[#1e3a2f] to-[#2d5a47]'
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
