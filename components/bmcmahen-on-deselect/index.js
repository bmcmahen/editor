var event = require('event');
var raf = require('raf');
var selected = require('text-selection');
var mod = require('modifier');

var selection = window.getSelection();

module.exports = function(el, fn){
  event.bind(el, 'mouseup', callback);
  event.bind(el, 'keyup', callback);
  event.bind(el, 'blur', callback);

  function callback(e){
    if (mod(e)) return;
    var id = raf(function(){
      if (!selected()) fn(e);
      raf.cancel(id);
    });
  }

  return function unbind(){
    event.unbind(el, 'mouseup', callback);
    event.unbind(el, 'keyup', callback);
    event.unbind(el, 'blur', callback);
  }

};