/**
 * Module Dependencies
 */

var domify = require('domify');
var selection = window.getSelection;

/**
 * Expose `inject`
 */

module.exports = inject;

/**
 * Inject content at the cursor
 *
 * @param {String|Element} content
 * @return {Element|Text Node}
 * @api public
 */

function inject(content) {
  content = (content.nodeType) ? content : domify(content);
  var sel = selection();

  if (sel.getRangeAt && sel.rangeCount) {
    var range = sel.getRangeAt(0);

    // remove selected content (if any)
    range.deleteContents();

    // insert new content
    range.insertNode(content);

    // clear existing ranges
    sel.removeAllRanges();

    // place cursor after content
    range.setEndAfter(content);
    range.collapse();

    // add range to selection
    sel.addRange(range);

    // discard range
    range.detach();
  }

  return content;
}
