# -*- coding: utf-8 -*-
import os, re, glob

base = r'C:\Users\cdl83\.qclaw\workspace\lizixiu-beauty'
files = glob.glob(os.path.join(base, 'app', '**', '*.tsx'), recursive=True) + \
        glob.glob(os.path.join(base, 'components', '**', '*.tsx'), recursive=True)

results = []
for fpath in sorted(files):
    try:
        content = open(fpath, encoding='utf-8').read()
    except:
        continue
    rel = os.path.relpath(fpath, base)

    # Scan all text-[...] color patterns
    for m in re.finditer(r'text-\[([^\]]+)\]', content):
        color_val = m.group(1)
        line_no = content[:m.start()].count('\n') + 1
        results.append(f'{rel}|{line_no}|{color_val}')

# Group by file
from collections import defaultdict
by_file = defaultdict(list)
for r in results:
    parts = r.split('|', 2)
    if len(parts) == 3:
        by_file[parts[0]].append((int(parts[1]), parts[2]))

for fpath in sorted(by_file.keys()):
    items = by_file[fpath]
    print(f'{fpath} ({len(items)} patterns)')
    # Show unique color patterns used in this file
    colors = set(c for _, c in items)
    for c in sorted(colors):
        count = sum(1 for _, x in items if x == c)
        print(f'  {c} x{count}')
    print()