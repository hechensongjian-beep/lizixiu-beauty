import os, re
src = r"C:\Users\cdl83\.qclaw\workspace\lizixiu-beauty\app"
hooks = ["useSearchParams", "usePathname", "useRouter"]
kws = ["location", "window.", "document.", "navigator.", "localStorage", "sessionStorage"]
print("Scanning:", src)
for root, dirs, files in os.walk(src):
    dirs[:] = [d for d in dirs if d not in ("node_modules",".next",".git")]
    for fn in files:
        if not fn.endswith((".tsx",".ts",".jsx",".js")): continue
        fp = os.path.join(root, fn)
        try:
            with open(fp, "r", encoding="utf-8") as f: c = f.read()
        except: continue
        rel = os.path.relpath(fp, src)
        hc = "'use client'" in c or '"use client"' in c
        hd = bool(re.search(r"export\s+const\s+dynamic\s*=", c))
        for h in hooks:
            if h in c and not hc and not hd:
                print("MISSING use client:", rel, "|", h)