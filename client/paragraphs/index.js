// Dependencies
var Emitter = require('emitter');
var withinSelection = require('within-selection');
var cursorWithin = require('cursor-within');
var selection = window.getSelection();
var selectionRange = require('selection-range');
var dom = require('dom');


// Local
var Paragraph = require('paragraph');

// Export
module.exports = Paragraphs;

/**
 * Paragraphs Collection
 * 
 * @param {Array} docs 
 */

function Paragraphs(docs){
  this.paragraphs = {};
}

Emitter(Paragraphs.prototype);

/**
 * Add a new paragraph.
 * 
 * @param {String|Element} content 
 * @return {Paragraph} 
 */

Paragraphs.prototype.add = function(content){
  var p = new Paragraph(content);
  this.paragraphs[p.id] = p;
  this.emit('added paragraph', p.id, p);
  return p;
};

/**
 * Remove a paragraph.
 * 
 * @param  {String} id 
 * @return {Paragraphs} 
 */

Paragraphs.prototype.remove = function(ps){
  var remove = function(id){
    var p = this.get(id);
    if (p) {
      p.remove();
      this.emit('removed paragraph', id, p);
      this.emit('removed paragraph:', id, p);
    }
  }
  if (Array.isArray(ps)) ps.forEach(remove.bind(this));
  else remove.apply(this, arguments);
  return this;
};


/**
 * Return the active paragraphs.
 * 
 * If we have a cursor, returns the paragraph which
 * contains the cursor.
 * 
 * If we have a selection, return the paragraph(s) 
 * spanning the selection. 
 * 
 * @return {Array}
 */

Paragraphs.prototype.current = function(){
  var range = selection.getRangeAt(0);

  var within = function(){
    var p = cursorWithin('p');
    return p ? [this.get(p.getAttribute('name'))] : [];
  }.bind(this);

  console.log(cursorWithin('p'));

  if (range.collapsed) return within();

  var ps = withinSelection('p');
  if (ps.length) {
    return ps.map(function(el){
      return this.get(el.getAttribute('name'));
    }, this);
  } else {
    return within();
  }
}

/**
 * Get a Paragraph
 * 
 * @param  {String} id 
 * @return {Paragraph}    
 */

Paragraphs.prototype.get = function(id){
  return this.paragraphs[id];
};

/**
 * Merge paragraph 2 (p2) into paragraph 1 (p1)
 * - should this be part of 'paragraphs'?
 * 
 * @param {paragraph} p1 
 * @param {Paragraph} p2 
 * @return {Paragraph} new paragraph
 */

Paragraphs.prototype.merge = function(p1, p2){
  var remaining = p2.isEmpty() ? '' : p2.$el.html();
  var previousTxtLen = p1.$el.text().length;
  if (p1.isEmpty() && remaining) {
    p1.$el.empty();
    previousTxtLen -= 1;
  }
  p1.$el.html(p1.$el.html() + remaining);
  selectionRange(p1.el, previousTxtLen);
  p2.remove();
  return p1;
};

/**
 * Extract a range from multiple paragraphs.
 * - should this be part of 'paragraphs'?
 * 
 * @param  {Array} paragraphs 
 * @param  {String|Element} insert     
 * @return {Paragraph}            
 */

function isEmpty(el){
  return !el.textContent.trim().length;
}

Paragraphs.prototype.extractRange = function(paragraphs, insert){
  var first = paragraphs[0];
  var last = paragraphs[paragraphs.length - 1];
  var before = first.contentBeforeSelection();
  var after = last.contentAfterSelection();

  // remove old paragraphs
  for (var i = 1; i < paragraphs.length; i++) {
    paragraphs[i].remove();
  }

  // append new content
  // if the user is just deleting two paragraphs, we
  // need to ensure that we add our empty placeholder.
  if (isEmpty(before) && isEmpty(after) && !insert) {
    first.empty();
  } else {
    first.$el.empty().append(before);
  }

  if (insert) {
    first.$el.append(insert);
  }

  // restore cursor
  first.cursorToEnd();

  // append content after
  first.$el.append(after);
};

/**
 * Similar to the above function, but used if we are inserting
 * paragraphs into the DOM (notably for pasting).
 * 
 * @param  {Array} paragraphs 
 * @param  {Fragment} insert     
 */

Paragraphs.prototype.extractAndInsertParagraphs = function(paragraphs, insert){
  var first = paragraphs[0];
  var last = paragraphs[paragraphs.length - 1];
  var after = last.extractAfterSelection();
  var $frag = dom(insert);
  var $p = $frag.find('p');

  for (var i = 1; i < paragraphs.length; i++){
    paragraphs[i].remove();
  }

  $frag.insertAfter(first.$el);
  var $last = $p.last();
  this.get($last.name()).cursorToEnd();
  $last.append(after);
}

/**
 * Insert an array of text nodes into our document.
 * 
 * @param  {Array} paragraphs 
 * @param  {Array} text       
 */

Paragraphs.prototype.insertText = function(paragraphs, text){
  var first = paragraphs[0];
  var last = paragraphs[paragraphs.length - 1];
  var after = last.extractAfterSelection();

  // Append our first line of text to our current paragraph
  first.$el.append(document.createTextNode(text[0]));

  // Insert multiple paragraphs
  if (text.length > 1) {
    var fragment = document.createDocumentFragment();
    for (var i = 1; i < text.length; i++) {
      if (text[i].trim() != ''){
        var p = this.add(document.createTextNode(text[i]));
        fragment.appendChild(p.el);
      }
    }

    var $frag = dom(fragment);
    var $last = $frag.find('p').last();
    $frag.insertAfter(first.$el);
    this.get($last.name()).cursorToEnd();
    if (!isEmpty(after)) $last.append(after);
    return;
  }

  // If only inserting one line, set cursor to end, append extra
  this.get(last.$el.name()).cursorToEnd();
  if (!isEmpty(after)) last.$el.append(after);
}

/**
 * Get the paragraph after.
 * 
 * @param  {Paragraph} p 
 * @return {Paragraph}   
 */

Paragraphs.prototype.after = function(p){
  var name = p.$el.next().name();
  if (name) return this.get(name);
};

/**
 * Get the paragraph before.
 * 
 * @param  {Paragraph} p 
 * @return {Paragraph}   
 */

Paragraphs.prototype.before = function(p){
  var name = p.$el.previous().name();
  if (name) return this.get(name);
};

/**
 * Serialize the DOM into Paragraphs
 * 
 * @param  {Element} $el 
 */

Paragraphs.prototype.serialize = function($el){
  var self = this;
  self.paragraphs = {};
  $el.find('p').each(function($p){
    var p = new Paragraph(null, null, $p[0]);
    self.paragraphs[p.id] = p;
  });
}

