# -*- coding: utf-8 -*-
import os, re, glob

base = r'C:\Users\cdl83\.qclaw\workspace\lizixiu-beauty'
files = glob.glob(base + r'\app\**\*.tsx', recursive=True)

COLOR_MAP = {
    '--primary': '#c9a87c',
    '--primary-dark': '#a88a5c',
    '--primary-light': '#d4b88a',
    '--foreground': '#2d2926',
    '--accent': '#2d4a3e',
    '--rose': '#c49393',
}

PROBLEMATIC = ['--primary', '--primary-light', '--rose']

results = []
for fpath in sorted(files):
    try:
        content = open(fpath, encoding='utf-8').read()
    except:
        continue

    rel = os.path.relpath(fpath, base)
    for m in re.finditer(r'text-\[var\(--([^)]+)\)\]', content):
        var = m.group(1)
        if var in PROBLEMATIC:
            line_no = content[:m.start()].count('\n') + 1
            color = COLOR_MAP.get('--' + var, '?')
            results.append(f'{rel}|{line_no}|{var}|{color}')

results.sort()
current_file = ''
for r in results:
    parts = r.split('|')
    if parts[0] != current_file:
        print(f'\n{parts[0]}')
        current_file = parts[0]
    print(f'  L{parts[1]}: text-[var(--{parts[2]})] = {parts[3]}')

print(f'\nTotal: {len(results)} issues')