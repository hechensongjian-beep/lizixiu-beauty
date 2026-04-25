var fs=require('fs');
var path=require('path');
var root='C:/Users/cdl83/.qclaw/workspace/lizixiu-beauty/app';
var issues=[];

function walk(d){
  try{
    var items=fs.readdirSync(d);
    for(var i=0;i<items.length;i++){
      var f=path.join(d,items[i]);
      var s=fs.statSync(f);
      if(s.isDirectory()) walk(f);
      else if(items[i].endsWith('.tsx')){
        var txt=fs.readFileSync(f,'utf8');
        var lines=txt.split('\n');
        for(var j=0;j<lines.length;j++){
          var line=lines[j];
          var rel=path.relative(root,f);
          // Find all /products/ links (not /product?id=)
          if(line.indexOf('/products/') >= 0 && line.indexOf('/product?id=') < 0 && line.indexOf('/products/page') < 0 && line.indexOf('router.push') < 0){
            var t=line.trim();
            if(t.indexOf('//') !== 0 && t.indexOf('*') !== 0){
              issues.push(rel+' l'+(j+1)+': '+t.substring(0,120));
            }
          }
        }
      }
    }
  }catch(e){}
}

walk(root);
console.log('All /products/ links (excluding /product?id= and /products/page): '+issues.length);
issues.forEach(function(x){console.log(x);});
