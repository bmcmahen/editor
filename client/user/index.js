
if (window.user){
  db.preload(window.user);
}

var user = db.get('/user');
user.ready(function(){
  console.log('user is ready', user);
});