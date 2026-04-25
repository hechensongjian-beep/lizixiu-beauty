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
      // Check hardcoded colors in bg/text/border
      var matches=line.match(/bg-\[#[\da-f]+\]|text-\[#[\da-f]+\]|border-\[#[\da-f]+\]/g);
      if(matches){
        var t=line.trim();
        if(!t.startsWith('//')&&!t.startsWith('*')){
          issues.push('HARDCOLOR: '+rel+' l'+(j+1)+': '+t.substring(0,120));
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
console.log('Total hardcoded colors: '+issues.length);
issues.forEach(function(x){console.log(x);});
