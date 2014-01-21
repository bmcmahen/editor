var dom = require('dom');
var Emitter = require('emitter');
var inherit = require('inherit');
var reactive = require('reactive');

module.exports = View;

var delegateEventSplitter = /^(\S+)\s*(.*)$/;


/**
 * View Constructor
 * 
 * @param {Element} el 
 */

function View(el){
  if (!(this instanceof View)) return inherit(el, View);
  this.$el = dom(el);
  this._listeners = {};
  this._bound = {};
}

Emitter(View.prototype);


/**
 * Remove el from DOM and cleanup listeners
 * 
 * @return {View}
 */

View.prototype.remove = function(){
  this.$el.remove();
  this.emit('remove');
  return this;
};


/**
 * Enable reactivity with a model or view.
 * 
 * @param  {Emitter} model 
 * @return {View}      
 */

View.prototype.react = function(model){
  this.reactive = reactive(this.el[0], model || this, this);
  return this;
};


/**
 * Delegate events to View Element. Note: This won't 
 * work for focus, blur, change, submit, reset.
 *  
 * @param  {String} str    event & selector
 * @param  {String} fnName 
 * @return {View} 
 */

View.prototype.bind = function(str, fnName){
  var self = this;
  var match = str.match(delegateEventSplitter);
  var eventName = match[1];
  var selector = match[2];
  var method = this[fnName].bind(this);

  this._listeners[str + fnName] = method;

  if (selector === '') this.$el.on(eventName, method);
  else this.$el.on(eventName, selector, method);

  return this;
};

/**
 * Unbind bound events
 * 
 * @param  {String} str    
 * @param  {String} fnName 
 * @return {View}        
 */

View.prototype.unbind = function(str, fnName){
  var match = str.match(delegateEventSplitter);
  var eventName = match[1];
  var selector = match[2];
  var fn = this._listeners[str + fnName];
  // unbind
  if (selector === '') this.$el.off(eventName, fn);
  else this.$el.off(eventName, selector, fn);
  delete this._listeners[str + fnName];
  return this;
};

/**
 * Create/Retrieve a bound function.
 * 
 * @param  {String} fnName 
 * @return {Function}      
 */

View.prototype.bound = function(fnName){
  if (!this._bound[fnName]) {
    this._bound[fnName] = this[fnName].bind(this);
  }
  return this._bound[fnName];
};


