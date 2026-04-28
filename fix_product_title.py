import os

# 基础路径
base = r'C:\Users\cdl83\.qclaw\workspace\lizixiu-beauty'

# 修复 ProductDetailClient 添加动态标题
file_path = os.path.join(base, 'app/product/ProductDetailClient.tsx')

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 检查是否已有 document.title
if 'document.title' in content:
    print("Already has document.title")
else:
    # 找到第一个 useEffect，在其中添加 document.title 设置
    # 在 setProduct(found) 之后添加
    old_line = "setProduct(found);"
    new_line = """setProduct(found);
          if (found) document.title = found.name + ' - 丽姿秀';"""
    
    if old_line in content:
        content = content.replace(old_line, new_line, 1)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Added dynamic title to ProductDetailClient.tsx")
    else:
        print("Pattern not found")

print("Done!")
