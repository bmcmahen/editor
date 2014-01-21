/**
 * Module dependencies
 */

var selection = window.getSelection;

/**
 * Export `element`
 */

module.exports = element;

/**
 * Initialize `element`. Optionally
 * set the top-level element of the
 * selection.
 *
 * @param {Element} el (optional)
 * @return {Element}
 * @api private
 */

function element(el) {
  el = el || document.body;
  var sel = selection();
  var node = get(sel.focusNode, el);

  // cursor
  if (sel.isCollapsed) {
    return node && within(node, el) ? node : el;
  }

  // selection
  var range = sel.getRangeAt(0);
  var ancestor = get(range.commonAncestorContainer, el);
  return ancestor && within(ancestor, el) ? ancestor : el;
}

/**
 * Get the first element of `node`
 * stopping at `root`
 *
 * @param {Element} node
 * @return {Element|null}
 * @api private
 */

function get(node, parent) {
  while(node && 1 != node.nodeType) {
    if (node == parent) return parent;
    node = node.parentNode;
  }

  return node || parent;
}

/**
 * Check to see if the `el` is within `parent`
 *
 * @param {Element} el
 * @param {Element} parent
 * @return {Boolean}
 * @api private
 */

function within(el, parent) {
  while(el) {
    if (el == parent) return true;
    el = el.parentNode;
  }
  return false;
}
