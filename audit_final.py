# -*- coding: utf-8 -*-
"""Audit: find real issues to fix"""
import os, glob

base = r'C:\Users\cdl83\.qclaw\workspace\lizixiu-beauty'
files = glob.glob(os.path.join(base, 'app', '**', '*.tsx'), recursive=True) + \
        glob.glob(os.path.join(base, 'components', '**', '*.tsx'), recursive=True)

print("=== 1. HARD-CODED COLORS (in Tailwind arbitrary values) ===")
hc_files = {}
for fpath in sorted(files):
    try:
        content = open(fpath, encoding='utf-8').read()
    except:
        continue
    rel = os.path.relpath(fpath, base)
    # Find #XXXXXX or #XXX in class contexts (not hex in code)
    import re
    matches = re.findall(r'\[#([0-9a-fA-F]{6})\]|\[#([0-9a-fA-F]{3})\]', content)
    if matches:
        hc_files[rel] = len(matches)

for f, c in sorted(hc_files.items()):
    print(f"  {f}: {c}处")
print(f"  Total: {sum(hc_files.values())}处")

print("\n=== 2. PLACEHOLDERS ===")
ph_files = {}
for fpath in sorted(files):
    try:
        content = open(fpath, encoding='utf-8').read()
    except:
        continue
    rel = os.path.relpath(fpath, base)
    count = content.count('placehold.co') + content.count('via.placeholder')
    if count > 0:
        ph_files[rel] = count

for f, c in sorted(ph_files.items()):
    print(f"  {f}: {c}处")
print(f"  Total: {sum(ph_files.values())}处")

print("\n=== 3. CONSOLE.LOG / TODO / FIXME ===")
for fpath in sorted(files):
    try:
        lines = open(fpath, encoding='utf-8').readlines()
    except:
        continue
    rel = os.path.relpath(fpath, base)
    for i, line in enumerate(lines, 1):
        if 'console.log' in line or 'TODO' in line or 'FIXME' in line:
            print(f"  {rel}:{i}  {line.strip()[:70]}")

print("\n=== 4. ENGLISH ERROR MESSAGES ===")
for fpath in sorted(files):
    try:
        content = open(fpath, encoding='utf-8').read()
    except:
        continue
    rel = os.path.relpath(fpath, base)
    import re
    for m in re.finditer(r'alert\s*\(\s*["\']([A-Za-z]{3,})["\']\s*\)', content):
        print(f"  {rel}: alert(\"{m.group(1)}\")")

print("\n=== Done ===")