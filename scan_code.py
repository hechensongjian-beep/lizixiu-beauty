# -*- coding: utf-8 -*-
import os, glob

base = r'C:\Users\cdl83\.qclaw\workspace\lizixiu-beauty'
files = glob.glob(os.path.join(base, 'app', '**', '*.tsx'), recursive=True) + \
        glob.glob(os.path.join(base, 'components', '**', '*.tsx'), recursive=True)

for fpath in sorted(files):
    try:
        lines = open(fpath, encoding='utf-8').readlines()
    except:
        continue
    rel = os.path.relpath(fpath, base)
    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        # Check for console calls, TODO/FIXME, etc.
        if 'console.' in line and 'console.error' not in line and 'console.log' not in line:
            print(f'{rel}:{i}  {stripped[:80]}')
        if 'TODO' in stripped or 'FIXME' in stripped or 'XXX' in stripped:
            print(f'{rel}:{i}  {stripped[:80]}')
        if '// eslint' in stripped:
            print(f'{rel}:{i}  {stripped[:80]}')

print('Done')