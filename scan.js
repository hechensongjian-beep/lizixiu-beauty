var fs=require('fs');
var path=require('path');
var root='C:/Users/cdl83/.qclaw/workspace/lizixiu-beauty/app';
var issues=[];

function scanFile(fp) {
  try {
    var txt=fs.readFileSync(fp,'utf8');
    var lines=txt.split('\n');
    for(var j=0;j<lines.length;j++){
      var line=lines[j];
      var rel=path.relative(root,fp);
      // Check: gray text on buttons or rounded elements
      if(/text-gray-[1-5]\d/.test(line) && 
         (line.includes('button')||line.includes('Button')||line.includes('bg-amber')||line.includes('bg-yellow')||line.includes('bg-white')||line.includes('bg-stone')||line.includes('bg-orange')||(line.includes('rounded')&&line.includes('px')))){
        var t=line.trim();
        if(!t.startsWith('//')&&!t.startsWith('*')&&!t.startsWith('*/')){
          issues.push('GRAY-BTN: '+rel+' l'+(j+1)+': '+t.substring(0,100));
        }
      }
    }
  } catch(e){}
}

function walk(d){
  try {
    var items=fs.readdirSync(d);
    for(var i=0;i<items.length;i++){
      var f=path.join(d,items[i]);
      var s=fs.statSync(f);
      if(s.isDirectory()) walk(f);
      else if(items[i].endsWith('.tsx')) scanFile(f);
    }
  } catch(e){}
}

walk(root);
console.log('Total issues: '+issues.length);
issues.slice(0,30).forEach(function(x){console.log(x);});
if(issues.length>30) console.log('...+'+(issues.length-30)+' more');
