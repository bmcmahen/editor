
/**
 * stop propagation on the given `e`.
 * 
 * examples:
 * 
 *      anchor.onclick = require('stop');
 *      anchor.onclick = function(e){
 *        if (!some) return require('stop')(e);
 *      };
 * 
 * 
 * @param {Event} e
 */

module.exports = function(e){
  e = e || window.event;
  return e.stopPropagation
    ? e.stopPropagation()
    : e.cancelBubble = true;
};
