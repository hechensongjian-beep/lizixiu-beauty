# -*- coding: utf-8 -*-
"""Fix text-[var(--xxx)] invalid Tailwind arbitrary values → inline style"""
import os, re, glob

base = r'C:\Users\cdl83\.qclaw\workspace\lizixiu-beauty'
files = glob.glob(os.path.join(base, 'app', '**', '*.tsx'), recursive=True) + \
        glob.glob(os.path.join(base, 'components', '**', '*.tsx'), recursive=True)

changed = 0
for fpath in files:
    try:
        content = open(fpath, encoding='utf-8').read()
    except:
        continue

    original = content

    # Find text-[var(--xxx)] in className and convert to style=
    # Strategy: for each occurrence, check if element already has style=
    # If yes: add color to existing style
    # If no: add style={{color: 'var(--...)'}} attribute

    new_lines = []
    for line in content.split('\n'):
        if 'text-[var(--' not in line:
            new_lines.append(line)
            continue

        processed = line
        # Find all text-[var(--xxx)] in this line
        matches = list(re.finditer(r'text-\[var\((--[^)]+)\)\]', processed))

        if not matches:
            new_lines.append(line)
            continue

        # Process in reverse order to not disturb positions
        for m in reversed(matches):
            var_name = m.group(1)  # e.g., --foreground, --primary-dark
            full_match = m.group(0)  # e.g., text-[var(--foreground)]

            # Check if this element already has style=
            # Look backwards from the match position to find the opening <...>
            before = processed[:m.start()]
            # Find the last < before this match (go backwards)
            lt_pos = before.rfind('<')
            if lt_pos == -1:
                new_lines.append(processed)
                continue

            element_start = before[lt_pos:]
            element_prefix = before[:lt_pos]  # everything before <tag

            # Check if there's a style= in the element
            has_style = 'style=' in element_start

            # Also check for existing style attribute more carefully
            # style={...} pattern
            style_match = re.search(r'style=\{([^}]*)\}', element_start)
            if style_match:
                # Has style - add color to it
                style_content = style_match.group(1).strip()
                # Remove text-[var(...)] from className
                class_end = element_start.find('>')
                class_part = element_start[:class_end] if class_end != -1 else element_start

                if 'text-[var(' in class_part:
                    # Remove from class
                    class_part = re.sub(r'\s*text-\[var\(--[^)]+\)\]', '', class_part)
                    # Add color to style
                    new_style_content = style_content.rstrip('}').rstrip()
                    if new_style_content:
                        new_style = f'style={{{style_content}, color: "var({var_name})"}}'
                    else:
                        new_style = f'style={{color: "var({var_name})"}}'
                    new_tag = class_part + ' ' + new_style + ('>' if class_end != -1 else '')
                    processed = element_prefix + new_tag + (element_start[class_end+1:] if class_end != -1 else '')
                else:
                    new_lines.append(line)
                    continue
            else:
                # No style - add it
                class_end = element_start.find('>')
                class_part = element_start[:class_end] if class_end != -1 else element_start

                if 'text-[var(' in class_part:
                    # Remove from class, add as style
                    class_part = re.sub(r'\s*text-\[var\(--[^)]+\)\]', '', class_part)
                    new_tag = class_part + f' style={{color: "var({var_name})"}}' + ('>' if class_end != -1 else '')
                    processed = element_prefix + new_tag + (element_start[class_end+1:] if class_end != -1 else '')
                else:
                    new_lines.append(line)
                    continue

        # If line changed significantly, use the simple replacement
        if processed == line:
            new_lines.append(line)
        else:
            new_lines.append(processed)

    new_content = '\n'.join(new_lines)
    if new_content != content:
        open(fpath, 'w', encoding='utf-8').write(new_content)
        changed += 1
        print(f'Fixed: {os.path.relpath(fpath, base)}')

print(f'\nTotal files changed: {changed}')