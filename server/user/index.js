var express = require('express');
var app = module.exports = express();
var path = require('path');
var monk = require('monk');
var db = monk('127.0.0.1:27017/mydb');

app.use(function(req, res, next){
  res.preload('/user', { _id: 23432, name: 'ben' });
  next();
});

app.get('/user', function(req, res){
  setTimeout(function(){
    res.send({ _id: 23432, name: 'ben' });
  }, 2000);
});