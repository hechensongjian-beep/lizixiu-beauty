var fs=require('fs'),path=require('path');
var root='C:/Users/cdl83/.qclaw/workspace/lizixiu-beauty/app';

// Count total tsx
var c=0;
function walk(d){try{var items=fs.readdirSync(d);for(var i=0;i<items.length;i++){var f=path.join(d,items[i]);var s=fs.statSync(f);if(s.isDirectory())walk(f);else if(items[i].endsWith('.tsx'))c++;}}catch(e){}}
walk(root);
console.log('Total .tsx: '+c);

// Check key pages
var pages=['cart/page.tsx','checkout/page.tsx','product/page.tsx','products/page.tsx','appointments/page.tsx','page.tsx','admin/page.tsx','admin/products/page.tsx','admin/services/page.tsx','admin/orders/page.tsx','admin/promotions/page.tsx','admin/settings/page.tsx','layout.tsx'];
pages.forEach(function(p){var f=root+'/'+p;try{var x=fs.statSync(f);var txt=fs.readFileSync(f,'utf8');console.log(p+': '+Math.round(txt.length/1024)+'KB, lines:'+txt.split('\n').length);}catch(e){console.log(p+': MISSING');}});

// Scan for contrast issues: gray text on light bg, or white text on gradient
console.log('\n--- Contrast Scan ---');
var issues=[];
function walk2(d){try{var items=fs.readdirSync(d);for(var i=0;i<items.length;i++){var f=path.join(d,items[i]);var s=fs.statSync(f);if(s.isDirectory())walk2(f);else if(items[i].endsWith('.tsx')){var txt=fs.readFileSync(f,'utf8');var lines=txt.split('\n');for(var j=0;j<lines.length;j++){var line=lines[j];var rel=path.relative(root,f);if(/text-gray-[1-5]\d/.test(line)&&(line.includes('button')||line.includes('Button')||line.includes('bg-amber')||line.includes('bg-yellow')||line.includes('bg-white')||line.includes('bg-stone')||line.includes('bg-orange')||line.includes('rounded')&&line.includes('px'))){if(!line.trim().startsWith('//')&&!line.trim().startsWith('*')){issues.push('GRAY-ON-LIGHT: '+rel+' line '+(j+1)+': '+line.trim().substring(0,100));}}}}}catch(e){}}
walk2(root);
issues.slice(0,30).forEach(function(i){console.log(i);});
if(issues.length>30)console.log('... and '+(issues.length-30)+' more');
console.log('Done');
