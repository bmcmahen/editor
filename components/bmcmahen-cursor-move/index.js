var Emitter = require('emitter');
var events = require('events');
var isKey = require('is-key');
var getPosition = require('selection-range');
var raf = require('raf');

module.exports = function(el){

  var observeCursor = {};
  var position;

  // detect if the cursor position has actually
  // changed from last time.
  var changedPosition = function(){
    var pos = getPosition(el);
    if (!pos || pos.start !== pos.end) return false;
    if (pos.start !== position) {
      position = pos.start;
      return true;
    }
  };

  // if it has changed positions, emit change.
  var emitChange = function(){
    var id = raf(function(){
      if (changedPosition()){
        observeCursor.emit('change', position);
      }
      raf.cancel(id);
    });
  };

  // event handlers.
  observeCursor.onmouseup = emitChange;
  observeCursor.onkeydown = function(e){
    if (isKey(e, ['left', 'right', 'up', 'down'])) {
      emitChange();
    }
  };

  // bind events.
  var changeEvents = events(el, observeCursor);
  changeEvents.bind('keydown');
  changeEvents.bind('mouseup');

  Emitter(observeCursor);

  observeCursor.unbind = function(){
    changeEvents.unbind();
  };

  return observeCursor;
};