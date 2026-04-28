import os

base = r'C:\Users\cdl83\.qclaw\workspace\lizixiu-beauty'
file_path = os.path.join(base, 'app/layout.tsx')

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 添加 theme-color meta标签
old_line = '<meta name="keywords" content="美容,面部护理,身体SPA,美甲,美睫,美容工作室,丽姿秀" />'
new_line = '''<meta name="keywords" content="美容,面部护理,身体SPA,美甲,美睫,美容工作室,丽姿秀" />
        <meta name="theme-color" content="#faf8f3" />'''

if old_line in content:
    content = content.replace(old_line, new_line, 1)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added theme-color meta tag")
else:
    print("Pattern not found")

print("Done!")
