# -*- coding: utf-8 -*-
"""
修复文字对比度问题
把浅色背景上的金色文字 text-[var(--primary)] 改为 text-[var(--primary-dark)]
因为 #c9a87c 在 #faf8f3 背景上对比度不够
"""
import os
import re

def fix_contrast():
    base_dir = r"C:\Users\cdl83\.qclaw\workspace\lizixiu-beauty"
    tsx_files = []
    
    # 收集所有tsx文件
    for root, dirs, files in os.walk(base_dir):
        # 跳过 node_modules 和 .next
        if 'node_modules' in root or '.next' in root:
            continue
        for f in files:
            if f.endswith('.tsx'):
                tsx_files.append(os.path.join(root, f))
    
    changes = []
    
    for filepath in tsx_files:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        # 1. text-[var(--primary)] -> text-[var(--primary-dark)] 
        # 但要排除一些特殊情况
        content = re.sub(
            r'text-\[var\(--primary\)\](?!\s*/)(?!\s*\])',
            'text-[var(--primary-dark)]',
            content
        )
        
        # 2. text-[#c9a87c] -> text-[#a88a5c] (同样的问题)
        content = re.sub(
            r'text-\[#c9a87c\](?!\s*/)(?!\s*\])',
            'text-[#a88a5c]',
            content
        )
        
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            changes.append(filepath)
    
    return changes

if __name__ == '__main__':
    changed = fix_contrast()
    print(f"修复了 {len(changed)} 个文件:")
    for f in changed:
        print(f"  - {f}")
