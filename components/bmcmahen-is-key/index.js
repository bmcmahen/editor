var keycode = require('keycode');

module.exports = function(e, keys){
  var key = e.keyCode || e.charCode;
  for (var i = 0, len = keys.length; i < len; i++) {
    if (keycode(keys[i]) === key) {
      return true;
    }
  }
  return false;
}