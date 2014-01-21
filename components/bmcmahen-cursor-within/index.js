var closest = require('closest');

/**
 * Get the first matching element in which the 
 * cursor is contained.
 * @param  {String} selector 
 * @return {Element}          
 */

module.exports = function(selector){
  var selection;
  var node;

  // Good browsers
  if (window.getSelection){
    selection = window.getSelection();
    if (selection.anchorNode) {
      var anchor = selection.anchorNode;
      node = anchor.nodeType === 3
        ? anchor.parentNode
        : anchor;
    // Less good, good browsers.
    } else {
      var range = selection.getRangeAt(0);
      node = range.commonAncestorContainer.parentNode;
    }

  // IE fallback
  } else if (document.selection){
    node = document.selection.createRange().parentElement();
  }
  
  return closest(node, selector, true);
};