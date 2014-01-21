
var traverse = require('traverse');


/**
 * Expose `previousSibling`.
 */

module.exports = previousSibling;


/**
 * Get the previous sibling for an `el`.
 *
 * @param {Element} el
 * @param {String} selector (optional)
 */

function previousSibling (el, selector) {
  el = traverse('previousSibling', el, selector)[0];
  return el || null;
}