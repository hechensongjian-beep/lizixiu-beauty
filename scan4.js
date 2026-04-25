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
          // Check for /products/${...} links (should be /product?id=...)
          if(line.indexOf('/products/${') >= 0 && line.indexOf('product.id') >= 0){
            issues.push('WRONG-PROD-LINK: '+rel+' l'+(j+1)+': '+line.trim().substring(0,100));
          }
        }
      }
    }
  }catch(e){}
}

walk(root);
console.log('Issues: '+issues.length);
issues.forEach(function(x){console.log(x);});
