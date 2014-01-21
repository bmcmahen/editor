var Emitter = require('emitter');
var autosave = require('auto-save')(1000);
var position = require('selection-range');
var placeholder = require('editable-placeholder');
var isKey = require('is-key');
var inherit = require('inherit');
var View = require('view');
var cursorWithin = require('cursor-within'); 
var dom = require('dom');
var uid = require('uid');

module.exports = Editable;

function Editable(el, stack){
  if (!(this instanceof Editable)) return inherit(el, Editable);
  View.call(this, el);
}

View(Editable);

Editable.prototype.contents = function(str){
  if (str) return this.$el.html(str);
  return this.$el.html();
};

Editable.prototype.placeholder = function(str, el){
  placeholder(el || this.$el[0], str, this.$el[0]);
  return this;
};

Editable.prototype.enableEditing = function(){
  this.$el.attr('contentEditable', true);
  this.bind('keydown', '_onkeydown');
  this.bind('keypress', '_onkeypress');
  this.bind('paste', '_onpaste');
  this.bind('cut', '_oncut');
  this.bind('input', '_onchange');
  this.emit('enable');
  return this;
};

Editable.prototype.disableEditing = function(){
  this.$el.attr('contentEditable', false);
  this.unbind('keydown', '_onkeydown');
  this.unbind('keypress', '_onkeypress');
  this.unbind('paste', '_onpaste');
  this.unbind('cut', '_oncut');
  this.unbind('input', '_onchange');
  this.emit('disable');
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
 * Determine if the user has pressed the delete key,
 * which is not triggered by onkeypress, and manually
 * trigger onkeypress.
 * 
 * @param  {Event} e 
 * @return {Edtiable}   
 */

Editable.prototype._onkeydown = function(e){
  if (isKey(e, ['del', 'backspace'])){
    this.emit('delete', e);
    this._onkeypress();
  }
  else if (isKey(e, ['enter'])){ this.emit('enter', e); }
  else if (isKey(e, ['tab'])){ this.emit('tab', e); }
  return this;
};

/**
 * onchange listener, which calls `addToHistory` at
 * specified interval.
 * @param {Event} e
 */

var sel = window.getSelection();

Editable.prototype._onkeypress = function(e){
  this.emit('keypress', e);
  this.emit('change');
  if (!sel.isCollapsed && e) {
    this.emit('delete with key', e);
  }
  if (!this.pushedToHistory) {
    this.emit('add to history');
    this.pushedToHistory = true;
  }
};

/**
 * onchange trigger our autosave function, which 
 * will callback after a set duration of inactivity.
 * 
 * @param  {Event} e 
 * @return {Editable}  
 * @api private 
 */


Editable.prototype._onchange = function(e){
  var self = this;
  autosave(function(){
    console.log('push to history, false');
    self.pushedToHistory = false;
    self.emit('save');
  });
  return this;
};

Editable.prototype._oncut = function(e){
  this.emit('add to history');
  this.emit('save');
  this.emit('change');
  this.emit('cut');
  return this;
};

/**
 * onpaste, add changes to history.
 * 
 * @param  {Event} e 
 * @return {Editable}
 */

Editable.prototype._onpaste = function(e){
  this.emit('add to history');
  this.emit('save');
  this.emit('change');
  this.emit('paste', e);

  return this;
};