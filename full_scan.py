#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
全站代码质量扫描脚本
按照 STRICT_RULES.md 的检查清单执行
"""

import os
import re
from pathlib import Path

BASE_DIR = Path(r"C:\Users\cdl83\.qclaw\workspace\lizixiu-beauty\app")

issues = {
    "渐变白字按钮": [],
    "emoji字符": [],
    "placehold.co占位图": [],
    "硬编码颜色": [],
    "英文错误提示": [],
    "alert/confirm": [],
    "无效CSS变量": [],
}

# emoji 检测正则
EMOJI_PATTERN = re.compile(
    "["
    "\U0001F600-\U0001F64F"
    "\U0001F300-\U0001F5FF"
    "\U0001F680-\U0001F6FF"
    "\U0001F1E0-\U0001F1FF"
    "\U00002702-\U000027B0"
    "\U000024C2-\U0001F251"
    "]+",
    flags=re.UNICODE,
)

def scan_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            lines = content.split('\n')
            
        rel_path = os.path.relpath(filepath, BASE_DIR.parent)
        
        for i, line in enumerate(lines, 1):
            # 1. 渐变白字按钮
            if re.search(r'from-\[#[a-fA-F0-9]{6}\].*to-\[#[a-fA-F0-9]{6}\].*text-white', line):
                issues["渐变白字按钮"].append(f"{rel_path}:{i}")
            
            # 2. emoji
            if EMOJI_PATTERN.search(line):
                issues["emoji字符"].append(f"{rel_path}:{i}")
            
            # 3. placehold.co
            if 'placehold.co' in line or 'via.placeholder' in line:
                issues["placehold.co占位图"].append(f"{rel_path}:{i}")
            
            # 4. 硬编码颜色（排除注释和特定允许的）
            if re.search(r'(?<!["\'])#[a-fA-F0-9]{6}(?!["\'])', line):
                if '//' not in line.split('#')[0] if '#' in line else True:
                    issues["硬编码颜色"].append(f"{rel_path}:{i}")
            
            # 5. 英文错误提示
            if re.search(r'(error|Error|ERROR)["\']?\s*[:=]\s*["\'][^"\']*[a-zA-Z]{3,}', line):
                if '中文' not in line and '翻译' not in line:
                    issues["英文错误提示"].append(f"{rel_path}:{i}")
            
            # 6. alert/confirm
            if 'alert(' in line or 'confirm(' in line:
                if 'window.' in line or line.strip().startswith('alert') or line.strip().startswith('confirm'):
                    issues["alert/confirm"].append(f"{rel_path}:{i}")
            
            # 7. 无效CSS变量 (hover:var(...))
            if re.search(r'hover:var\(', line):
                issues["无效CSS变量"].append(f"{rel_path}:{i}")
                
    except Exception as e:
        print(f"扫描失败: {filepath} - {e}")

def main():
    print("=" * 60)
    print("全站代码质量扫描 - 按照 STRICT_RULES.md 检查清单")
    print("=" * 60)
    print()
    
    tsx_files = list(BASE_DIR.rglob("*.tsx"))
    print(f"扫描 {len(tsx_files)} 个 .tsx 文件...")
    print()
    
    for filepath in tsx_files:
        scan_file(filepath)
    
    total_issues = 0
    for category, files in issues.items():
        if files:
            print(f"\n【{category}】 - {len(files)} 处")
            for f in files[:10]:  # 最多显示10个
                print(f"  - {f}")
            if len(files) > 10:
                print(f"  ... 还有 {len(files) - 10} 处")
            total_issues += len(files)
    
    print()
    print("=" * 60)
    if total_issues == 0:
        print("✅ 全部检查通过！")
    else:
        print(f"❌ 共发现 {total_issues} 处问题需要修复")
    print("=" * 60)

if __name__ == "__main__":
    main()
