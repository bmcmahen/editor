
var traverse = require('traverse');


/**
 * Expose `nextSibling`.
 */

module.exports = nextSibling;


/**
 * Get the next sibling for an `el`.
 *
 * @param {Element} el
 * @param {String} selector (optional)
 */

function nextSibling (el, selector) {
  el = traverse('nextSibling', el, selector)[0];
  return el || null;
}