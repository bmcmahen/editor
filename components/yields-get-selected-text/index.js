
/**
 * Selection
 */

var selection = window.getSelection
  ? window.getSelection()
  : document.selection;

/**
 * Get user selected text.
 *
 * @return {String}
 * @api public
 */

module.exports = function(){
  return selection.toString();
};
