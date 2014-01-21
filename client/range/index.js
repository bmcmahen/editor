// Dependencies
var selection = window.getSelection();
var selectionRange = require('selection-range');

// Exports
module.exports = Range;


/**
 * Element Range helper
 * 
 * @param {Element} el 
 */

function Range(el){
  this.el = el;
}

/**
 * Get content before a selection within an element.
 *   
 * @param  {Boolean} extract 
 * @return {Fragment}       
 */

Range.prototype.contentBeforeSelection = function(extract){
  var range = selection.getRangeAt(0);
  var r = document.createRange();
  r.setStart(this.el, 0);
  r.setEnd(range.startContainer, range.startOffset);
  var fragment = extract
    ? r.extractContents()
    : r.cloneContents();
  r.detach();
  return fragment;
};

Range.prototype.extractBeforeSelection = function(){
  return this.contentBeforeSelection(true);
};

/**
 * Get content after selection within an Element.
 * 
 * @param  {Element} el    
 * @param  {Range} range 
 * @return {Fragment}       
 */

Range.prototype.contentAfterSelection = function(extract){
  var range = selection.getRangeAt(0);
  var r = document.createRange();
  r.selectNodeContents(this.el);
  r.setStart(range.endContainer, range.endOffset);
  var fragment = extract 
    ? r.extractContents() 
    : r.cloneContents();
  r.detach();
  return fragment;
};

Range.prototype.extractAfterSelection = function(){
  return this.contentAfterSelection(true);
};

/**
 * Move cursor to start of el.
 * 
 * @param  {Element} el 
 * @param  {Range} range 
 * @return {Range}    
 */

Range.prototype.cursorToStart = function(){
  return this.set(1);
};

/**
 * Move cursor to end of el.
 * 
 * @param  {Element} el    
 * @param  {Range} range 
 * @return {Range}       
 */

Range.prototype.cursorToEnd = function(){
  var r = document.createRange();
  r.selectNodeContents(this.el);
  r.collapse();
  selection.removeAllRanges();
  selection.addRange(r);
  return r;
};


/**
 * Select an entire node.
 * 
 * @param  {Element} el    
 * @param  {Range} range 
 * @return {Range}       
 */

Range.prototype.selectNode = function(){
  var r = document.createRange();
  r.selectNode(this.el);
  selection.removeAllRanges();
  selection.addRange(r);
  return r;
};

/**
 * Set range of an element to a start and end index.
 * 
 * @param {Element} el    
 * @param {Number} start 
 * @param {Number} end   
 */

Range.prototype.set = function(start, end){
  selectionRange(this.el, start, end);
};


/**
 * Is the cursor/selection at the beggining of the
 * element?
 * 
 * @return {Boolean} 
 */

Range.prototype.atStart = function(){
  var pos = selectionRange(this.el);
  return !pos.start;
};