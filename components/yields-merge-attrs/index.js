
/**
 * Export `merge`
 */

module.exports = merge;

/**
 * Merge `b`'s attrs into `a`.
 *
 * @param {Element} a
 * @param {Element} b
 * @api public
 */

function merge(a, b){
  for (var i = 0; i < b.attributes.length; ++i) {
    var attr = b.attributes[i];
    if (ignore(a, attr)) continue;
    a.setAttribute(attr.name, attr.value);
  }
}

/**
 * Check if `attr` should be ignored.
 *
 * @param {Element} a
 * @param {Attr} attr
 * @return {Boolean}
 * @api private
 */

function ignore(a, attr){
  return !attr.specified
    || 'class' == attr.name
    || 'id' == attr.name
    || a.hasAttribute(attr.name);
}
