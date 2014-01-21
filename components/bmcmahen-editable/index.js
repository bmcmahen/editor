
// Dependencies
var History = require('history');
var Emitter = require('emitter');
var events = require('events');
var autosave = require('auto-save')(500);
var position = require('selection-range');
var selected = require('monitor-text-selection');
var placeholder = require('editable-placeholder');
var cursor = require('cursor-move');
var isKey = require('is-key');


module.exports = Editable;


/**
 * Initialize new `Editable`.
 *
 * @param {Element} el
 * @param {Array} stack
 */

function Editable(el, stack){
  var self = this instanceof Editable;
  if (!self) return new Editable(el, stack);
  if (!el) throw new TypeError('expects an element');
  this.history = new History(stack || []);
  this.history.max(100);
  this.events = events(el, this);
  this.el = el;
}

/**
 * Mixins.
 */

Emitter(Editable.prototype);

/**
 * Get/set editable contents.
 *
 * @return {String}
 * @api public
 */

Editable.prototype.toString =
Editable.prototype.contents = function(str){
  if (str) return this.el.innerHTML = str;
  return this.el.innerHTML;
};


/**
 * Add Placeholder to ContentEditable
 * @param {String} str 
 */

Editable.prototype.addPlaceholder = function(str){
  placeholder(this.el, str);
  return this;
};

/**
 * Emit selection and deselection events.
 * @return {Editable} 
 */

Editable.prototype.monitorSelections = function(){
  var select = selected(this.el);
  var self = this;
  var currentSelection; 
  select.on('selected', function(sel){
    currentSelection = sel;
    self.emit('selected', sel);
  });
  select.on('deselected', function(){
    self.emit('deselected', currentSelection);
  });
  return this;
};

/**
 * Emit cursor-movement events.
 * @return {Editable} 
 */

Editable.prototype.monitorCursor = function(){
  var c = cursor(this.el);
  var self = this;
  c.on('change', function(pos){
    self.emit('cursormove', pos);
  });
  return this;
};

/**
 * Toggle editable state.
 *
 * @return {Editable}
 * @api public
 */

Editable.prototype.toggle = function(){
  return 'true' == this.el.contentEditable
    ? this.disable()
    : this.enable();
};

/**
 * Enable editable.
 *
 * @return {Editable}
 * @api public
 */

Editable.prototype.enable = function(){
  this.el.contentEditable = true;
  this.events.bind('keyup');
  this.events.bind('keydown');
  this.events.bind('keypress');
  this.events.bind('paste');
  this.events.bind('cut');
  this.events.bind('input', 'onchange');
  this.emit('enable');
  return this;
};


/**
 * Disable editable.
 *
 * @return {Editable}
 * @api public
 */

Editable.prototype.disable = function(){
  this.el.contentEditable = false;
  this.events.unbind();
  this.emit('disable');
  return this;
};

/**
 * Undo.
 *
 * @return {Editable}
 * @api public
 */

Editable.prototype.undo = function(){
  
  // If we are undoing for the first time in a sequence of undos
  // then we need to record the current state, in case we want
  // to redo our undo. 
  
  var first = this.history.isFirstUndo;
  var buf = this.history.prev();
  if (!buf) return;
  if (first) this.addToHistory({ stay : true });

  this.contents(buf);
  this.restoreCursor(buf);
  this.emit('change');
  this.emit('undo', buf);
  return this;
};

/**
 * Given a buf state, restore our cursor to either
 * a selection or a particular point.
 * @param  {String} buf 
 * @return {Editable}    
 * @api private 
 */

Editable.prototype.restoreCursor = function(buf){
  if (typeof buf.start != 'undefined'){
    if (buf.end) position(this.el, buf.start, buf.end);
    else position(this.el, buf.start);
  }
  return this;
};

/**
 * Redo.
 *
 * @return {Editable}
 * @api public
 */

Editable.prototype.redo = function(){
  var buf = this.history.next();
  if (!buf) return this;
  this.contents(buf);
  this.restoreCursor(buf);
  this.emit('change');
  this.emit('redo', buf);
  return this;
};

/**
 * Add current contents of el to our history, including
 * cursor selection/position if it exists.
 * @return {Editable} 
 * @api private
 */

Editable.prototype.addToHistory = function(options){
  var buf = new String(this.toString());
  var pos = position(this.el);
  if (pos){
    buf.start = pos.start;
    if (pos.start != pos.end) {
      buf.end = pos.end;
    }
  }
  this.history.add(buf, options);
  this.emit('addtohistory');
  return this;
};


/**
 * Execute the given `cmd` with `val`.
 *
 * @param {String} cmd
 * @param {Mixed} val
 * @return {Editable}
 * @api public
 */

Editable.prototype.execute = function(cmd, val){
  document.execCommand(cmd, false, val);
  this.emit('change');
  this.emit('execute', cmd, val);
  return this;
};

/**
 * Query `cmd` state.
 *
 * @param {String} cmd
 * @return {Boolean}
 * @api public
 */

Editable.prototype.state = function(cmd){
  var length = this.history.vals.length - 1
    , stack = this.history;

  if ('undo' == cmd) return 0 < stack.i;
  if ('redo' == cmd) return length > stack.i;
  return document.queryCommandState(cmd);
};


/**
 * onkeyup check for creation of new paragraphs
 * @param  {Event} e 
 * @return {Editable}   
 */

Editable.prototype.onkeyup = function(e){
  if (this.monitorParagraphs){
    if (isKey(e, ['enter'])){
      this.emit('newparagraph');
    } 
  }
  return this;
};

/**
 * Determine if the user has pressed the delete key,
 * which is not triggered by onkeypress, and manually
 * trigger onkeypress.
 * @param  {Event} e 
 * @return {Edtiable}   
 */

Editable.prototype.onkeydown = function(e){
  if (isKey(e, ['del', 'backspace'])){
    this.onkeypress();
  }
  return this;
};

/**
 * onchange listener, which calls `addToHistory` at
 * specified interval.
 * @param {Event} e
 */

Editable.prototype.onkeypress = function(e){
  this.emit('change');
  if (!this.pushedToHistory) {
    this.addToHistory();
    this.pushedToHistory = true;
  }
};


/**
 * onchange trigger our autosave function, which 
 * will callback after a set duration of inactivity.
 * @param  {Event} e 
 * @return {Editable}  
 * @api private 
 */

Editable.prototype.onchange = function(e){
  var self = this;
  autosave(function(){
    self.pushedToHistory = false;
    self.emit('save');
  });
  return this;
};


Editable.prototype.oncut = function(e){
  this.addToHistory();
  this.emit('save');
  this.emit('change');
  this.emit('cut');
  return this;
}

/**
 * onpaste, add changes to history.
 * @param  {Event} e 
 * @return {Editable}
 */

Editable.prototype.onpaste = function(e){
  this.addToHistory();
  this.emit('save');
  this.emit('change');
  this.emit('paste');
  return this;
};

