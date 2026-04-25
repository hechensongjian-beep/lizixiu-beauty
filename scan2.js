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
      // Check placeholder colors
      if(/placeholder-gray-4\d\d|placeholder-gray-5\d\d|placeholder-gray-600|placeholder:text-gray-4/.test(line)){
        issues.push('PLACEHOLDER: '+rel+' l'+(j+1)+': '+line.trim().substring(0,100));
      }
      // Check hardcoded button colors on non-primary
      if(/bg-\[#a88a5c\]|bg-\[#2d4a3e\]/.test(line) && line.includes('button')){
        issues.push('HARDCOLOR-BTN: '+rel+' l'+(j+1)+': '+line.trim().substring(0,100));
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
console.log('Issues found: '+issues.length);
issues.forEach(function(x){console.log(x);});
