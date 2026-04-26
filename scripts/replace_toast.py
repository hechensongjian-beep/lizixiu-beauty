#!/usr/bin/env python3
"""批量替换 alert() -> toast.xxx() 和 confirm() -> await toast.confirm()"""
import os, re

APP_DIR = 'app'

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'alert(' not in content and 'confirm(' not in content:
        return None
    
    if 'useToast' in content:
        return None  # already processed
    
    original = content
    has_confirm = 'confirm(' in content
    
    # 1. Add import
    # Find the last import from @/components/
    import_pattern = r"(import\s+\{[^}]+\}\s+from\s+['\"]@/components/[^'\"]+['\"];?\n)"
    matches = list(re.finditer(import_pattern, content))
    if matches:
        last_import = matches[-1]
        insert_pos = last_import.end()
        content = content[:insert_pos] + "import { useToast } from '@/components/Toast';\n" + content[insert_pos:]
    else:
        # Add after 'use client'
        uc_match = re.search(r"'use client';\n\n", content)
        if uc_match:
            content = content[:uc_match.end()] + "import { useToast } from '@/components/Toast';\n" + content[uc_match.end():]
    
    # 2. Add const { toast } = useToast(); in the component function
    # Find the component function definition
    func_patterns = [
        r"(export\s+default\s+function\s+\w+\([^)]*\)\s*\{)",
        r"(export\s+default\s+function\s+\w+\(\)\s*\{)",
        r"(function\s+\w+\([^)]*\)\s*\{)",
    ]
    
    for pat in func_patterns:
        func_match = re.search(pat, content)
        if func_match:
            insert_pos = func_match.end()
            # Check if there are existing hooks right after
            content = content[:insert_pos] + "\n  const { toast } = useToast();" + content[insert_pos:]
            break
    
    # 3. Replace alert() calls
    # alert('success message') -> toast.success('success message')
    # alert('error message') -> toast.error('error message')
    # alert(anything else) -> toast.info(anything else)
    
    def replace_alert(match):
        full = match.group(0)
        inner = match.group(1)
        
        is_success = any(kw in inner for kw in ['成功', 'Success', 'success', '已复制', 'SQL已复制'])
        is_error = any(kw in inner for kw in ['失败', '错误', 'Error', 'error', 'Failed', 'failed', 'Upload failed'])
        
        if is_success:
            return f"toast.success({inner})"
        elif is_error:
            return f"toast.error({inner})"
        else:
            return f"toast.info({inner})"
    
    content = re.sub(r'alert\(([^)]+)\)', replace_alert, content)
    
    # Handle multi-line alert calls: alert(`...\n...`)
    # These are rare, handle separately if needed
    
    # 4. Replace confirm() calls
    # Pattern: const confirmed = confirm('xxx');
    #   -> const confirmed = await toast.confirm('xxx');
    # Need to make the containing function async if not already
    
    if has_confirm:
        # Simple pattern: confirm('xxx') -> await toast.confirm('xxx')
        content = re.sub(r'confirm\(', 'await toast.confirm(', content)
        
        # Make the containing function async if not already
        # Find function that contains confirm and add async
        # This is tricky - let's find 'const confirmed = await toast.confirm'
        # and ensure the function is async
        
        # Find the function definition that contains the confirm
        lines = content.split('\n')
        in_async_function = False
        brace_depth = 0
        function_starts = []  # (line_idx, brace_depth at start)
        
        for i, line in enumerate(lines):
            if 'await toast.confirm(' in line:
                # Find the enclosing function and make it async
                # Look backwards for 'function' or '=>' 
                for j in range(i, -1, -1):
                    # Check for function declaration
                    func_match = re.search(r'(export\s+default\s+function\s+)(\w+)', lines[j])
                    if func_match and 'async' not in lines[j]:
                        lines[j] = lines[j].replace('export default function', 'export default async function')
                        break
                    # Check for const xxx = () => { or const xxx = async () => {
                    arrow_match = re.search(r'(const\s+\w+\s*=\s*)(async\s+)?(\([^)]*\)\s*=>\s*\{)', lines[j])
                    if arrow_match and not arrow_match.group(2):
                        lines[j] = arrow_match.group(1) + 'async ' + arrow_match.group(3)
                        break
        
        content = '\n'.join(lines)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        remaining_alerts = content.count('alert(')
        remaining_confirms = content.count('confirm(') - content.count('toast.confirm(')
        status = []
        if remaining_alerts > 0: status.append(f"{remaining_alerts} alert()")
        if remaining_confirms > 0: status.append(f"{remaining_confirms} confirm()")
        return f"FIXED | {', '.join(status) if status else 'ALL DONE'}"
    
    return None

# Process all files
fixed = 0
for root, dirs, files in os.walk(APP_DIR):
    for f in files:
        if f.endswith('.tsx') or f.endswith('.ts'):
            path = os.path.join(root, f)
            result = process_file(path)
            if result:
                print(f"{path}: {result}")
                fixed += 1

print(f"\nTotal files fixed: {fixed}")
