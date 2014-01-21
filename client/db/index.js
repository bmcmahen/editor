var mydb = require('mydb');
var url = '127.0.0.1:3000';
var db = module.exports = mydb(url);

// preload our docs
var docs = window.mydb_preload || [];
docs.forEach(db.preload, db);