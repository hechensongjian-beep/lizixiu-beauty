import os, re, glob

base = r'C:\Users\cdl83\.qclaw\workspace\lizixiu-beauty'
files = glob.glob(base + r'\**\*.tsx', recursive=True) + glob.glob(base + r'\**\*.ts', recursive=True)

# Color mappings - what each CSS var resolves to
FOREGROUND_BG = '#faf8f3'  # --background: light
CARD_BG = '#fdfcf8'       # --background-card: light
SECONDARY_BG = '#f5f2eb'  # --background-secondary: warm light

COLOR_MAP = {
    '--primary': '#c9a87c',      # champagne gold
    '--primary-dark': '#a88a5c',  # darker gold
    '--primary-light': '#d4b88a',
    '--foreground': '#2d2926',    # dark brown
    '--foreground-light': '#6b5f54',
    '--foreground-muted': '#9b8a7a',
    '--accent': '#2d4a3e',        # dark green
    '--accent-light': '#3d5a4e',
    '--rose': '#c49393',          # dusty rose
}

# Known good text colors on light backgrounds:
# - text-[var(--foreground)] #2d2926 ✅
# - text-[var(--accent)] #2d4a3e ✅
# - text-[var(--primary-dark)] #a88a5c ✅
# Problematic patterns (gold on light):
# - text-[var(--primary)] #c9a87c ❌ on light bg (contrast 2.1:1 < 4.5:1)
# - text-[var(--primary-light)] #d4b88a ❌ (contrast ~2.8:1)

PROBLEMATIC = ['--primary', '--primary-light', '--rose']

def check_file(path):
    try:
        content = open(path, encoding='utf-8').read()
    except:
        return []
    
    rel_path = os.path.relpath(path, base)
    issues = []
    
    # Find all text color patterns
    for m in re.finditer(r'text-\[var\(--([^)]+)\)\]', content):
        var = m.group(1)
        if var in PROBLEMATIC:
            # Get line number
            line_num = content[:m.start()].count('\n') + 1
            issues.append(f"  {rel_path}:{line_num} → text-[var(--{var})] ({COLOR_MAP.get('--' + var, '?')})")
    
    return issues

print("=== 检查全站文字对比度问题 ===\n")
all_issues = []
for f in sorted(files):
    issues = check_file(f)
    all_issues.extend(issues)

# Deduplicate by file
from collections import defaultdict
by_file = defaultdict(list)
for issue in all_issues:
    m = re.match(r'^  ([^:]+):', issue)
    if m:
        by_file[m.group(1)].append(issue)

for fpath, issues in sorted(by_file.items()):
    print(f"📁 {fpath}")
    for i in issues:
        print(i)
    print()

print(f"\n总计: {len(all_issues)} 处需要修复")