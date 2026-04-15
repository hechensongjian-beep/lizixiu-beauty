$files = @(
  "C:\Users\cdl83\.qclaw\workspace\lizixiu-beauty\app\admin\orders\page.tsx",
  "C:\Users\cdl83\.qclaw\workspace\lizixiu-beauty\app\admin\services\page.tsx",
  "C:\Users\cdl83\.qclaw\workspace\lizixiu-beauty\app\admin\verify\page.tsx",
  "C:\Users\cdl83\.qclaw\workspace\lizixiu-beauty\app\staff\page.tsx",
  "C:\Users\cdl83\.qclaw\workspace\lizixiu-beauty\app\staff\workbench\page.tsx"
)

$replacements = @(
  @{ from = 'from-indigo-400 to-indigo-600'; to = 'from-[#c9a87c] to-[#e8d5b8]' },
  @{ from = 'from-indigo-100 to-blue-100'; to = 'from-[#c9a87c]/10 to-[#e8d5b8]/10' },
  @{ from = 'from-blue-50 to-indigo-50'; to = 'from-[#c9a87c]/5 to-[#e8d5b8]/5' },
  @{ from = 'from-amber-400 to-amber-600'; to = 'from-[#c9a87c] to-[#e8d5b8]' },
  @{ from = 'from-amber-400 to-orange-500'; to = 'from-[#c9a87c] to-[#b8956a]' },
  @{ from = 'from-purple-400 to-purple-600'; to = 'from-[#c9a87c] to-[#b8956a]' },
  @{ from = 'from-green-400 to-green-600'; to = 'from-[#a88a5c] to-[#c9a87c]' },
  @{ from = 'from-green-400 to-emerald-500'; to = 'from-[#a88a5c] to-[#b8956a]' },
  @{ from = 'from-gray-800 to-gray-900'; to = 'from-[#c9a87c] to-[#b8956a]' },
  @{ from = 'from-purple-200 to-violet-300'; to = 'from-[#e8d5b8] to-[#c9a87c]' }
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
