// Dependencies
var selection = window.getSelection();
var k = require('k');
var keyname = require('keyname');
var dom = require('dom');
var selectionRange = require('selection-range');

// Local
var Editable = require('editable-view');
var View = require('view');
var Popover = require('redact');
var notes = require('notes');
var Paragraphs = require('paragraphs');
var History = require('history');


// Template
var template = require('./templates/editor.html');


module.exports = Editor;


/**
 * Editor
 * 
 * @param {Document} doc 
 */

function Editor(doc, stack){
  View.call(this, template);
  Editable.call(this, this.$el[0]);
  this.enableEditing();
  this.paragraphs = new Paragraphs();


  var p = this.paragraphs.add();
  p.isFirst = true;
  this.$el.append(p.el);
  p.$el.addClass('first');
  p.cursorToStart();
  // silly hack -> our el needs to be empty for the placeholder

  this.history = new History();
  this.addToHistory();

  p.$el.empty();
  this.placeholder('Write here...', this.$el.find('p')[0]);
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
  this.k = k(window);
  this.k('super + z', this.bound('undo'));
  this.k('super + k', this.bound('redo'));

  // This
  this.on('paste', this.bound('onpaste'));
  this.on('tab', this.bound('ontab'));
  this.on('delete', this.bound('ondelete'));
  this.on('delete with key', this.bound('onkeywithselection'))
  this.on('enter', this.bound('onenter'));
  this.on('add to history', this.bound('addToHistory'));

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
 * When 'enter' key pressed.
 * 
 * @param  {Event} e 
 */

Editor.prototype.onenter = function(e){
  var range = selection.getRangeAt(0);
  var current = this.paragraphs.current();
  var p = current[0];

  if (range.collapsed){
    
    e.preventDefault();

    // prevent user from pressing 'return' on an empty
    // first paragraph.
    if (p.isFirst && p.$el.hasClass('editable-placeholder')){
      return;
    }
    
    // allow at most 1 empty paragraph surrounding another p.
    var next = this.paragraphs.after(p);
    var prev = this.paragraphs.before(p);
    if (p.isEmpty() || (prev && prev.isEmpty())){
      return;
    }
    if (next && next.isEmpty()) {
      next.cursorToStart();
      return;
    }


    var prior = p.contentBeforeSelection();
    var remaining = p.extractAfterSelection();
    if (!remaining.textContent.trim()) remaining = null;

    // if we are at the start of the element, add 'empty placeholder'
    // to 'current p'.
    
    if (!prior.textContent.trim()) p.empty();

    var newParagraph = this.paragraphs.add(remaining);
    if (p.isIngredient) newParagraph.makeIngredient();
    newParagraph
      .insertAfter(p.el)
      .cursorToStart();
  }

  // If we only have a selection of one paragraph
  // just let the browser handle it.
  
  if (current.length < 2) return;

  // Otherwise, we delete extract the selection contents,
  // and set our cursor to the beginning of the last paragraph
  // in the selection.

  range.extractContents();
  if (current.length) {
    e.preventDefault();
    current[current.length - 1].cursorToStart();
  }


  // We need to manually remove any paragraphs that could
  // have been in the middle.

  if (current.length > 2) {
    for (var i = 1; i < current.length - 1; i++) {
      current[i].remove();
    }
  }
};

/**
 * Event: Delete key pressed.
 * Action: Merge paragraphs, delete selection.
 * 
 * @param  {Event} e      
 * @param  {Element} inject 
 */

Editor.prototype.ondelete = function(e, inject){
  var current = this.paragraphs.current();
  var range = selection.getRangeAt(0);

  // Prevent deletion on rare circumstances where the cursor
  // escapes a paragraph :o
  if (!current.length && range.collapsed) {
    e.preventDefault();
    return;
  }

  // 'Delete' is pressed at the beginning of a paragraph.
  if (range.collapsed){
    if (current[0] && current[0].atStart()) {
      e.preventDefault();

      // Remove ingredient class when pressing 'delete' at
      // the beginning of an ingredient paragraph.
      if (current[0].isIngredient) {
        return current[0].removeIngredient();
      }

      var previous = this.paragraphs.before(current[0]);
      if (!previous) return;
      this.paragraphs.merge(previous, current[0]);
    }

  // 'Delete' is pressed while spanning multiple paragraphs.
  } else {
    if (!this.pushedToHistory){
      this.addToHistory();
      this.pushedToHistory = true;
    }

    if (current.length < 2) return;
    var range = document.createRange();
    this.paragraphs.extractRange(current, inject);
    // lame hack -> sometimes when the user selects all the text,
    // the cursor isn't placed back into the first 'p', so we
    // need to manully do this.
    if (!this.$el.text().trim().length){
      var first = this.$el.find('p');
      var p = this.paragraphs.get(first.name());
      p.empty();
      p.cursorToStart();
    }
    e.preventDefault();
  }
}

/**
 * Event: Key pressed with selection.
 * Action: Delete contents, insert key.
 * 
 * @param  {Event} e 
 */

Editor.prototype.onkeywithselection = function(e){
  var key = keyname(e.keyCode) || String.fromCharCode(e.keyCode).toLowerCase();
  if (e.shiftKey) key = key.toUpperCase();
  this.ondelete(e, document.createTextNode(key));
};


/**
 * Event: Paste
 * Action: Format contents, delete selection, insert contents.
 * 
 * @param  {Event} e 
 */

Editor.prototype.onpaste = function(e){
  if (e.clipboardData && e.clipboardData.getData){
    e.preventDefault();
    var txt = e.clipboardData.getData('text/plain').split(/[\r\n]/g);
    var current = this.paragraphs.current();
    var selection = window.getSelection();
    var range = selection.getRangeAt(0);

    if (range.collapsed){
      if (current[0] && current[0].$el.hasClass('editable-placeholder')){
        current[0].$el.empty();
      }
    } else {
      range.extractContents();
    }

    this.paragraphs.insertText(current, txt);
  }
};

/**
 * Event: Tab
 * Action: Make ingredient.
 * 
 * @param  {Event} e 
 */

Editor.prototype.ontab = function(e){
  var range = selection.getRangeAt(0);

  // maintain regular tab usage when not at beginning
  // of the paragraph.
  if (range.collapsed && range.startOffset) return;

  this.paragraphs
    .current()
    .forEach(function(p){
      p.makeIngredient();
    });

  e.preventDefault();
};


Editor.prototype.undo = function(e){
  if (e) e.preventDefault();
  if (!this.firstUndo){
    this.history.back();
  } else {
    this.addToHistory(true);
    this.firstUndo = false;
  }

  var buf = this.history.current();
  if (!buf) return;
  this.contents(buf);
  this.checkParagraphs(buf);
  this.restoreCursor(buf);
  this.emit('undo', buf);
};

Editor.prototype.redo = function(e){
  this.firstUndo = false;
  if (e) e.preventDefault();
  this.history.forward();
  console.log(this.history.i, this.history.steps.length);
  var buf = this.history.current();
  if (!buf) return;
  this.contents(buf);
  this.checkParagraphs(buf);
  this.restoreCursor(buf);
  this.emit('redo', buf);
};


Editor.prototype.restoreCursor = function(buf){
  if (typeof buf.start != 'undefined'){
    if (buf.end) selectionRange(this.$el[0], buf.start, buf.end);
    else selectionRange(this.$el[0], buf.start);
  }
};

Editor.prototype.addToHistory = function(stay){
  this.firstUndo = true;
  var buf = new String(this.contents());
  var pos = selectionRange(this.$el[0]);
  if (pos) {
    buf.start = pos.start;
    if (pos.start != pos.end) {
      buf.end = pos.end;
    }
  }
  buf.start = buf.start || 0;
  this.history.add(buf, stay);
  console.log(this.history.steps);
};

Editor.prototype.checkParagraphs = function(buf){
  this.paragraphs.serialize(this.$el);
  // there's a few strategies here. 
  // 1) we could simply wipe our 'paragraphs' collection,
  //    and reserialize the entire damn thing. (get all our paragraphs,
  //    create new paragraph model, etc.);
}


