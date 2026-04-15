$files = @(
  "C:\Users\cdl83\.qclaw\workspace\lizixiu-beauty\app\admin\schedule\page.tsx",
  "C:\Users\cdl83\.qclaw\workspace\lizixiu-beauty\app\admin\payment\page.tsx",
  "C:\Users\cdl83\.qclaw\workspace\lizixiu-beauty\app\appointments\page.tsx",
  "C:\Users\cdl83\.qclaw\workspace\lizixiu-beauty\app\cart\page.tsx",
  "C:\Users\cdl83\.qclaw\workspace\lizixiu-beauty\app\checkout\page.tsx",
  "C:\Users\cdl83\.qclaw\workspace\lizixiu-beauty\app\products\page.tsx",
  "C:\Users\cdl83\.qclaw\workspace\lizixiu-beauty\app\auth\login\page.tsx"
)

$replacements = @(
  @{ from = 'from-cyan-600 to-blue-600'; to = 'from-[#c9a87c] to-[#e8d5b8]' },
  @{ from = 'from-blue-600 to-cyan-600'; to = 'from-[#c9a87c] to-[#e8d5b8]' },
  @{ from = 'from-blue-400 to-cyan-300'; to = 'from-[#c9a87c] to-[#e8d5b8]' },
  @{ from = 'from-blue-100 to-cyan-100'; to = 'from-[#c9a87c]/10 to-[#e8d5b8]/10' },
  @{ from = 'from-cyan-100 to-blue-100'; to = 'from-[#c9a87c]/10 to-[#e8d5b8]/10' },
  @{ from = 'from-cyan-50 to-blue-50'; to = 'from-[#c9a87c]/5 to-[#e8d5b8]/5' },
  @{ from = 'from-blue-50 to-cyan-50'; to = 'from-[#c9a87c]/5 to-[#e8d5b8]/5' },
  @{ from = 'from-gray-50 to-gray-100'; to = 'from-[#faf8f5] to-[#f5f2ed]' },
  @{ from = 'from-indigo-400 to-blue-600'; to = 'from-[#c9a87c] to-[#b8956a]' },
  @{ from = 'from-blue-400 to-indigo-500'; to = 'from-[#c9a87c] to-[#b8956a]' },
  @{ from = 'from-purple-400 to-indigo-500'; to = 'from-[#c9a87c] to-[#b8956a]' },
  @{ from = 'from-yellow-400 to-amber-500'; to = 'from-[#c9a87c] to-[#b8956a]' },
  @{ from = 'from-yellow-200 to-amber-300'; to = 'from-[#e8d5b8] to-[#c9a87c]' }
)

foreach ($file in $files) {
  $content = Get-Content $file -Raw -Encoding UTF8
  $original = $content
  foreach ($r in $replacements) {
    $content = $content -replace [regex]::Escape($r.from), $r.to
  }
  if ($content -ne $original) {
    Set-Content -Path $file -Value $content -Encoding UTF8 -NoNewline
    Write-Host "Updated: $((Split-Path $file -Leaf))"
  } else {
    Write-Host "No changes: $((Split-Path $file -Leaf))"
  }
}
