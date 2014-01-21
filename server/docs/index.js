var express = require('express');
var app = module.exports = express();
var path = require('path');
var monk = require('monk');
var db = monk('127.0.0.1:27017/mydb');

var testTable = db.get('testData');

app.get('/doc', function(req, res){
  var query = testTable.findOne({ name: 'ben' });
  res.send(query);
});

function getRandomArbitary (min, max) {
  return Math.random() * (max - min) + min;
}

setInterval(function(){
  testTable.update({name: 'ben'}, { $set: {age : getRandomArbitary(1, 100) , name: 'ben'}}, function(){});
}, 5000);