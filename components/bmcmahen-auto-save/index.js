/**
 * Basically a glorified setTimeout that I inevitably
 * implement in any auto-save context.
 * @param  {Number} time ms
 * @return {Timer}      
 */

module.exports = function(time){
  var time = time || 1000;
  var timer;
  var resetTimer = function(fn){
    timer = setTimeout(fn, time);
  };
  return function(fn){
    clearTimeout(timer);
    resetTimer(fn);
  }
};

