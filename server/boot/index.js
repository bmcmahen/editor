var express = require('express');
var app = module.exports = express();
var path = require('path');
var preload = require('mydb-preload');

app.set('views', __dirname);
app.set('view engine', 'hbs');

app.get('/', preload(), function(req, res){
  var toAttach = {};
  if (res.mydbDocs){
    var obj = { user : res.mydbDocs[0] };
    var str = includeScripts(obj);
    toAttach.preload = str;
  }
  console.log(toAttach);
  res.render('index', toAttach);
});


function includeScripts(obj){

  var buf = []
  for (var key in obj) {
    var doc = obj[key];
    if (typeof doc === 'String'){
      buf.push(renderString(key, doc));
    } else {
      buf.push(renderObject(key, doc));
    }
  }

  var js = buf.join('\n');
  return '<script>'+ js +'</script>';
}

function renderString(name, val){
  return  name + ' = ' + val + ';';
}

function renderObject(name, val){
  val = encodeURIComponent(JSON.stringify(val));
  return renderString(name, 'JSON.parse(decodeURIComponent("'+ val +'"))');
}