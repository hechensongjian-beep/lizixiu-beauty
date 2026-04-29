# -*- coding: utf-8 -*-
"""Fix contrast issues - replace gold/rose text colors with accessible alternatives"""
import os, re, glob

base = r'C:\Users\cdl83\.qclaw\workspace\lizixiu-beauty'
files = glob.glob(os.path.join(base, 'app', '**', '*.tsx'), recursive=True) + \
        glob.glob(os.path.join(base, 'components', '**', '*.tsx'), recursive=True)

# Context-aware replacements for text colors on light backgrounds
# Rule: gold/rose text on ivory/cream bg has poor contrast
# Solution: use darker, more legible alternatives

REPLACEMENTS = [
    # Replace gold text with accessible dark alternatives
    (r'text-\[#c9a87c\]', 'text-[var(--primary-dark)]'),   # gold → dark gold
    (r'text-\[#d4a574\]', 'text-[var(--primary-dark)]'),   # light gold → dark gold
    (r'text-\[#a88a5c\]', 'text-[var(--foreground)]'),      # warm brown → dark (better on light bg)
    (r'text-\[#8b7355\]', 'text-[var(--foreground)]'),      # brown → dark
    # rose/dusty rose on light bg
    (r'text-\[#c49393\]', 'text-[var(--accent)]'),          # rose → dark green (brand-consistent)
    (r'text-\[#d4a5a5\]', 'text-[var(--accent)]'),          # light rose → dark green
    # system colors
    (r'text-\[#2a2a28\]', 'text-[var(--foreground)]'),     # almost black → dark
    (r'text-\[#6b6b68\]', 'text-[var(--foreground-muted)]'),# gray → muted
    (r'text-\[#9b8a7a\]', 'text-[var(--foreground-muted)]'),# warm gray → muted
    # sage on light bg
    (r'text-\[#7d9a6f\]', 'text-[var(--accent)]'),          # sage → accent
]

changed_files = []
total_changes = 0

for fpath in sorted(files):
    try:
        content = open(fpath, encoding='utf-8').read()
    except:
        continue
    
    original = content
    for old, new in REPLACEMENTS:
        content = re.sub(old, new, content)
    
    if content != original:
        count = sum(1 for old, _ in REPLACEMENTS for _ in re.findall(old, original))
        open(fpath, 'w', encoding='utf-8').write(content)
        rel = os.path.relpath(fpath, base)
        print(f'Fixed {rel} ({count} replacements)')
        changed_files.append(rel)
        total_changes += count

print(f'\nTotal: {total_changes} replacements in {len(changed_files)} files')