# -*- coding: utf-8 -*-
import os, re

# Scan for buttons with gold/orange gradient background + light text (contrast issues)
# Pattern: bg with primary (#c9a87c or #e8d5b8) + text-white or light text

problem_patterns = [
    # btn with primary/gold bg + white text
    (r'background.*var\(--primary\)', r'text-white'),
    # gold gradient + white text inside <button or className containing btn
]

files_to_check = [
    r'C:\Users\cdl83\.qclaw\workspace\lizixiu-beauty\app\layout.tsx',
    r'C:\Users\cdl83\.qclaw\workspace\lizixiu-beauty\app\components\Footer.tsx',
    r'C:\Users\cdl83\.qclaw\workspace\lizixiu-beauty\app\services\page.tsx',
    r'C:\Users\cdl83\.qclaw\workspace\lizixiu-beauty\app\products\page.tsx',
]

for fpath in files_to_check:
    if os.path.exists(fpath):
        try:
            with open(fpath, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')
                for i, line in enumerate(lines, 1):
                    # Check for Cookie button and similar patterns
                    if 'var(--primary)' in line and ('text-white' in line or 'white' in line) and '<button' in content[max(0, content.find(line)-200):content.find(line)+200]:
                        fname = os.path.basename(fpath)
                        print('POTENTIAL: %s line %d: %s' % (fname, i, line.strip()[:120]))
        except Exception as e:
            print('Error: %s' % e)
    else:
        print('Not found: %s' % fpath)

# Also check globals.css for cookie button
print()
print('=== Cookie button in layout ===')
with open(r'C:\Users\cdl83\.qclaw\workspace\lizixiu-beauty\app\layout.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if 'Cookie' in line or 'cookie' in line or 'cookie_accepted' in line:
            print('  line %d: %s' % (i+1, line.strip()[:120]))
