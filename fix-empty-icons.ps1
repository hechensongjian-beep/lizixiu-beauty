$file = "C:\Users\cdl83\.qclaw\workspace\lizixiu-beauty\app\customers\page.tsx"
$content = Get-Content $file -Raw -Encoding UTF8

# Replace empty icon divs (empty text in styled divs)
$content = $content -replace '<div className="text-3xl"></div>', '<div className="text-3xl font-bold text-gray-400">-</div>'
$content = $content -replace '<div className="text-5xl mb-6"></div>', '<div className="text-5xl mb-6 font-bold text-gray-300">-</div>'
$content = $content -replace '<div className="text-2xl mb-2"></div>', '<div className="text-2xl mb-2 font-bold text-gray-400">-</div>'
$content = $content -replace '<div className="text-4xl"></div>', '<div className="text-4xl font-bold text-gray-400">-</div>'

Set-Content -Path $file -Value $content -Encoding UTF8 -NoNewline
Write-Host "Done"
