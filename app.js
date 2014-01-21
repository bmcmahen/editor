// Modules
var express = require('express');
var http = require('http');
var path = require('path');
var exposeMydb = require('mydb-expose');
var mydb = require('mydb');
var monk = require('monk');
var tail = require('mydb-tail');

var app = express();

// All Environments
app.set('port', process.env.PORT || 3000);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

// Expose URLs to MyDB for subscriptions
app.use(exposeMydb({ mongo: 'localhost/mydb', url: '127.0.0.1:3000' }));
// Enable preload
require('mydb-preload');
app.use(app.router);


// Local Modules
app.use(require('./server/docs'));
app.use(require('./server/user'));
app.use(require('./server/boot'));

// Tail the Mongo Oplog
tail({ 
  mongo: monk('localhost:27017/local'),
  redis: 'localhost:6379'
});

// Development Environment
if (app.get('env') == 'development'){
  app.use(express.errorHandler());
}

var server = http.createServer(app);
mydb(server);
server.listen(app.get('port'), function(){
  console.log('Server listening on port 3000');
});