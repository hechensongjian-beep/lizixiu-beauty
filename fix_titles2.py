import os

# 基础路径
base = r'C:\Users\cdl83\.qclaw\workspace\lizixiu-beauty'

# 添加 document.title 到缺少的页面
files_to_fix = [
    ('app/admin/promotions/page.tsx', '促销活动管理 - 丽姿秀'),
    ('app/admin/settings/page.tsx', '系统设置 - 丽姿秀'),
]

for rel_path, title in files_to_fix:
    file_path = os.path.join(base, rel_path)
    
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        continue
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 检查是否已有 document.title
    if 'document.title' in content:
        print(f"Already has title: {file_path}")
        continue
    
    # 找到第一个 useEffect 的位置，在其内部添加 document.title
    import_re = "useEffect"
    
    if import_re in content:
        # 找到第一个 useEffect 后的第一个 { 后面插入
        idx = content.find('useEffect')
        if idx != -1:
            # 找到这个 useEffect 的开始括号
            brace_idx = content.find('{', idx)
            if brace_idx != -1:
                # 在这个 { 后面的换行后插入
                insert_idx = content.find('\n', brace_idx) + 1
                
                # 构建插入内容
                indent = '    '  # 缩进
                insert_content = f"{indent}document.title = '{title}';\n"
                
                # 插入
                new_content = content[:insert_idx] + insert_content + content[insert_idx:]
                
                # 写入文件
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                
                print(f"Added title to: {file_path}")
    else:
        print(f"No useEffect found in: {file_path}")

print("Done!")
