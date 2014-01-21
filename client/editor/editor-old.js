// Dependencies
var k = require('k');
var toParagraphs = require('paste-to-paragraph');
var cursorWithin = require('cursor-within');
var withinSelection = require('within-selection');
var dom = require('dom');
var selectionRange = require('selection-range');
var keyname = require('keyname');
var injectAtCursor = require('inject-at-cursor');
var splitAtCursor = require('split-at-cursor');
var uid = require('uid');

// Local
var Editable = require('editable-view');
var View = require('view');
var Popover = require('redact');
var notes = require('notes');

// Template
var template = require('./templates/editor.html');


module.exports = Editor;


/**
 * Editor
 * 
 * @param {Document} doc 
 */

function Editor(doc){
  View.call(this, template);
  Editable.call(this, this.$el[0]);

  this.placeholder('Write here...', this.$el.find('p')[0]);
  this.enableEditing();
  this.bindEvents();

  // editor events
  // this.on('save', this.bound('save'));
  // this.on('change', this.bound('onchange'));
}

View(Editor);
Editable(Editor);

/**
 * Bind appropriate events.
 * 
 * @return {Editor} 
 */

Editor.prototype.bindEvents = function(){

  // Create Popover
  this.popover = new Popover(this.$el[0]);
  this.popover.add('bold', 'B');
  this.popover.add('italic', 'I');
  this.popover.add('note', 'N');
  this.popover.on('click', this.bound('ontoggle'));

  // Keyboard
  this.k = k(this.$el[0]);

  // This
  this.on('paste', this.bound('onpaste'));
  this.on('tab', this.bound('ontab'));
  this.on('delete', this.bound('ondelete'));
  this.on('delete with key', this.bound('ondeletekey'))
  this.on('removed paragraph', this.bound('onremoveparagraph'));
  this.on('enter', this.bound('oncreateparagraph'));

  return this;
}

/**
 * Listen for toggle events.
 * 
 * @param  {String} name 
 * @param  {Element} el 
 * @return {Editor}   
 */

Editor.prototype.ontoggle = function(name, el){
  if (name === 'note'){
    notes(this.$el[0]);
    return;
  }
  this.execute(name);
};

/**
 * create a new paragraph with (optional) content
 * 
 * @param  {Element} content 
 * @return {Element}         paragraph
 */

function createParagraph(content){
  var newp = dom(document.createElement('p'));
  var id = uid(4);
  newp.attr('name', id);
  if (content) {
    if (typeof content === 'string') {
      content = document.createTextNode(content);
    }
    console.log(content);
    newp.append(content);
    console.log(newp);
  }
  else newp.html('<br> ');
  this.emit('new paragraph', newp, id);
  this.emit('new paragraph:'+ id, newp);
  return newp[0];
}


function pasteToParagraph(e){
  if (e.clipboardData && e.clipboardData.getData){
    e.preventDefault();
    var fragment = document.createDocumentFragment();
    var paragraphs = e.clipboardData.getData('text/plain').split(/[\r\n]/g);
    if (paragraphs.length > 1){
      for (var p = 0, len = paragraphs.length; p < len; p++){
        if (paragraphs[p] !== '') {
          fragment.appendChild(createParagraph.call(this, paragraphs[p]));
        }
      }
    } else {
      var txt = document.createTextNode(paragraphs[0]);
      fragment.appendChild(txt);
    }
    return fragment;
  }
};


Editor.prototype.onpaste = function(e){
  var frag = pasteToParagraph.call(this, e);
  var selection = window.getSelection();
  var range = selection.getRangeAt(0);
  
  // If we have a selection, we might need to delete 
  // certain paragraphs and insert the new content.
  if (!selection.isCollapsed){
    var paragraphs = multipleParagraphs(range);
    if (paragraphs) {
      return deleteParagraphSelection.call(this, paragraphs, range, frag);
    }
  }

  // insert new fragment
  var last = frag.lastChild;
  range.insertNode(frag);
  range = range.cloneRange();
  range.setStartAfter(last);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
};

Editor.prototype.ontab = function(e){
  var selection = window.getSelection();
  var range = selection.getRangeAt(0);
  if (!range.startOffset && !range.endOffset) {
    var parent = cursorWithin('p');
    dom(parent).addClass('ingredient');
    e.preventDefault();
  }
};

// TODO: prevent second 'enter' on empty paragraph.
// TODO: rewrite this.
// TODO: we need to handle ANY key pressed if there is a selection, at least
// if multiple paragraphs are selected.
//  - Possible Delete Actions:
//    - delete selection by pressing any key
//    - delete selection by pasting
//    - delete selection by pressing enter
//    - cut a selection

Editor.prototype.ondeletekey = function(e){
  var key = keyname(e.keyCode) || String.fromCharCode(e.keyCode).toLowerCase();
  if (e.shiftKey) key = key.toUpperCase();
  this.ondelete(e, document.createTextNode(key));
};

/**
 * Get content before a selection within an element.
 * 
 * @param  {Element} el    
 * @param  {Range} range 
 * @return {Fragment}       
 */

function contentBeforeSelection(el, range){
  var r = document.createRange();
  r.setStart(el, 0);
  r.setEnd(range.startContainer, range.startOffset);
  var fragment = r.cloneContents();
  r.detach();
  return fragment;
}

/**
 * Get content after selection within an Element.
 * 
 * @param  {Element} el    
 * @param  {Range} range 
 * @return {Fragment}       
 */

function contentAfterSelection(el, range){
  var r = document.createRange();
  r.selectNodeContents(el);
  r.setStart(range.endContainer, range.endOffset);
  var fragment = r.cloneContents();
  r.detach();
  return fragment;
}

/**
 * If the user presses delete at the beginning of a 
 * paragraphs, delete the previous paragraph and merge its
 * contents.
 * 
 * @param  {Range} range 
 * @return {DOM Element}       
 */

function deleteParagraph(range){
  var el = cursorWithin('p');
  if (!el) return;
  var $el = dom(el);
  var $previous = $el.previous();
  if (!$previous.length) return;
  var previousTextLength = $previous.text().length;

  // if collapsing 2 paragraphs, combine our html, or ideally we
  // should create a new range and insert our node there.
  var txt = $el.text();
  if (txt) $previous.html($previous.html() + $el.html());

  // destroy our current p
  $el.remove();
  this.emit('removed paragraph', $el.attr('name'), $el);

  // restore cursor
  selectionRange($previous[0], previousTextLength);
  return $el;
}

/**
 * Determine if a selection contains multiple paragraphs
 * and if it does, return them.
 * 
 * @return {Array} 
 */

function multipleParagraphs(){
  var ps = withinSelection('p');
  if (ps.length < 2) return false;
  return ps;
}

/**
 * Delete a selection which contains multiple paragraphs.
 * 
 * @param  {Array} paragraphs 
 * @param  {Range} range      
 */

function deleteParagraphSelection(paragraphs, range, insert){
  var before = contentBeforeSelection(paragraphs[0], range);
  var after = contentAfterSelection(paragraphs[paragraphs.length - 1], range);
  var lenToRestore = dom(before).text().length;

  // remove old paragraphs
  for (var i = 1; i < paragraphs.length; i++) {
    var p = dom(paragraphs[i]);
    this.emit('removed paragraph', p.attr('name'), p);
    p.remove();
  }

  // append new content
  dom(paragraphs[0])
    .empty()
    .append(before);
  
  // optionally insert content (pasting)
  if (insert) {
    lenToRestore += insert.textContent.length;
    dom(paragraphs[0]).append(insert);
  } 

  // append end of old content
  dom(paragraphs[0]).append(after);

  // set cursor position to the start of our selection.
  selectionRange(paragraphs[0], lenToRestore);
}

/**
 * ondelete handler
 * 
 * @param  {Event} e        
 * @param  {Element} toInject 
 */

Editor.prototype.ondelete = function(e, toInject){
  var selection = window.getSelection();
  var range = selection.getRangeAt(0);
  
  // If collapsed and at the begining of the paragraph, then
  // delete the paragraph and potentially merge contents.
  
  if (range.collapsed) {
    if (!range.startOffset) {
      e.preventDefault();
      deleteParagraph.call(this, range);
    }

  // If not collapsed, and deletion spans multiple paragraphs,
  // then we need to merge our paragraphs.
  
  } else {
    var paragraphs = multipleParagraphs();
    if (!paragraphs) return;
    deleteParagraphSelection.call(this, paragraphs, range);
    if (toInject) injectAtCursor(toInject);
    e.preventDefault();
  }
};  



/**
 * Pressing 'enter' with a text selection behaviour.
 * 
 * @param  {Range} range 
 */

function deleteParagraphsOnEnter(range){
  var paragraphs = withinSelection('p');

  // If we have a selection, but not multiple paragraphs,
  // then we need to build a new paragraph out of
  // the text after the selection.

  if (paragraphs.length < 2) {
    var clone = range.cloneRange();
    var within = cursorWithin('p');
    clone.setEndAfter(within.lastChild);
    var after = contentAfterSelection(within, range);
    var p = createParagraph.call(this, after);
    dom(p).insertAfter(within);
    clone.extractContents();
    clone.detach();
    selectionRange(p, 0);
    return;
  }
  
  selectionRange(paragraphs[paragraphs.length - 1], 0);
  var extract = range.extractContents();

  // remove old paragraphs
  for (var i = 1; i < paragraphs.length; i++) {
    var p = dom(paragraphs[i]);
    this.emit('removed paragraph', p.attr('name'), p);
  }
}

Editor.prototype.onremoveparagraph = function(name, el){
  console.log('removed paragraph', name);
};

// also handle creation of paragraph when text is selected.
Editor.prototype.oncreateparagraph = function(e){
  e.preventDefault();
  var selection = window.getSelection();
  var range = selection.getRangeAt();

  // if there's a range: Delete the entire selection,
  // and just delete the selected part of the last paragraph,
  // leaving cursor at the beggining of that paragraph.
  if (!range.collapsed) {
    return deleteParagraphsOnEnter.call(this, range);
  }
  
  var currentParagraph = cursorWithin('p');
  
  // get content after range
  var clone = document.createRange();
  clone.selectNodeContents(currentParagraph);
  clone.setStart(range.endContainer, range.endOffset);
  var after = clone.extractContents();
  var txt = after.textContent;
  clone.detach();

  var p = createParagraph.call(this, txt && txt.trim());
  dom(p).insertAfter(currentParagraph);
  selectionRange(p, 0);
  // we need to bind event listener for when user starts typing, and we
  // can then remove our br.
};


