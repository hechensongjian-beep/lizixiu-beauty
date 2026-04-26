# -*- coding: utf-8 -*-
import os, re

results_buttons = []
results_emoji = []
results_contrast = []

emoji_chars = ['\u2713','\u2717','\u26a0','\u23f0','\u231a','\u2705','\u274c','\u26d4']

for root, dirs, files in os.walk(r'C:\Users\cdl83\.qclaw\workspace\lizixiu-beauty\app'):
    for f in files:
        if f.endswith('.tsx'):
            path = os.path.join(root, f)
            try:
                with open(path, 'r', encoding='utf-8') as fp:
                    lines = fp.readlines()
                    content = ''.join(lines)
                    for i, line in enumerate(lines, 1):
                        # Check emoji
                        for ec in emoji_chars:
                            if ec in line:
                                results_emoji.append('%s:%d: %s' % (path, i, line.strip()[:100]))
                        # Check button + gradient + white text
                        if ('<button' in line or 'type=' in line) and 'from-[' in line and 'text-white' in line:
                            results_buttons.append('%s:%d: %s' % (path, i, line.strip()[:120]))
                        # Check Link as button with gradient + white
                        if '<Link' in line and 'from-[' in line and 'text-white' in line:
                            results_buttons.append('%s:%d: %s' % (path, i, line.strip()[:120]))
            except Exception as e:
                print('Error reading %s: %s' % (path, e))

print('=== EMOJI FOUND ===')
for r in results_emoji[:20]:
    print(r)
if not results_emoji:
    print('None')

print()
print('=== BUTTON+GRADIENT+WHITE-TEXT FOUND ===')
for r in results_buttons[:20]:
    print(r)
if not results_buttons:
    print('None')
