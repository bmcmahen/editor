
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("yields-get-selected-text/index.js", function(exports, require, module){

/**
 * Selection
 */

var selection = window.getSelection
  ? window.getSelection()
  : document.selection;

/**
 * Get user selected text.
 *
 * @return {String}
 * @api public
 */

module.exports = function(){
  return selection.toString();
};

});
require.register("component-indexof/index.js", function(exports, require, module){
module.exports = function(arr, obj){
  if (arr.indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
});
require.register("component-emitter/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  fn._off = on;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var i = index(callbacks, fn._off || fn);
  if (~i) callbacks.splice(i, 1);
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

});
require.register("component-event/index.js", function(exports, require, module){

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, type, fn, capture){
  if (el.addEventListener) {
    el.addEventListener(type, fn, capture);
  } else {
    el.attachEvent('on' + type, fn);
  }
  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  if (el.removeEventListener) {
    el.removeEventListener(type, fn, capture);
  } else {
    el.detachEvent('on' + type, fn);
  }
  return fn;
};

});
require.register("component-query/index.js", function(exports, require, module){
function one(selector, el) {
  return el.querySelector(selector);
}

exports = module.exports = function(selector, el){
  el = el || document;
  return one(selector, el);
};

exports.all = function(selector, el){
  el = el || document;
  return el.querySelectorAll(selector);
};

exports.engine = function(obj){
  if (!obj.one) throw new Error('.one callback required');
  if (!obj.all) throw new Error('.all callback required');
  one = obj.one;
  exports.all = obj.all;
  return exports;
};

});
require.register("component-matches-selector/index.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var query = require('query');

/**
 * Element prototype.
 */

var proto = Element.prototype;

/**
 * Vendor function.
 */

var vendor = proto.matches
  || proto.webkitMatchesSelector
  || proto.mozMatchesSelector
  || proto.msMatchesSelector
  || proto.oMatchesSelector;

/**
 * Expose `match()`.
 */

module.exports = match;

/**
 * Match `el` to `selector`.
 *
 * @param {Element} el
 * @param {String} selector
 * @return {Boolean}
 * @api public
 */

function match(el, selector) {
  if (vendor) return vendor.call(el, selector);
  var nodes = query.all(selector, el.parentNode);
  for (var i = 0; i < nodes.length; ++i) {
    if (nodes[i] == el) return true;
  }
  return false;
}

});
require.register("component-delegate/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var matches = require('matches-selector')
  , event = require('event');

/**
 * Delegate event `type` to `selector`
 * and invoke `fn(e)`. A callback function
 * is returned which may be passed to `.unbind()`.
 *
 * @param {Element} el
 * @param {String} selector
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, selector, type, fn, capture){
  return event.bind(el, type, function(e){
    if (matches(e.target, selector)) fn(e);
  }, capture);
  return callback;
};

/**
 * Unbind event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  event.unbind(el, type, fn, capture);
};

});
require.register("component-events/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var events = require('event');
var delegate = require('delegate');

/**
 * Expose `Events`.
 */

module.exports = Events;

/**
 * Initialize an `Events` with the given
 * `el` object which events will be bound to,
 * and the `obj` which will receive method calls.
 *
 * @param {Object} el
 * @param {Object} obj
 * @api public
 */

function Events(el, obj) {
  if (!(this instanceof Events)) return new Events(el, obj);
  if (!el) throw new Error('element required');
  if (!obj) throw new Error('object required');
  this.el = el;
  this.obj = obj;
  this._events = {};
}

/**
 * Subscription helper.
 */

Events.prototype.sub = function(event, method, cb){
  this._events[event] = this._events[event] || {};
  this._events[event][method] = cb;
};

/**
 * Bind to `event` with optional `method` name.
 * When `method` is undefined it becomes `event`
 * with the "on" prefix.
 *
 * Examples:
 *
 *  Direct event handling:
 *
 *    events.bind('click') // implies "onclick"
 *    events.bind('click', 'remove')
 *    events.bind('click', 'sort', 'asc')
 *
 *  Delegated event handling:
 *
 *    events.bind('click li > a')
 *    events.bind('click li > a', 'remove')
 *    events.bind('click a.sort-ascending', 'sort', 'asc')
 *    events.bind('click a.sort-descending', 'sort', 'desc')
 *
 * @param {String} event
 * @param {String|function} [method]
 * @return {Function} callback
 * @api public
 */

Events.prototype.bind = function(event, method){
  var e = parse(event);
  var el = this.el;
  var obj = this.obj;
  var name = e.name;
  var method = method || 'on' + name;
  var args = [].slice.call(arguments, 2);

  // callback
  function cb(){
    var a = [].slice.call(arguments).concat(args);
    obj[method].apply(obj, a);
  }

  // bind
  if (e.selector) {
    cb = delegate.bind(el, e.selector, name, cb);
  } else {
    events.bind(el, name, cb);
  }

  // subscription for unbinding
  this.sub(name, method, cb);

  return cb;
};

/**
 * Unbind a single binding, all bindings for `event`,
 * or all bindings within the manager.
 *
 * Examples:
 *
 *  Unbind direct handlers:
 *
 *     events.unbind('click', 'remove')
 *     events.unbind('click')
 *     events.unbind()
 *
 * Unbind delegate handlers:
 *
 *     events.unbind('click', 'remove')
 *     events.unbind('click')
 *     events.unbind()
 *
 * @param {String|Function} [event]
 * @param {String|Function} [method]
 * @api public
 */

Events.prototype.unbind = function(event, method){
  if (0 == arguments.length) return this.unbindAll();
  if (1 == arguments.length) return this.unbindAllOf(event);

  // no bindings for this event
  var bindings = this._events[event];
  if (!bindings) return;

  // no bindings for this method
  var cb = bindings[method];
  if (!cb) return;

  events.unbind(this.el, event, cb);
};

/**
 * Unbind all events.
 *
 * @api private
 */

Events.prototype.unbindAll = function(){
  for (var event in this._events) {
    this.unbindAllOf(event);
  }
};

/**
 * Unbind all events for `event`.
 *
 * @param {String} event
 * @api private
 */

Events.prototype.unbindAllOf = function(event){
  var bindings = this._events[event];
  if (!bindings) return;

  for (var method in bindings) {
    this.unbind(event, method);
  }
};

/**
 * Parse `event`.
 *
 * @param {String} event
 * @return {Object}
 * @api private
 */

function parse(event) {
  var parts = event.split(/ +/);
  return {
    name: parts.shift(),
    selector: parts.join(' ')
  }
}

});
require.register("component-trim/index.js", function(exports, require, module){

exports = module.exports = trim;

function trim(str){
  if (str.trim) return str.trim();
  return str.replace(/^\s*|\s*$/g, '');
}

exports.left = function(str){
  if (str.trimLeft) return str.trimLeft();
  return str.replace(/^\s*/, '');
};

exports.right = function(str){
  if (str.trimRight) return str.trimRight();
  return str.replace(/\s*$/, '');
};

});
require.register("component-domify/index.js", function(exports, require, module){

/**
 * Expose `parse`.
 */

module.exports = parse;

/**
 * Wrap map from jquery.
 */

var map = {
  option: [1, '<select multiple="multiple">', '</select>'],
  optgroup: [1, '<select multiple="multiple">', '</select>'],
  legend: [1, '<fieldset>', '</fieldset>'],
  thead: [1, '<table>', '</table>'],
  tbody: [1, '<table>', '</table>'],
  tfoot: [1, '<table>', '</table>'],
  colgroup: [1, '<table>', '</table>'],
  caption: [1, '<table>', '</table>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
  th: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  _default: [0, '', '']
};

/**
 * Parse `html` and return the children.
 *
 * @param {String} html
 * @return {Array}
 * @api private
 */

function parse(html) {
  if ('string' != typeof html) throw new TypeError('String expected');

  // tag name
  var m = /<([\w:]+)/.exec(html);
  if (!m) throw new Error('No elements were generated.');
  var tag = m[1];

  // body support
  if (tag == 'body') {
    var el = document.createElement('html');
    el.innerHTML = html;
    return el.removeChild(el.lastChild);
  }

  // wrap map
  var wrap = map[tag] || map._default;
  var depth = wrap[0];
  var prefix = wrap[1];
  var suffix = wrap[2];
  var el = document.createElement('div');
  el.innerHTML = prefix + html + suffix;
  while (depth--) el = el.lastChild;

  var els = el.children;
  if (1 == els.length) {
    return el.removeChild(els[0]);
  }

  var fragment = document.createDocumentFragment();
  while (els.length) {
    fragment.appendChild(el.removeChild(els[0]));
  }

  return fragment;
}

});
require.register("component-classes/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Whitespace regexp.
 */

var re = /\s+/;

/**
 * toString reference.
 */

var toString = Object.prototype.toString;

/**
 * Wrap `el` in a `ClassList`.
 *
 * @param {Element} el
 * @return {ClassList}
 * @api public
 */

module.exports = function(el){
  return new ClassList(el);
};

/**
 * Initialize a new ClassList for `el`.
 *
 * @param {Element} el
 * @api private
 */

function ClassList(el) {
  this.el = el;
  this.list = el.classList;
}

/**
 * Add class `name` if not already present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.add = function(name){
  // classList
  if (this.list) {
    this.list.add(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (!~i) arr.push(name);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove class `name` when present, or
 * pass a regular expression to remove
 * any which match.
 *
 * @param {String|RegExp} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.remove = function(name){
  if ('[object RegExp]' == toString.call(name)) {
    return this.removeMatching(name);
  }

  // classList
  if (this.list) {
    this.list.remove(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (~i) arr.splice(i, 1);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove all classes matching `re`.
 *
 * @param {RegExp} re
 * @return {ClassList}
 * @api private
 */

ClassList.prototype.removeMatching = function(re){
  var arr = this.array();
  for (var i = 0; i < arr.length; i++) {
    if (re.test(arr[i])) {
      this.remove(arr[i]);
    }
  }
  return this;
};

/**
 * Toggle class `name`.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.toggle = function(name){
  // classList
  if (this.list) {
    this.list.toggle(name);
    return this;
  }

  // fallback
  if (this.has(name)) {
    this.remove(name);
  } else {
    this.add(name);
  }
  return this;
};

/**
 * Return an array of classes.
 *
 * @return {Array}
 * @api public
 */

ClassList.prototype.array = function(){
  var str = this.el.className.replace(/^\s+|\s+$/g, '');
  var arr = str.split(re);
  if ('' === arr[0]) arr.shift();
  return arr;
};

/**
 * Check if class `name` is present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.has =
ClassList.prototype.contains = function(name){
  return this.list
    ? this.list.contains(name)
    : !! ~index(this.array(), name);
};

});
require.register("visionmedia-debug/index.js", function(exports, require, module){
if ('undefined' == typeof window) {
  module.exports = require('./lib/debug');
} else {
  module.exports = require('./debug');
}

});
require.register("visionmedia-debug/debug.js", function(exports, require, module){

/**
 * Expose `debug()` as the module.
 */

module.exports = debug;

/**
 * Create a debugger with the given `name`.
 *
 * @param {String} name
 * @return {Type}
 * @api public
 */

function debug(name) {
  if (!debug.enabled(name)) return function(){};

  return function(fmt){
    fmt = coerce(fmt);

    var curr = new Date;
    var ms = curr - (debug[name] || curr);
    debug[name] = curr;

    fmt = name
      + ' '
      + fmt
      + ' +' + debug.humanize(ms);

    // This hackery is required for IE8
    // where `console.log` doesn't have 'apply'
    window.console
      && console.log
      && Function.prototype.apply.call(console.log, console, arguments);
  }
}

/**
 * The currently active debug mode names.
 */

debug.names = [];
debug.skips = [];

/**
 * Enables a debug mode by name. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} name
 * @api public
 */

debug.enable = function(name) {
  try {
    localStorage.debug = name;
  } catch(e){}

  var split = (name || '').split(/[\s,]+/)
    , len = split.length;

  for (var i = 0; i < len; i++) {
    name = split[i].replace('*', '.*?');
    if (name[0] === '-') {
      debug.skips.push(new RegExp('^' + name.substr(1) + '$'));
    }
    else {
      debug.names.push(new RegExp('^' + name + '$'));
    }
  }
};

/**
 * Disable debug output.
 *
 * @api public
 */

debug.disable = function(){
  debug.enable('');
};

/**
 * Humanize the given `ms`.
 *
 * @param {Number} m
 * @return {String}
 * @api private
 */

debug.humanize = function(ms) {
  var sec = 1000
    , min = 60 * 1000
    , hour = 60 * min;

  if (ms >= hour) return (ms / hour).toFixed(1) + 'h';
  if (ms >= min) return (ms / min).toFixed(1) + 'm';
  if (ms >= sec) return (ms / sec | 0) + 's';
  return ms + 'ms';
};

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

debug.enabled = function(name) {
  for (var i = 0, len = debug.skips.length; i < len; i++) {
    if (debug.skips[i].test(name)) {
      return false;
    }
  }
  for (var i = 0, len = debug.names.length; i < len; i++) {
    if (debug.names[i].test(name)) {
      return true;
    }
  }
  return false;
};

/**
 * Coerce `val`.
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

// persist

try {
  if (window.localStorage) debug.enable(localStorage.debug);
} catch(e){}

});
require.register("ianstormtaylor-to-no-case/index.js", function(exports, require, module){

/**
 * Expose `toNoCase`.
 */

module.exports = toNoCase;


/**
 * Test whether a string is camel-case.
 */

var hasSpace = /\s/;
var hasCamel = /[a-z][A-Z]/;
var hasSeparator = /[\W_]/;


/**
 * Remove any starting case from a `string`, like camel or snake, but keep
 * spaces and punctuation that may be important otherwise.
 *
 * @param {String} string
 * @return {String}
 */

function toNoCase (string) {
  if (hasSpace.test(string)) return string.toLowerCase();

  if (hasSeparator.test(string)) string = unseparate(string);
  if (hasCamel.test(string)) string = uncamelize(string);
  return string.toLowerCase();
}


/**
 * Separator splitter.
 */

var separatorSplitter = /[\W_]+(.|$)/g;


/**
 * Un-separate a `string`.
 *
 * @param {String} string
 * @return {String}
 */

function unseparate (string) {
  return string.replace(separatorSplitter, function (m, next) {
    return next ? ' ' + next : '';
  });
}


/**
 * Camelcase splitter.
 */

var camelSplitter = /(.)([A-Z]+)/g;


/**
 * Un-camelcase a `string`.
 *
 * @param {String} string
 * @return {String}
 */

function uncamelize (string) {
  return string.replace(camelSplitter, function (m, previous, uppers) {
    return previous + ' ' + uppers.toLowerCase().split('').join(' ');
  });
}
});
require.register("ianstormtaylor-to-space-case/index.js", function(exports, require, module){

var clean = require('to-no-case');


/**
 * Expose `toSpaceCase`.
 */

module.exports = toSpaceCase;


/**
 * Convert a `string` to space case.
 *
 * @param {String} string
 * @return {String}
 */


function toSpaceCase (string) {
  return clean(string).replace(/[\W_]+(.|$)/g, function (matches, match) {
    return match ? ' ' + match : '';
  });
}
});
require.register("ianstormtaylor-to-camel-case/index.js", function(exports, require, module){

var toSpace = require('to-space-case');


/**
 * Expose `toCamelCase`.
 */

module.exports = toCamelCase;


/**
 * Convert a `string` to camel case.
 *
 * @param {String} string
 * @return {String}
 */


function toCamelCase (string) {
  return toSpace(string).replace(/\s(\w)/g, function (matches, letter) {
    return letter.toUpperCase();
  });
}
});
require.register("component-within-document/index.js", function(exports, require, module){

/**
 * Check if `el` is within the document.
 *
 * @param {Element} el
 * @return {Boolean}
 * @api private
 */

module.exports = function(el) {
  var node = el;
  while (node = node.parentNode) {
    if (node == document) return true;
  }
  return false;
};
});
require.register("component-css/index.js", function(exports, require, module){
/**
 * Module Dependencies
 */

var debug = require('debug')('css');
var set = require('./lib/style');
var get = require('./lib/css');

/**
 * Expose `css`
 */

module.exports = css;

/**
 * Get and set css values
 *
 * @param {Element} el
 * @param {String|Object} prop
 * @param {Mixed} val
 * @return {Element} el
 * @api public
 */

function css(el, prop, val) {
  if (!el) return;

  if (undefined !== val) {
    var obj = {};
    obj[prop] = val;
    debug('setting styles %j', obj);
    return setStyles(el, obj);
  }

  if ('object' == typeof prop) {
    debug('setting styles %j', prop);
    return setStyles(el, prop);
  }

  debug('getting %s', prop);
  return get(el, prop);
}

/**
 * Set the styles on an element
 *
 * @param {Element} el
 * @param {Object} props
 * @return {Element} el
 */

function setStyles(el, props) {
  for (var prop in props) {
    set(el, prop, props[prop]);
  }

  return el;
}

});
require.register("component-css/lib/css.js", function(exports, require, module){
/**
 * Module Dependencies
 */

var debug = require('debug')('css:css');
var camelcase = require('to-camel-case');
var computed = require('./computed');
var property = require('./prop');

/**
 * Expose `css`
 */

module.exports = css;

/**
 * CSS Normal Transforms
 */

var cssNormalTransform = {
  letterSpacing: 0,
  fontWeight: 400
};

/**
 * Get a CSS value
 *
 * @param {Element} el
 * @param {String} prop
 * @param {Mixed} extra
 * @param {Array} styles
 * @return {String}
 */

function css(el, prop, extra, styles) {
  var hooks = require('./hooks');
  var orig = camelcase(prop);
  var style = el.style;
  var val;

  prop = property(prop, style);
  var hook = hooks[prop] || hooks[orig];

  // If a hook was provided get the computed value from there
  if (hook && hook.get) {
    debug('get hook provided. use that');
    val = hook.get(el, true, extra);
  }

  // Otherwise, if a way to get the computed value exists, use that
  if (undefined == val) {
    debug('fetch the computed value of %s', prop);
    val = computed(el, prop);
  }

  if ('normal' == val && cssNormalTransform[prop]) {
    val = cssNormalTransform[prop];
    debug('normal => %s', val);
  }

  // Return, converting to number if forced or a qualifier was provided and val looks numeric
  if ('' == extra || extra) {
    debug('converting value: %s into a number');
    var num = parseFloat(val);
    return true === extra || isNumeric(num) ? num || 0 : val;
  }

  return val;
}

/**
 * Is Numeric
 *
 * @param {Mixed} obj
 * @return {Boolean}
 */

function isNumeric(obj) {
  return !isNan(parseFloat(obj)) && isFinite(obj);
}

});
require.register("component-css/lib/prop.js", function(exports, require, module){
/**
 * Module dependencies
 */

var debug = require('debug')('css:prop');
var camelcase = require('to-camel-case');
var vendor = require('./vendor');

/**
 * Export `prop`
 */

module.exports = prop;

/**
 * Normalize Properties
 */

var cssProps = {
  'float': 'cssFloat'
};

/**
 * Get the vendor prefixed property
 *
 * @param {String} prop
 * @param {String} style
 * @return {String} prop
 * @api private
 */

function prop(prop, style) {
  prop = cssProps[prop] || (cssProps[prop] = vendor(prop, style));
  debug('transform property: %s => %s');
  return prop;
}

});
require.register("component-css/lib/swap.js", function(exports, require, module){
/**
 * Export `swap`
 */

module.exports = swap;

/**
 * Initialize `swap`
 *
 * @param {Element} el
 * @param {Object} options
 * @param {Function} fn
 * @param {Array} args
 * @return {Mixed}
 */

function swap(el, options, fn, args) {
  // Remember the old values, and insert the new ones
  for (var key in options) {
    old[key] = el.style[key];
    el.style[key] = options[key];
  }

  ret = fn.apply(el, args || []);

  // Revert the old values
  for (key in options) {
    el.style[key] = old[key];
  }

  return ret;
}

});
require.register("component-css/lib/style.js", function(exports, require, module){
/**
 * Module Dependencies
 */

var debug = require('debug')('css:style');
var camelcase = require('to-camel-case');
var support = require('./support');
var property = require('./prop');
var hooks = require('./hooks');

/**
 * Expose `style`
 */

module.exports = style;

/**
 * Possibly-unitless properties
 *
 * Don't automatically add 'px' to these properties
 */

var cssNumber = {
  "columnCount": true,
  "fillOpacity": true,
  "fontWeight": true,
  "lineHeight": true,
  "opacity": true,
  "order": true,
  "orphans": true,
  "widows": true,
  "zIndex": true,
  "zoom": true
};

/**
 * Set a css value
 *
 * @param {Element} el
 * @param {String} prop
 * @param {Mixed} val
 * @param {Mixed} extra
 */

function style(el, prop, val, extra) {
  // Don't set styles on text and comment nodes
  if (!el || el.nodeType === 3 || el.nodeType === 8 || !el.style ) return;

  var orig = camelcase(prop);
  var style = el.style;
  var type = typeof val;

  if (!val) return get(el, prop, orig, extra);

  prop = property(prop, style);

  var hook = hooks[prop] || hooks[orig];

  // If a number was passed in, add 'px' to the (except for certain CSS properties)
  if ('number' == type && !cssNumber[orig]) {
    debug('adding "px" to end of number');
    val += 'px';
  }

  // Fixes jQuery #8908, it can be done more correctly by specifying setters in cssHooks,
  // but it would mean to define eight (for every problematic property) identical functions
  if (!support.clearCloneStyle && '' === val && 0 === prop.indexOf('background')) {
    debug('set property (%s) value to "inherit"', prop);
    style[prop] = 'inherit';
  }

  // If a hook was provided, use that value, otherwise just set the specified value
  if (!hook || !hook.set || undefined !== (val = hook.set(el, val, extra))) {
    // Support: Chrome, Safari
    // Setting style to blank string required to delete "style: x !important;"
    debug('set hook defined. setting property (%s) to %s', prop, val);
    style[prop] = '';
    style[prop] = val;
  }

}

/**
 * Get the style
 *
 * @param {Element} el
 * @param {String} prop
 * @param {String} orig
 * @param {Mixed} extra
 * @return {String}
 */

function get(el, prop, orig, extra) {
  var style = el.style;
  var hook = hooks[prop] || hooks[orig];
  var ret;

  if (hook && hook.get && undefined !== (ret = hook.get(el, false, extra))) {
    debug('get hook defined, returning: %s', ret);
    return ret;
  }

  ret = style[prop];
  debug('getting %s', ret);
  return ret;
}

});
require.register("component-css/lib/hooks.js", function(exports, require, module){
/**
 * Module Dependencies
 */

var css = require('./css');
var cssShow = { position: 'absolute', visibility: 'hidden', display: 'block' };
var pnum = (/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/).source;
var rnumnonpx = new RegExp( '^(' + pnum + ')(?!px)[a-z%]+$', 'i');
var rnumsplit = new RegExp( '^(' + pnum + ')(.*)$', 'i');
var rdisplayswap = /^(none|table(?!-c[ea]).+)/;
var styles = require('./styles');
var support = require('./support');
var swap = require('./swap');
var computed = require('./computed');
var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

/**
 * Height & Width
 */

['width', 'height'].forEach(function(name) {
  exports[name] = {};

  exports[name].get = function(el, compute, extra) {
    if (!compute) return;
    // certain elements can have dimension info if we invisibly show them
    // however, it must have a current display style that would benefit from this
    return 0 == el.offsetWidth && rdisplayswap.test(css(el, 'display'))
      ? swap(el, cssShow, function() { return getWidthOrHeight(el, name, extra); })
      : getWidthOrHeight(el, name, extra);
  }

  exports[name].set = function(el, val, extra) {
    var styles = extra && styles(el);
    return setPositiveNumber(el, val, extra
      ? augmentWidthOrHeight(el, name, extra, 'border-box' == css(el, 'boxSizing', false, styles), styles)
      : 0
    );
  };

});

/**
 * Opacity
 */

exports.opacity = {};
exports.opacity.get = function(el, compute) {
  if (!compute) return;
  var ret = computed(el, 'opacity');
  return '' == ret ? '1' : ret;
}

/**
 * Utility: Set Positive Number
 *
 * @param {Element} el
 * @param {Mixed} val
 * @param {Number} subtract
 * @return {Number}
 */

function setPositiveNumber(el, val, subtract) {
  var matches = rnumsplit.exec(val);
  return matches ?
    // Guard against undefined 'subtract', e.g., when used as in cssHooks
    Math.max(0, matches[1]) + (matches[2] || 'px') :
    val;
}

/**
 * Utility: Get the width or height
 *
 * @param {Element} el
 * @param {String} prop
 * @param {Mixed} extra
 * @return {String}
 */

function getWidthOrHeight(el, prop, extra) {
  // Start with offset property, which is equivalent to the border-box value
  var valueIsBorderBox = true;
  var val = prop === 'width' ? el.offsetWidth : el.offsetHeight;
  var styles = computed(el);
  var isBorderBox = support.boxSizing && css(el, 'boxSizing') === 'border-box';

  // some non-html elements return undefined for offsetWidth, so check for null/undefined
  // svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
  // MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
  if (val <= 0 || val == null) {
    // Fall back to computed then uncomputed css if necessary
    val = computed(el, prop, styles);

    if (val < 0 || val == null) {
      val = el.style[prop];
    }

    // Computed unit is not pixels. Stop here and return.
    if (rnumnonpx.test(val)) {
      return val;
    }

    // we need the check for style in case a browser which returns unreliable values
    // for getComputedStyle silently falls back to the reliable el.style
    valueIsBorderBox = isBorderBox && (support.boxSizingReliable() || val === el.style[prop]);

    // Normalize ', auto, and prepare for extra
    val = parseFloat(val) || 0;
  }

  // use the active box-sizing model to add/subtract irrelevant styles
  extra = extra || (isBorderBox ? 'border' : 'content');
  val += augmentWidthOrHeight(el, prop, extra, valueIsBorderBox, styles);
  return val + 'px';
}

/**
 * Utility: Augment the width or the height
 *
 * @param {Element} el
 * @param {String} prop
 * @param {Mixed} extra
 * @param {Boolean} isBorderBox
 * @param {Array} styles
 */

function augmentWidthOrHeight(el, prop, extra, isBorderBox, styles) {
  // If we already have the right measurement, avoid augmentation,
  // Otherwise initialize for horizontal or vertical properties
  var i = extra === (isBorderBox ? 'border' : 'content') ? 4 : 'width' == prop ? 1 : 0;
  var val = 0;

  for (; i < 4; i += 2) {
    // both box models exclude margin, so add it if we want it
    if (extra === 'margin') {
      val += css(el, extra + cssExpand[i], true, styles);
    }

    if (isBorderBox) {
      // border-box includes padding, so remove it if we want content
      if (extra === 'content') {
        val -= css(el, 'padding' + cssExpand[i], true, styles);
      }

      // at this point, extra isn't border nor margin, so remove border
      if (extra !== 'margin') {
        val -= css(el, 'border' + cssExpand[i] + 'Width', true, styles);
      }
    } else {
      // at this point, extra isn't content, so add padding
      val += css(el, 'padding' + cssExpand[i], true, styles);

      // at this point, extra isn't content nor padding, so add border
      if (extra !== 'padding') {
        val += css(el, 'border' + cssExpand[i] + 'Width', true, styles);
      }
    }
  }

  return val;
}

});
require.register("component-css/lib/styles.js", function(exports, require, module){
/**
 * Expose `styles`
 */

module.exports = styles;

/**
 * Get all the styles
 *
 * @param {Element} el
 * @return {Array}
 */

function styles(el) {
  return el.ownerDocument.defaultView.getComputedStyle(el, null);
}

});
require.register("component-css/lib/vendor.js", function(exports, require, module){
/**
 * Module Dependencies
 */

var prefixes = ['Webkit', 'O', 'Moz', 'ms'];

/**
 * Expose `vendor`
 */

module.exports = vendor;

/**
 * Get the vendor prefix for a given property
 *
 * @param {String} prop
 * @param {Object} style
 * @return {String}
 */

function vendor(prop, style) {
  // shortcut for names that are not vendor prefixed
  if (style[prop]) return prop;

  // check for vendor prefixed names
  var capName = prop[0].toUpperCase() + prop.slice(1);
  var original = prop;
  var i = prefixes.length;

  while (i--) {
    prop = prefixes[i] + capName;
    if (prop in style) return prop;
  }

  return original;
}

});
require.register("component-css/lib/support.js", function(exports, require, module){
/**
 * Support values
 */

var reliableMarginRight;
var boxSizingReliableVal;
var pixelPositionVal;
var clearCloneStyle;

/**
 * Container setup
 */

var docElem = document.documentElement;
var container = document.createElement('div');
var div = document.createElement('div');

/**
 * Clear clone style
 */

div.style.backgroundClip = 'content-box';
div.cloneNode(true).style.backgroundClip = '';
exports.clearCloneStyle = div.style.backgroundClip === 'content-box';

container.style.cssText = 'border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px';
container.appendChild(div);

/**
 * Pixel position
 *
 * Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
 * getComputedStyle returns percent when specified for top/left/bottom/right
 * rather than make the css module depend on the offset module, we just check for it here
 */

exports.pixelPosition = function() {
  if (undefined == pixelPositionVal) computePixelPositionAndBoxSizingReliable();
  return pixelPositionVal;
}

/**
 * Reliable box sizing
 */

exports.boxSizingReliable = function() {
  if (undefined == boxSizingReliableVal) computePixelPositionAndBoxSizingReliable();
  return boxSizingReliableVal;
}

/**
 * Reliable margin right
 *
 * Support: Android 2.3
 * Check if div with explicit width and no margin-right incorrectly
 * gets computed margin-right based on width of container. (#3333)
 * WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
 * This support function is only executed once so no memoizing is needed.
 *
 * @return {Boolean}
 */

exports.reliableMarginRight = function() {
  var ret;
  var marginDiv = div.appendChild(document.createElement("div" ));

  marginDiv.style.cssText = div.style.cssText = divReset;
  marginDiv.style.marginRight = marginDiv.style.width = "0";
  div.style.width = "1px";
  docElem.appendChild(container);

  ret = !parseFloat(window.getComputedStyle(marginDiv, null).marginRight);

  docElem.removeChild(container);

  // Clean up the div for other support tests.
  div.innerHTML = "";

  return ret;
}

/**
 * Executing both pixelPosition & boxSizingReliable tests require only one layout
 * so they're executed at the same time to save the second computation.
 */

function computePixelPositionAndBoxSizingReliable() {
  // Support: Firefox, Android 2.3 (Prefixed box-sizing versions).
  div.style.cssText = "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;" +
    "box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;" +
    "position:absolute;top:1%";
  docElem.appendChild(container);

  var divStyle = window.getComputedStyle(div, null);
  pixelPositionVal = divStyle.top !== "1%";
  boxSizingReliableVal = divStyle.width === "4px";

  docElem.removeChild(container);
}



});
require.register("component-css/lib/computed.js", function(exports, require, module){
/**
 * Module Dependencies
 */

var debug = require('debug')('css:computed');
var withinDocument = require('within-document');
var styles = require('./styles');

/**
 * Expose `computed`
 */

module.exports = computed;

/**
 * Get the computed style
 *
 * @param {Element} el
 * @param {String} prop
 * @param {Array} precomputed (optional)
 * @return {Array}
 * @api private
 */

function computed(el, prop, precomputed) {
  computed = precomputed || styles(el);
  if (!computed) return;

  var ret = computed.getPropertyValue(prop) || computed[prop];

  if ('' === ret && !withinDocument(el)) {
    debug('element not within document, try finding from style attribute');
    var style = require('./style');
    ret = style(el, prop);
  }

  debug('computed value of %s: %s', prop, ret);

  // Support: IE
  // IE returns zIndex value as an integer.
  return undefined === ret ? ret : ret + '';
}

});
require.register("enyo-domready/index.js", function(exports, require, module){
/*!
 * Copyright (c) 2012 Matias Meno <m@tias.me>
 * 
 * Original code (c) by Dustin Diaz 2012 - License MIT
 */


/**
 * Expose `domready`.
 */

module.exports = domready;


/**
 *
 * Cross browser implementation of the domready event
 *
 * @param {Function} ready - the callback to be invoked as soon as the dom is fully loaded.
 * @api public
 */

function domready(ready) {
 var fns = [], fn, f = false
    , doc = document
    , testEl = doc.documentElement
    , hack = testEl.doScroll
    , domContentLoaded = 'DOMContentLoaded'
    , addEventListener = 'addEventListener'
    , onreadystatechange = 'onreadystatechange'
    , readyState = 'readyState'
    , loaded = /^loade|c/.test(doc[readyState])

  function flush(f) {
    loaded = 1
    while (f = fns.shift()) f()
  }

  doc[addEventListener] && doc[addEventListener](domContentLoaded, fn = function () {
    doc.removeEventListener(domContentLoaded, fn, f)
    flush()
  }, f)


  hack && doc.attachEvent(onreadystatechange, fn = function () {
    if (/^c/.test(doc[readyState])) {
      doc.detachEvent(onreadystatechange, fn)
      flush()
    }
  })

  return (ready = hack ?
    function (fn) {
      self != top ?
        loaded ? fn() : fns.push(fn) :
        function () {
          try {
            testEl.doScroll('left')
          } catch (e) {
            return setTimeout(function() { ready(fn) }, 50)
          }
          fn()
        }()
    } :
    function (fn) {
      loaded ? fn() : fns.push(fn)
    })
}
});
require.register("component-inherit/index.js", function(exports, require, module){

module.exports = function(a, b){
  var fn = function(){};
  fn.prototype = b.prototype;
  a.prototype = new fn;
  a.prototype.constructor = a;
};
});
require.register("timoxley-assert/index.js", function(exports, require, module){
// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


// Adapted for browser components by Tim Oxley
// from https://github.com/joyent/node/blob/72bc4dcda4cfa99ed064419e40d104bd1b2e0e25/lib/assert.js

// UTILITY
var inherit = require('inherit');
var pSlice = Array.prototype.slice;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.message = options.message;
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
};

// assert.AssertionError instanceof Error
inherit(assert.AssertionError, Error);

function replacer(key, value) {
  if (value === undefined) {
    return '' + value;
  }
  if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (typeof value === 'function' || value instanceof RegExp) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (typeof s == 'string') {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

assert.AssertionError.prototype.toString = function() {
  if (this.message) {
    return [this.name + ':', this.message].join(' ');
  } else {
    return [
      this.name + ':',
      truncate(JSON.stringify(this.actual, replacer), 128),
      this.operator,
      truncate(JSON.stringify(this.expected, replacer), 128)
    ].join(' ');
  }
};

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!!!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (actual instanceof Date && expected instanceof Date) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (actual instanceof RegExp && expected instanceof RegExp) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (typeof actual != 'object' && typeof expected != 'object') {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = Object.keys(a),
        kb = Object.keys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (expected instanceof RegExp) {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (typeof expected === 'string') {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

});
require.register("timoxley-dom-support/index.js", function(exports, require, module){
var domready = require('domready')()

module.exports = (function() {

	var support,
		all,
		a,
		select,
		opt,
		input,
		fragment,
		eventName,
		i,
		isSupported,
		clickFn,
		div = document.createElement("div");

	// Setup
	div.setAttribute( "className", "t" );
	div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";

	// Support tests won't run in some limited or non-browser environments
	all = div.getElementsByTagName("*");
	a = div.getElementsByTagName("a")[ 0 ];
	if ( !all || !a || !all.length ) {
		return {};
	}

	// First batch of tests
	select = document.createElement("select");
	opt = select.appendChild( document.createElement("option") );
	input = div.getElementsByTagName("input")[ 0 ];

	a.style.cssText = "top:1px;float:left;opacity:.5";
	support = {
		// IE strips leading whitespace when .innerHTML is used
		leadingWhitespace: ( div.firstChild.nodeType === 3 ),

		// Make sure that tbody elements aren't automatically inserted
		// IE will insert them into empty tables
		tbody: !div.getElementsByTagName("tbody").length,

		// Make sure that link elements get serialized correctly by innerHTML
		// This requires a wrapper element in IE
		htmlSerialize: !!div.getElementsByTagName("link").length,

		// Get the style information from getAttribute
		// (IE uses .cssText instead)
		style: /top/.test( a.getAttribute("style") ),

		// Make sure that URLs aren't manipulated
		// (IE normalizes it by default)
		hrefNormalized: ( a.getAttribute("href") === "/a" ),

		// Make sure that element opacity exists
		// (IE uses filter instead)
		// Use a regex to work around a WebKit issue. See #5145
		opacity: /^0.5/.test( a.style.opacity ),

		// Verify style float existence
		// (IE uses styleFloat instead of cssFloat)
		cssFloat: !!a.style.cssFloat,

		// Make sure that if no value is specified for a checkbox
		// that it defaults to "on".
		// (WebKit defaults to "" instead)
		checkOn: ( input.value === "on" ),

		// Make sure that a selected-by-default option has a working selected property.
		// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
		optSelected: opt.selected,

		// Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
		getSetAttribute: div.className !== "t",

		// Tests for enctype support on a form (#6743)
		enctype: !!document.createElement("form").enctype,

		// Makes sure cloning an html5 element does not cause problems
		// Where outerHTML is undefined, this still works
		html5Clone: document.createElement("nav").cloneNode( true ).outerHTML !== "<:nav></:nav>",

		// jQuery.support.boxModel DEPRECATED in 1.8 since we don't support Quirks Mode
		boxModel: ( document.compatMode === "CSS1Compat" ),

		// Will be defined later
		submitBubbles: true,
		changeBubbles: true,
		focusinBubbles: false,
		deleteExpando: true,
		noCloneEvent: true,
		inlineBlockNeedsLayout: false,
		shrinkWrapBlocks: false,
		reliableMarginRight: true,
		boxSizingReliable: true,
		pixelPosition: false
	};

	// Make sure checked status is properly cloned
	input.checked = true;
	support.noCloneChecked = input.cloneNode( true ).checked;

	// Make sure that the options inside disabled selects aren't marked as disabled
	// (WebKit marks them as disabled)
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Test to see if it's possible to delete an expando from an element
	// Fails in Internet Explorer
	try {
		delete div.test;
	} catch( e ) {
		support.deleteExpando = false;
	}

	if ( !div.addEventListener && div.attachEvent && div.fireEvent ) {
		div.attachEvent( "onclick", clickFn = function() {
			// Cloning a node shouldn't copy over any
			// bound event handlers (IE does this)
			support.noCloneEvent = false;
		});
		div.cloneNode( true ).fireEvent("onclick");
		div.detachEvent( "onclick", clickFn );
	}

	// Check if a radio maintains its value
	// after being appended to the DOM
	input = document.createElement("input");
	input.value = "t";
	input.setAttribute( "type", "radio" );
	support.radioValue = input.value === "t";

	input.setAttribute( "checked", "checked" );

	// #11217 - WebKit loses check when the name is after the checked attribute
	input.setAttribute( "name", "t" );

	div.appendChild( input );
	fragment = document.createDocumentFragment();
	fragment.appendChild( div.lastChild );

	// WebKit doesn't clone checked state correctly in fragments
	support.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Check if a disconnected checkbox will retain its checked
	// value of true after appended to the DOM (IE6/7)
	support.appendChecked = input.checked;

	fragment.removeChild( input );
	fragment.appendChild( div );

	// Technique from Juriy Zaytsev
	// http://perfectionkills.com/detecting-event-support-without-browser-sniffing/
	// We only care about the case where non-standard event systems
	// are used, namely in IE. Short-circuiting here helps us to
	// avoid an eval call (in setAttribute) which can cause CSP
	// to go haywire. See: https://developer.mozilla.org/en/Security/CSP
	if ( !div.addEventListener ) {
		for ( i in {
			submit: true,
			change: true,
			focusin: true
		}) {
			eventName = "on" + i;
			isSupported = ( eventName in div );
			if ( !isSupported ) {
				div.setAttribute( eventName, "return;" );
				isSupported = ( typeof div[ eventName ] === "function" );
			}
			support[ i + "Bubbles" ] = isSupported;
		}
	}

	// Run tests that need a body at doc ready
	domready(function() {
		var container, div, tds, marginDiv,
			divReset = "padding:0;margin:0;border:0;display:block;overflow:hidden;box-sizing:content-box;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;",
			body = document.getElementsByTagName("body")[0];

		if ( !body ) {
			// Return for frameset docs that don't have a body
			return;
		}

		container = document.createElement("div");
		container.style.cssText = "visibility:hidden;border:0;width:0;height:0;position:static;top:0;margin-top:1px";
		body.insertBefore( container, body.firstChild );

		// Construct the test element
		div = document.createElement("div");
		container.appendChild( div );

    //Check if table cells still have offsetWidth/Height when they are set
    //to display:none and there are still other visible table cells in a
    //table row; if so, offsetWidth/Height are not reliable for use when
    //determining if an element has been hidden directly using
    //display:none (it is still safe to use offsets if a parent element is
    //hidden; don safety goggles and see bug #4512 for more information).
    //(only IE 8 fails this test)
		div.innerHTML = "<table><tr><td></td><td>t</td></tr></table>";
		tds = div.getElementsByTagName("td");
		tds[ 0 ].style.cssText = "padding:0;margin:0;border:0;display:none";
		isSupported = ( tds[ 0 ].offsetHeight === 0 );

		tds[ 0 ].style.display = "";
		tds[ 1 ].style.display = "none";

		// Check if empty table cells still have offsetWidth/Height
		// (IE <= 8 fail this test)
		support.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );

		// Check box-sizing and margin behavior
		div.innerHTML = "";
		div.style.cssText = "box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;";
		support.boxSizing = ( div.offsetWidth === 4 );
		support.doesNotIncludeMarginInBodyOffset = ( body.offsetTop !== 1 );

		// NOTE: To any future maintainer, we've window.getComputedStyle
		// because jsdom on node.js will break without it.
		if ( window.getComputedStyle ) {
			support.pixelPosition = ( window.getComputedStyle( div, null ) || {} ).top !== "1%";
			support.boxSizingReliable = ( window.getComputedStyle( div, null ) || { width: "4px" } ).width === "4px";

			// Check if div with explicit width and no margin-right incorrectly
			// gets computed margin-right based on width of container. For more
			// info see bug #3333
			// Fails in WebKit before Feb 2011 nightlies
			// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
			marginDiv = document.createElement("div");
			marginDiv.style.cssText = div.style.cssText = divReset;
			marginDiv.style.marginRight = marginDiv.style.width = "0";
			div.style.width = "1px";
			div.appendChild( marginDiv );
			support.reliableMarginRight =
				!parseFloat( ( window.getComputedStyle( marginDiv, null ) || {} ).marginRight );
		}

		if ( typeof div.style.zoom !== "undefined" ) {
			// Check if natively block-level elements act like inline-block
			// elements when setting their display to 'inline' and giving
			// them layout
			// (IE < 8 does this)
			div.innerHTML = "";
			div.style.cssText = divReset + "width:1px;padding:1px;display:inline;zoom:1";
			support.inlineBlockNeedsLayout = ( div.offsetWidth === 3 );

			// Check if elements with layout shrink-wrap their children
			// (IE 6 does this)
			div.style.display = "block";
			div.style.overflow = "visible";
			div.innerHTML = "<div></div>";
			div.firstChild.style.width = "5px";
			support.shrinkWrapBlocks = ( div.offsetWidth !== 3 );

			container.style.zoom = 1;
		}

		// Null elements to avoid leaks in IE
		body.removeChild( container );
		container = div = tds = marginDiv = null;
	});

	// Null elements to avoid leaks in IE
	fragment.removeChild( div );
	all = a = select = opt = input = fragment = div = null;

	return support;
})();


});
require.register("timoxley-offset/index.js", function(exports, require, module){
var support = require('dom-support')
var contains = require('within-document')

module.exports = function offset(el) {
	var box = { top: 0, left: 0 }
  var doc = el && el.ownerDocument

	if (!doc) {
    console.warn('no document!')
		return
	}

	// Make sure it's not a disconnected DOM node
	if (!contains(el)) {
		return box
	}

  var body = doc.body
	if (body === el) {
		return bodyOffset(el)
	}

	var docEl = doc.documentElement

	// If we don't have gBCR, just use 0,0 rather than error
	// BlackBerry 5, iOS 3 (original iPhone)
	if ( typeof el.getBoundingClientRect !== "undefined" ) {
		box = el.getBoundingClientRect()
	}

	var clientTop  = docEl.clientTop  || body.clientTop  || 0
	var clientLeft = docEl.clientLeft || body.clientLeft || 0
	var scrollTop  = window.pageYOffset || docEl.scrollTop
	var scrollLeft = window.pageXOffset || docEl.scrollLeft

	return {
		top: box.top  + scrollTop  - clientTop,
		left: box.left + scrollLeft - clientLeft
	}
}

function bodyOffset(body) {
	var top = body.offsetTop
	var left = body.offsetLeft

	if (support.doesNotIncludeMarginInBodyOffset) {
		top  += parseFloat(body.style.marginTop || 0)
		left += parseFloat(body.style.marginLeft || 0)
	}

	return {
    top: top,
    left: left
  }
}

});
require.register("component-tip/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var events = require('events');
var query = require('query');
var domify = require('domify');
var classes = require('classes');
var css = require('css');
var html = domify(require('./template'));
var offset = require('offset');

/**
 * Expose `Tip`.
 */

module.exports = Tip;

/**
 * Apply the average use-case of simply
 * showing a tool-tip on `el` hover.
 *
 * Options:
 *
 *  - `delay` hide delay in milliseconds [0]
 *  - `value` defaulting to the element's title attribute
 *
 * @param {Mixed} elem
 * @param {Object|String} options or value
 * @api public
 */

function tip(elem, options) {
  if ('string' == typeof options) options = { value : options };
  var els = ('string' == typeof elem) ? query.all(elem) : [elem];
  for(var i = 0, el; el = els[i]; i++) {
    var val = options.value || el.getAttribute('title');
    var tip = new Tip(val);
    el.setAttribute('title', '');
    tip.cancelHideOnHover();
    tip.attach(el);
  }
}

/**
 * Initialize a `Tip` with the given `content`.
 *
 * @param {Mixed} content
 * @api public
 */

function Tip(content, options) {
  options = options || {};
  if (!(this instanceof Tip)) return tip(content, options);
  Emitter.call(this);
  this.classname = '';
  this.delay = options.delay || 300;
  this.el = html.cloneNode(true);
  this.events = events(this.el, this);
  this.winEvents = events(window, this);
  this.classes = classes(this.el);
  this.inner = query('.tip-inner', this.el);
  this.message(content);
  this.position('south');
  if (Tip.effect) this.effect(Tip.effect);
}

/**
 * Mixin emitter.
 */

Emitter(Tip.prototype);

/**
 * Set tip `content`.
 *
 * @param {String|jQuery|Element} content
 * @return {Tip} self
 * @api public
 */

Tip.prototype.message = function(content){
  this.inner.innerHTML = content;
  return this;
};

/**
 * Attach to the given `el` with optional hide `delay`.
 *
 * @param {Element} el
 * @param {Number} delay
 * @return {Tip}
 * @api public
 */

Tip.prototype.attach = function(el){
  var self = this;
  this.target = el;
  this.handleEvents = events(el, this);
  this.handleEvents.bind('mouseover');
  this.handleEvents.bind('mouseout');
  return this;
};

/**
 * On mouse over
 *
 * @param {Event} e
 * @return {Tip}
 * @api private
 */

Tip.prototype.onmouseover = function() {
  this.show(this.target);
  this.cancelHide();
};

/**
 * On mouse out
 *
 * @param {Event} e
 * @return {Tip}
 * @api private
 */

Tip.prototype.onmouseout = function() {
  this.hide(this.delay);
};

/**
 * Cancel hide on hover, hide with the given `delay`.
 *
 * @param {Number} delay
 * @return {Tip}
 * @api public
 */

Tip.prototype.cancelHideOnHover = function(){
  this.events.bind('mouseover', 'cancelHide');
  this.events.bind('mouseout', 'hide');
  return this;
};

/**
 * Set the effect to `type`.
 *
 * @param {String} type
 * @return {Tip}
 * @api public
 */

Tip.prototype.effect = function(type){
  this._effect = type;
  this.classes.add(type);
  return this;
};

/**
 * Set position:
 *
 *  - `north`
 *  - `north east`
 *  - `north west`
 *  - `south`
 *  - `south east`
 *  - `south west`
 *  - `east`
 *  - `west`
 *
 * @param {String} pos
 * @param {Object} options
 * @return {Tip}
 * @api public
 */

Tip.prototype.position = function(pos, options){
  options = options || {};
  this._position = pos;
  this._auto = false != options.auto;
  this.replaceClass(pos);
  return this;
};

/**
 * Show the tip attached to `el`.
 *
 * Emits "show" (el) event.
 *
 * @param {String|Element|Number} el or x
 * @param {Number} [y]
 * @return {Tip}
 * @api public
 */

Tip.prototype.show = function(el){
  if ('string' == typeof el) el = query(el);

  // show it
  this.target = el;
  document.body.appendChild(this.el);
  this.classes.add('tip-' + this._position.replace(/\s+/g, '-'));
  this.classes.remove('tip-hide');

  // x,y
  if ('number' == typeof el) {
    var x = arguments[0];
    var y = arguments[1];
    this.emit('show');
    css(this.el, {
      top: y,
      left: x
    });
    return this;
  }

  // el
  this.reposition();
  this.emit('show', this.target);

  this.winEvents.bind('resize', 'reposition');
  this.winEvents.bind('scroll', 'reposition');

  return this;
};

/**
 * Reposition the tip if necessary.
 *
 * @api private
 */

Tip.prototype.reposition = function(){
  var pos = this._position;
  var off = this.offset(pos);
  var newpos = this._auto && this.suggested(pos, off);
  if (newpos) off = this.offset(pos = newpos);
  this.replaceClass(pos);
  this.emit('reposition');
  css(this.el, off);
};

/**
 * Compute the "suggested" position favouring `pos`.
 * Returns undefined if no suggestion is made.
 *
 * @param {String} pos
 * @param {Object} offset
 * @return {String}
 * @api private
 */

Tip.prototype.suggested = function(pos, off){
  var el = this.el;

  var ew = el.clientWidth;
  var eh = el.clientHeight;
  var top = window.scrollY;
  var left = window.scrollX;
  var w = window.innerWidth;
  var h = window.innerHeight;

  // too high
  if (off.top < top) return 'north';

  // too low
  if (off.top + eh > top + h) return 'south';

  // too far to the right
  if (off.left + ew > left + w) return 'east';

  // too far to the left
  if (off.left < left) return 'west';
};

/**
 * Replace position class `name`.
 *
 * @param {String} name
 * @api private
 */

Tip.prototype.replaceClass = function(name){
  name = name.split(' ').join('-');
  var classname = this.classname + ' tip tip-' + name;
  if (this._effect) classname += ' ' + this._effect;
  this.el.setAttribute('class', classname);
};

/**
 * Compute the offset for `.target`
 * based on the given `pos`.
 *
 * @param {String} pos
 * @return {Object}
 * @api private
 */

Tip.prototype.offset = function(pos){
  var pad = 15;
  var el = this.el;
  var target = this.target;

  var ew = el.clientWidth;
  var eh = el.clientHeight;

  var to = offset(target);
  var tw = target.clientWidth;
  var th = target.clientHeight;

  switch (pos) {
    case 'south':
      return {
        top: to.top - eh,
        left: to.left + tw / 2 - ew / 2
      }
    case 'north west':
      return {
        top: to.top + th,
        left: to.left + tw / 2 - pad
      }
    case 'north east':
      return {
        top: to.top + th,
        left: to.left + tw / 2 - ew + pad
      }
    case 'north':
      return {
        top: to.top + th,
        left: to.left + tw / 2 - ew / 2
      }
    case 'south west':
      return {
        top: to.top - eh,
        left: to.left + tw / 2 - pad
      }
    case 'south east':
      return {
        top: to.top - eh,
        left: to.left + tw / 2 - ew + pad
      }
    case 'west':
      return {
        top: to.top + th / 2 - eh / 2,
        left: to.left + tw
      }
    case 'east':
      return {
        top: to.top + th / 2 - eh / 2,
        left: to.left - ew
      }
    default:
      throw new Error('invalid position "' + pos + '"');
  }
};

/**
 * Cancel the `.hide()` timeout.
 *
 * @api private
 */

Tip.prototype.cancelHide = function(){
  clearTimeout(this._hide);
};

/**
 * Hide the tip with optional `ms` delay.
 *
 * Emits "hide" event.
 *
 * @param {Number} ms
 * @return {Tip}
 * @api public
 */

Tip.prototype.hide = function(ms){
  var self = this;

  // duration
  if (ms) {
    this._hide = setTimeout(this.hide.bind(this), ms);
    return this;
  }

  // hide
  this.classes.add('tip-hide');
  if (this._effect) {
    setTimeout(this.remove.bind(this), 300);
  } else {
    self.remove();
  }

  return this;
};

/**
 * Hide the tip without potential animation.
 *
 * @return {Tip}
 * @api
 */

Tip.prototype.remove = function(){
  this.winEvents.unbind('resize', 'reposition');
  this.winEvents.unbind('scroll', 'reposition');
  this.emit('hide');

  var parent = this.el.parentNode;
  if (parent) parent.removeChild(this.el);
  return this;
};

});
require.register("component-tip/template.js", function(exports, require, module){
module.exports = '<div class="tip tip-hide">\n  <div class="tip-arrow"></div>\n  <div class="tip-inner"></div>\n</div>';
});
require.register("yields-slug/index.js", function(exports, require, module){

/**
 * Generate a slug from the given `str`.
 *
 * example:
 *
 *        generate('foo bar');
 *        // > foo-bar
 *
 * options:
 *
 *    - `.replace` characters to replace, defaulted to `/[^a-z0-9]/g`
 *    - `.separator` separator to insert, defaulted to `-`
 *
 * @param {String} str
 * @param {Object} opts
 * @return {String}
 */

module.exports = function(str, opts){
  opts = opts || {};
  return str.toLowerCase()
    .replace(opts.replace || /[^a-z0-9]/g, ' ')
    .replace(/^ +| +$/g, '')
    .replace(/ +/g, opts.separator || '-')
};

});
require.register("bmcmahen-modifier/index.js", function(exports, require, module){
module.exports = function(e){
 return e.shiftKey
  || e.altKey
  || e.ctrlKey
  || e.metaKey;
};
});
require.register("component-raf/index.js", function(exports, require, module){
/**
 * Expose `requestAnimationFrame()`.
 */

exports = module.exports = window.requestAnimationFrame
  || window.webkitRequestAnimationFrame
  || window.mozRequestAnimationFrame
  || window.oRequestAnimationFrame
  || window.msRequestAnimationFrame
  || fallback;

/**
 * Fallback implementation.
 */

var prev = new Date().getTime();
function fallback(fn) {
  var curr = new Date().getTime();
  var ms = Math.max(0, 16 - (curr - prev));
  var req = setTimeout(fn, ms);
  prev = curr;
  return req;
}

/**
 * Cancel.
 */

var cancel = window.cancelAnimationFrame
  || window.webkitCancelAnimationFrame
  || window.mozCancelAnimationFrame
  || window.oCancelAnimationFrame
  || window.msCancelAnimationFrame
  || window.clearTimeout;

exports.cancel = function(id){
  cancel.call(window, id);
};

});
require.register("yields-on-select/index.js", function(exports, require, module){

/**
 * Dependencies
 */

var selected = require('get-selected-text');
var mod = require('modifier');
var event = require('event');
var raf = require('raf');

/**
 * Selection
 */

var selection = window.getSelection();

/**
 * Invoke `fn(e)` when a user selects within `el`.
 *
 * @param {Element} el
 * @param {Function} fn
 * @return {Function}
 * @api public
 */

module.exports = function(el, fn){
  event.bind(el, 'mouseup', callback);
  event.bind(el, 'keyup', callback);

  function callback(e){
    if (mod(e)) return;
    var id = raf(function(){
      var str = selected();
      if (str) fn(e, str);
      raf.cancel(id);
    });
  }

  return function(){
    event.unbind(el, 'mouseup', callback);
    event.unbind(el, 'keyup', callback);
  }
};

});
require.register("bmcmahen-text-selection/index.js", function(exports, require, module){
var selection = window.getSelection();

module.exports = function(){
  return selection.toString();
};
});
require.register("bmcmahen-on-deselect/index.js", function(exports, require, module){
var event = require('event');
var raf = require('raf');
var selected = require('text-selection');
var mod = require('modifier');

var selection = window.getSelection();

module.exports = function(el, fn){
  event.bind(el, 'mouseup', callback);
  event.bind(el, 'keyup', callback);
  event.bind(el, 'blur', callback);

  function callback(e){
    if (mod(e)) return;
    var id = raf(function(){
      if (!selected()) fn(e);
      raf.cancel(id);
    });
  }

  return function unbind(){
    event.unbind(el, 'mouseup', callback);
    event.unbind(el, 'keyup', callback);
    event.unbind(el, 'blur', callback);
  }

};
});
require.register("bmcmahen-monitor-text-selection/index.js", function(exports, require, module){
var Emitter = require('emitter');
var selected = require('on-select');
var deselected = require('on-deselect');

module.exports = function(el){
  var emitter = new Emitter();
  var unbindSelect, unbindDeselect, isBound;

  unbindSelect = selected(el, function(e){
    emitter.emit('selected', e, el);
    if (isBound) return;
    isBound = true;
    unbindDeselect = deselected(el, function(e){
      emitter.emit('deselected', e, el);
      unbindDeselect();
      isBound = false;
    });
  });

  emitter.unbind = function(){
    if (unbindSelect) unbindSelect();
    if (unbindDeselect) unbindDeselect();
  }

  return emitter;
};



});
require.register("yields-redact-popover/index.js", function(exports, require, module){

/**
 * Dependencies
 */

var selected = require('get-selected-text');
var monitor = require('monitor-text-selection');
var Emitter = require('emitter');
var events = require('events');
var slug = require('slug');
var trim = require('trim');
var Tip = require('tip');

/**
 * Export `RedactPopover`
 */

module.exports = RedactPopover;

/**
 * Initialize `RedactPopover`
 *
 * @param {Element} el
 * @api public
 */

function RedactPopover(el){
  if (!(this instanceof RedactPopover)) return new RedactPopover(el);
  this.options = {};
  this.tip = new Tip('');
  this.el = this.tip.inner;
  this.classes = this.tip.classes;
  this.classes.add('redact-popover');
  this.events = events(this.el, this);
  this.winEvents = events(window, this);
  this.editor = el;
  this.bind();
}

/**
 * Mixins
 */

Emitter(RedactPopover.prototype);

/**
 * Bind internal events.
 *
 * @return {RedactPopover}
 * @api public
 */

RedactPopover.prototype.bind = function(){
  if (this.bound) return this;
  
  this.monitor = monitor(this.editor);
  this.monitorEvents = events(this.monitor, this);
  this.monitorEvents.bind('selected', 'onselect');
  this.monitorEvents.bind('deselected', 'hide');

  this.winEvents.bind('resize', 'onselect');

  this.events.bind('click');
  this.bound = true;
  return this;
};

/**
 * Unbind internal events.
 *
 * @return {RedactPopover}
 * @api public
 */

RedactPopover.prototype.unbind = function(){
  if (!this.bound) return this;
  this.monitorEvents.unbind();
  this.monitor.unbind();
  this.winEvents.unbind();
  this.events.unbind();
  this.bound = null;
  return this;
};

/**
 * Add option `id`.
 *
 * @param {String} id
 * @param {String} label
 * @return {RedactPopover}
 * @api public
 */

RedactPopover.prototype.add = function(id, label){
  if (this.get(id)) return this;
  var el = document.createElement('a');
  el.href = 'javascript:;';
  el.className = 'redact-button ' + slug(id);
  el.textContent = label || '';
  el.setAttribute('data-id', id);
  this.el.appendChild(el);
  this.options[id] = el;
  this.emit('add', el);
  this.refresh();
  return this;
};

/**
 * Remove option `id`.
 *
 * @param {String} id
 * @return {RedactPopover}
 * @api public
 */

RedactPopover.prototype.remove = function(id){
  var el = this.get(id);
  if (!el) return this;
  this.el.removeChild(el);
  this.emit('remove', el);
  this.refresh();
  return this;
};

/**
 * Get option `id` or the popover element.
 *
 * @param {String} id
 * @return {Element}
 * @api public
 */

RedactPopover.prototype.get = function(id){
  return null != id
    ? this.options[id]
    : this.el;
};

/**
 * Refresh the tip size.
 *
 * @return {RedactPopover}
 * @api public
 */

RedactPopover.prototype.refresh = function(){
  this.tip.show(-500, -500);
  this.size = this.tip.el.getBoundingClientRect();
  this.hide();
  return this;
};

/**
 * Hide
 *
 * TODO: component/tip / component/events bug?
 *
 * @api private
 */

RedactPopover.prototype.hide = function(){
  try {
    this.tip.hide();
  } catch (e) {}
};

/**
 * Get the bounding client range of cursor
 *
 * @return {Object}
 * @api private
 */

RedactPopover.prototype.boundary = function(){
  return window
    .getSelection()
    .getRangeAt(0)
    .getBoundingClientRect();
};



/**
 * on-click.
 *
 * @param {Event} e
 * @api private
 */

RedactPopover.prototype.onclick = function(e){
  e.preventDefault();
  var el = e.delegateTarget || e.target;
  var id = el.getAttribute('data-id');
  this.emit('click', id, el);
  this.emit('click ' + id, el);
  this.onselect(e);
};

/**
 * on-select
 *
 * TODO: component/tip classes bug.
 *
 * @param {Event} e
 * @api private
 */

RedactPopover.prototype.onselect = function(e){
  if ('' == trim(selected())) return;
  var pos = this.position();
  this.tip.position(pos.at);
  this.classes.add('redact-popover');
  this.tip.show(pos.x, pos.y);
};

/**
 * Calculate position.
 *
 * @return {Object}
 * @api private
 */

RedactPopover.prototype.position = function(){
  var a = this.boundary();
  var b = this.size;
  var x = a.left + (a.width / 2) - (b.width / 2);
  var y = a.top + -b.height;
  var sx = window.scrollX;
  var sy = window.scrollY;
  var at = 'south';

  // north
  if (a.top < b.height) {
    y = a.top + (b.height / 2);
    at = 'north';
  }

  return {
    x: x + sx,
    y: y + sy,
    at: at
  };
};

});
require.register("component-global/index.js", function(exports, require, module){

/**
 * Returns `this`. Execute this without a "context" (i.e. without it being
 * attached to an object of the left-hand side), and `this` points to the
 * "global" scope of the current JS execution.
 */

module.exports = (function () { return this; })();

});
require.register("component-has-cors/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var global = require('global');

/**
 * Module exports.
 *
 * Logic borrowed from Modernizr:
 *
 *   - https://github.com/Modernizr/Modernizr/blob/master/feature-detects/cors.js
 */

module.exports = 'XMLHttpRequest' in global &&
  'withCredentials' in new global.XMLHttpRequest();

});
require.register("component-ws/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var global = require('global');

/**
 * WebSocket constructor.
 */

var WebSocket = global.WebSocket || global.MozWebSocket;

/**
 * Module exports.
 */

module.exports = WebSocket ? ws : null;

/**
 * WebSocket constructor.
 *
 * The third `opts` options object gets ignored in web browsers, since it's
 * non-standard, and throws a TypeError if passed to the constructor.
 * See: https://github.com/einaros/ws/issues/227
 *
 * @param {String} uri
 * @param {Array} protocols (optional)
 * @param {Object) opts (optional)
 * @api public
 */

function ws(uri, protocols, opts) {
  var instance;
  if (protocols) {
    instance = new WebSocket(uri, protocols);
  } else {
    instance = new WebSocket(uri);
  }
  return instance;
}

if (WebSocket) ws.prototype = WebSocket.prototype;

});
require.register("LearnBoost-engine.io-protocol/lib/index.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var keys = require('./keys');

/**
 * Current protocol version.
 */
exports.protocol = 2;

/**
 * Packet types.
 */

var packets = exports.packets = {
    open:     0    // non-ws
  , close:    1    // non-ws
  , ping:     2
  , pong:     3
  , message:  4
  , upgrade:  5
  , noop:     6
};

var packetslist = keys(packets);

/**
 * Premade error packet.
 */

var err = { type: 'error', data: 'parser error' };

/**
 * Encodes a packet.
 *
 *     <packet type id> [ `:` <data> ]
 *
 * Example:
 *
 *     5:hello world
 *     3
 *     4
 *
 * @api private
 */

exports.encodePacket = function (packet) {
  var encoded = packets[packet.type];

  // data fragment is optional
  if (undefined !== packet.data) {
    encoded += String(packet.data);
  }

  return '' + encoded;
};

/**
 * Decodes a packet.
 *
 * @return {Object} with `type` and `data` (if any)
 * @api private
 */

exports.decodePacket = function (data) {
  var type = data.charAt(0);

  if (Number(type) != type || !packetslist[type]) {
    return err;
  }

  if (data.length > 1) {
    return { type: packetslist[type], data: data.substring(1) };
  } else {
    return { type: packetslist[type] };
  }
};

/**
 * Encodes multiple messages (payload).
 *
 *     <length>:data
 *
 * Example:
 *
 *     11:hello world2:hi
 *
 * @param {Array} packets
 * @api private
 */

exports.encodePayload = function (packets) {
  if (!packets.length) {
    return '0:';
  }

  var encoded = '';
  var message;

  for (var i = 0, l = packets.length; i < l; i++) {
    message = exports.encodePacket(packets[i]);
    encoded += message.length + ':' + message;
  }

  return encoded;
};

/*
 * Decodes data when a payload is maybe expected.
 *
 * @param {String} data, callback method
 * @api public
 */

exports.decodePayload = function (data, callback) {
  var packet;
  if (data == '') {
    // parser error - ignoring payload
    return callback(err, 0, 1);
  }

  var length = ''
    , n, msg;

  for (var i = 0, l = data.length; i < l; i++) {
    var chr = data.charAt(i);

    if (':' != chr) {
      length += chr;
    } else {
      if ('' == length || (length != (n = Number(length)))) {
        // parser error - ignoring payload
        return callback(err, 0, 1);
      }

      msg = data.substr(i + 1, n);

      if (length != msg.length) {
        // parser error - ignoring payload
        return callback(err, 0, 1);
      }

      if (msg.length) {
        packet = exports.decodePacket(msg);

        if (err.type == packet.type && err.data == packet.data) {
          // parser error in individual packet - ignoring payload
          return callback(err, 0, 1);
        }

        var ret = callback(packet, i + n, l);
        if (false === ret) return;
      }

      // advance cursor
      i += n;
      length = '';
    }
  }

  if (length != '') {
    // parser error - ignoring payload
    return callback(err, 0, 1);
  }

};

});
require.register("LearnBoost-engine.io-protocol/lib/keys.js", function(exports, require, module){

/**
 * Gets the keys for an object.
 *
 * @return {Array} keys
 * @api private
 */

module.exports = Object.keys || function keys (obj){
  var arr = [];
  var has = Object.prototype.hasOwnProperty;

  for (var i in obj) {
    if (has.call(obj, i)) {
      arr.push(i);
    }
  }
  return arr;
};

});
require.register("learnboost-engine.io-client/lib/index.js", function(exports, require, module){

module.exports = require('./socket');

/**
 * Exports parser
 *
 * @api public
 *
 */
module.exports.parser = require('engine.io-parser');

});
require.register("learnboost-engine.io-client/lib/socket.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var util = require('./util')
  , transports = require('./transports')
  , Emitter = require('./emitter')
  , debug = require('debug')('engine.io-client:socket')
  , index = require('indexof')
  , parser = require('engine.io-parser');

/**
 * Module exports.
 */

module.exports = Socket;

/**
 * Global reference.
 */

var global = require('global');

/**
 * Noop function.
 *
 * @api private
 */

function noop () {};

/**
 * Socket constructor.
 *
 * @param {String|Object} uri or options
 * @param {Object} options
 * @api public
 */

function Socket(uri, opts){
  if (!(this instanceof Socket)) return new Socket(uri, opts);

  opts = opts || {};

  if ('object' == typeof uri) {
    opts = uri;
    uri = null;
  }

  if (uri) {
    uri = util.parseUri(uri);
    opts.host = uri.host;
    opts.secure = uri.protocol == 'https' || uri.protocol == 'wss';
    opts.port = uri.port;
    if (uri.query) opts.query = uri.query;
  }

  this.secure = null != opts.secure ? opts.secure :
    (global.location && 'https:' == location.protocol);

  if (opts.host) {
    var pieces = opts.host.split(':');
    opts.hostname = pieces.shift();
    if (pieces.length) opts.port = pieces.pop();
  }

  this.agent = opts.agent || false;
  this.hostname = opts.hostname ||
    (global.location ? location.hostname : 'localhost');
  this.port = opts.port || (global.location && location.port ?
       location.port :
       (this.secure ? 443 : 80));
  this.query = opts.query || {};
  if ('string' == typeof this.query) this.query = util.qsParse(this.query);
  this.upgrade = false !== opts.upgrade;
  this.path = (opts.path || '/engine.io').replace(/\/$/, '') + '/';
  this.forceJSONP = !!opts.forceJSONP;
  this.timestampParam = opts.timestampParam || 't';
  this.timestampRequests = !!opts.timestampRequests;
  this.flashPath = opts.flashPath || '';
  this.transports = opts.transports || ['polling', 'websocket', 'flashsocket'];
  this.readyState = '';
  this.writeBuffer = [];
  this.callbackBuffer = [];
  this.policyPort = opts.policyPort || 843;
  this.open();

  Socket.sockets.push(this);
  Socket.sockets.evs.emit('add', this);
};

/**
 * Mix in `Emitter`.
 */

Emitter(Socket.prototype);

/**
 * Protocol version.
 *
 * @api public
 */

Socket.protocol = parser.protocol; // this is an int

/**
 * Static EventEmitter.
 */

Socket.sockets = [];
Socket.sockets.evs = new Emitter;

/**
 * Expose deps for legacy compatibility
 * and standalone browser access.
 */

Socket.Socket = Socket;
Socket.Transport = require('./transport');
Socket.Emitter = require('./emitter');
Socket.transports = require('./transports');
Socket.util = require('./util');
Socket.parser = require('engine.io-parser');

/**
 * Creates transport of the given type.
 *
 * @param {String} transport name
 * @return {Transport}
 * @api private
 */

Socket.prototype.createTransport = function (name) {
  debug('creating transport "%s"', name);
  var query = clone(this.query);

  // append engine.io protocol identifier
  query.EIO = parser.protocol;

  // transport name
  query.transport = name;

  // session id if we already have one
  if (this.id) query.sid = this.id;

  var transport = new transports[name]({
    agent: this.agent,
    hostname: this.hostname,
    port: this.port,
    secure: this.secure,
    path: this.path,
    query: query,
    forceJSONP: this.forceJSONP,
    timestampRequests: this.timestampRequests,
    timestampParam: this.timestampParam,
    flashPath: this.flashPath,
    policyPort: this.policyPort
  });

  return transport;
};

function clone (obj) {
  var o = {};
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      o[i] = obj[i];
    }
  }
  return o;
}

/**
 * Initializes transport to use and starts probe.
 *
 * @api private
 */

Socket.prototype.open = function () {
  this.readyState = 'opening';
  var transport = this.createTransport(this.transports[0]);
  transport.open();
  this.setTransport(transport);
};

/**
 * Sets the current transport. Disables the existing one (if any).
 *
 * @api private
 */

Socket.prototype.setTransport = function (transport) {
  var self = this;

  if (this.transport) {
    debug('clearing existing transport');
    this.transport.removeAllListeners();
  }

  // set up transport
  this.transport = transport;

  // set up transport listeners
  transport
    .on('drain', function () {
      self.onDrain();
    })
    .on('packet', function (packet) {
      self.onPacket(packet);
    })
    .on('error', function (e) {
      self.onError(e);
    })
    .on('close', function () {
      self.onClose('transport close');
    });
};

/**
 * Probes a transport.
 *
 * @param {String} transport name
 * @api private
 */

Socket.prototype.probe = function (name) {
  debug('probing transport "%s"', name);
  var transport = this.createTransport(name, { probe: 1 })
    , failed = false
    , self = this;

  transport.once('open', function () {
    if (failed) return;

    debug('probe transport "%s" opened', name);
    transport.send([{ type: 'ping', data: 'probe' }]);
    transport.once('packet', function (msg) {
      if (failed) return;
      if ('pong' == msg.type && 'probe' == msg.data) {
        debug('probe transport "%s" pong', name);
        self.upgrading = true;
        self.emit('upgrading', transport);

        debug('pausing current transport "%s"', self.transport.name);
        self.transport.pause(function () {
          if (failed) return;
          if ('closed' == self.readyState || 'closing' == self.readyState) {
            return;
          }
          debug('changing transport and sending upgrade packet');
          transport.removeListener('error', onerror);
          self.emit('upgrade', transport);
          self.setTransport(transport);
          transport.send([{ type: 'upgrade' }]);
          transport = null;
          self.upgrading = false;
          self.flush();
        });
      } else {
        debug('probe transport "%s" failed', name);
        var err = new Error('probe error');
        err.transport = transport.name;
        self.emit('error', err);
      }
    });
  });

  transport.once('error', onerror);
  function onerror(err) {
    if (failed) return;

    // Any callback called by transport should be ignored since now
    failed = true;

    var error = new Error('probe error: ' + err);
    error.transport = transport.name;

    transport.close();
    transport = null;

    debug('probe transport "%s" failed because of error: %s', name, err);

    self.emit('error', error);
  };

  transport.open();

  this.once('close', function () {
    if (transport) {
      debug('socket closed prematurely - aborting probe');
      failed = true;
      transport.close();
      transport = null;
    }
  });

  this.once('upgrading', function (to) {
    if (transport && to.name != transport.name) {
      debug('"%s" works - aborting "%s"', to.name, transport.name);
      transport.close();
      transport = null;
    }
  });
};

/**
 * Called when connection is deemed open.
 *
 * @api public
 */

Socket.prototype.onOpen = function () {
  debug('socket open');
  this.readyState = 'open';
  this.emit('open');
  this.onopen && this.onopen.call(this);
  this.flush();

  // we check for `readyState` in case an `open`
  // listener alreay closed the socket
  if ('open' == this.readyState && this.upgrade && this.transport.pause) {
    debug('starting upgrade probes');
    for (var i = 0, l = this.upgrades.length; i < l; i++) {
      this.probe(this.upgrades[i]);
    }
  }
};

/**
 * Handles a packet.
 *
 * @api private
 */

Socket.prototype.onPacket = function (packet) {
  if ('opening' == this.readyState || 'open' == this.readyState) {
    debug('socket receive: type "%s", data "%s"', packet.type, packet.data);

    this.emit('packet', packet);

    // Socket is live - any packet counts
    this.emit('heartbeat');

    switch (packet.type) {
      case 'open':
        this.onHandshake(util.parseJSON(packet.data));
        break;

      case 'pong':
        this.setPing();
        break;

      case 'error':
        var err = new Error('server error');
        err.code = packet.data;
        this.emit('error', err);
        break;

      case 'message':
        this.emit('data', packet.data);
        this.emit('message', packet.data);
        var event = { data: packet.data };
        event.toString = function () {
          return packet.data;
        };
        this.onmessage && this.onmessage.call(this, event);
        break;
    }
  } else {
    debug('packet received with socket readyState "%s"', this.readyState);
  }
};

/**
 * Called upon handshake completion.
 *
 * @param {Object} handshake obj
 * @api private
 */

Socket.prototype.onHandshake = function (data) {
  this.emit('handshake', data);
  this.id = data.sid;
  this.transport.query.sid = data.sid;
  this.upgrades = this.filterUpgrades(data.upgrades);
  this.pingInterval = data.pingInterval;
  this.pingTimeout = data.pingTimeout;
  this.onOpen();
  this.setPing();

  // Prolong liveness of socket on heartbeat
  this.removeListener('heartbeat', this.onHeartbeat);
  this.on('heartbeat', this.onHeartbeat);
};

/**
 * Resets ping timeout.
 *
 * @api private
 */

Socket.prototype.onHeartbeat = function (timeout) {
  clearTimeout(this.pingTimeoutTimer);
  var self = this;
  self.pingTimeoutTimer = setTimeout(function () {
    if ('closed' == self.readyState) return;
    self.onClose('ping timeout');
  }, timeout || (self.pingInterval + self.pingTimeout));
};

/**
 * Pings server every `this.pingInterval` and expects response
 * within `this.pingTimeout` or closes connection.
 *
 * @api private
 */

Socket.prototype.setPing = function () {
  var self = this;
  clearTimeout(self.pingIntervalTimer);
  self.pingIntervalTimer = setTimeout(function () {
    debug('writing ping packet - expecting pong within %sms', self.pingTimeout);
    self.ping();
    self.onHeartbeat(self.pingTimeout);
  }, self.pingInterval);
};

/**
* Sends a ping packet.
*
* @api public
*/

Socket.prototype.ping = function () {
  this.sendPacket('ping');
};

/**
 * Called on `drain` event
 *
 * @api private
 */

 Socket.prototype.onDrain = function() {
  for (var i = 0; i < this.prevBufferLen; i++) {
    if (this.callbackBuffer[i]) {
      this.callbackBuffer[i]();
    }
  }

  this.writeBuffer.splice(0, this.prevBufferLen);
  this.callbackBuffer.splice(0, this.prevBufferLen);

  // setting prevBufferLen = 0 is very important
  // for example, when upgrading, upgrade packet is sent over,
  // and a nonzero prevBufferLen could cause problems on `drain`
  this.prevBufferLen = 0;

  if (this.writeBuffer.length == 0) {
    this.emit('drain');
  } else {
    this.flush();
  }
};

/**
 * Flush write buffers.
 *
 * @api private
 */

Socket.prototype.flush = function () {
  if ('closed' != this.readyState && this.transport.writable &&
    !this.upgrading && this.writeBuffer.length) {
    debug('flushing %d packets in socket', this.writeBuffer.length);
    this.transport.send(this.writeBuffer);
    // keep track of current length of writeBuffer
    // splice writeBuffer and callbackBuffer on `drain`
    this.prevBufferLen = this.writeBuffer.length;
    this.emit('flush');
  }
};

/**
 * Sends a message.
 *
 * @param {String} message.
 * @param {Function} callback function.
 * @return {Socket} for chaining.
 * @api public
 */

Socket.prototype.write =
Socket.prototype.send = function (msg, fn) {
  this.sendPacket('message', msg, fn);
  return this;
};

/**
 * Sends a packet.
 *
 * @param {String} packet type.
 * @param {String} data.
 * @param {Function} callback function.
 * @api private
 */

Socket.prototype.sendPacket = function (type, data, fn) {
  var packet = { type: type, data: data };
  this.emit('packetCreate', packet);
  this.writeBuffer.push(packet);
  this.callbackBuffer.push(fn);
  this.flush();
};

/**
 * Closes the connection.
 *
 * @api private
 */

Socket.prototype.close = function () {
  if ('opening' == this.readyState || 'open' == this.readyState) {
    this.onClose('forced close');
    debug('socket closing - telling transport to close');
    this.transport.close();
  }

  return this;
};

/**
 * Called upon transport error
 *
 * @api private
 */

Socket.prototype.onError = function (err) {
  debug('socket error %j', err);
  this.emit('error', err);
  this.onerror && this.onerror.call(this, err);
  this.onClose('transport error', err);
};

/**
 * Called upon transport close.
 *
 * @api private
 */

Socket.prototype.onClose = function (reason, desc) {
  if ('opening' == this.readyState || 'open' == this.readyState) {
    debug('socket close with reason: "%s"', reason);
    var self = this;

    // clear timers
    clearTimeout(this.pingIntervalTimer);
    clearTimeout(this.pingTimeoutTimer);

    // clean buffers in next tick, so developers can still
    // grab the buffers on `close` event
    setTimeout(function() {
      self.writeBuffer = [];
      self.callbackBuffer = [];
      self.prevBufferLen = 0;
    }, 0);

    // ignore further transport communication
    this.transport.removeAllListeners();

    // set ready state
    var prev = this.readyState;
    this.readyState = 'closed';

    // clear session id
    this.id = null;

    // emit events
    if (prev == 'open') {
      this.emit('close', reason, desc);
      this.onclose && this.onclose.call(this);
    }
  }
};

/**
 * Filters upgrades, returning only those matching client transports.
 *
 * @param {Array} server upgrades
 * @api private
 *
 */

Socket.prototype.filterUpgrades = function (upgrades) {
  var filteredUpgrades = [];
  for (var i = 0, j = upgrades.length; i<j; i++) {
    if (~index(this.transports, upgrades[i])) filteredUpgrades.push(upgrades[i]);
  }
  return filteredUpgrades;
};

});
require.register("learnboost-engine.io-client/lib/transport.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var util = require('./util')
  , parser = require('engine.io-parser')
  , Emitter = require('./emitter');

/**
 * Module exports.
 */

module.exports = Transport;

/**
 * Transport abstract constructor.
 *
 * @param {Object} options.
 * @api private
 */

function Transport (opts) {
  this.path = opts.path;
  this.hostname = opts.hostname;
  this.port = opts.port;
  this.secure = opts.secure;
  this.query = opts.query;
  this.timestampParam = opts.timestampParam;
  this.timestampRequests = opts.timestampRequests;
  this.readyState = '';
  this.agent = opts.agent || false;
};

/**
 * Mix in `Emitter`.
 */

Emitter(Transport.prototype);

/**
 * Emits an error.
 *
 * @param {String} str
 * @return {Transport} for chaining
 * @api public
 */

Transport.prototype.onError = function (msg, desc) {
  var err = new Error(msg);
  err.type = 'TransportError';
  err.description = desc;
  this.emit('error', err);
  return this;
};

/**
 * Opens the transport.
 *
 * @api public
 */

Transport.prototype.open = function () {
  if ('closed' == this.readyState || '' == this.readyState) {
    this.readyState = 'opening';
    this.doOpen();
  }

  return this;
};

/**
 * Closes the transport.
 *
 * @api private
 */

Transport.prototype.close = function () {
  if ('opening' == this.readyState || 'open' == this.readyState) {
    this.doClose();
    this.onClose();
  }

  return this;
};

/**
 * Sends multiple packets.
 *
 * @param {Array} packets
 * @api private
 */

Transport.prototype.send = function(packets){
  if ('open' == this.readyState) {
    this.write(packets);
  } else {
    throw new Error('Transport not open');
  }
};

/**
 * Called upon open
 *
 * @api private
 */

Transport.prototype.onOpen = function () {
  this.readyState = 'open';
  this.writable = true;
  this.emit('open');
};

/**
 * Called with data.
 *
 * @param {String} data
 * @api private
 */

Transport.prototype.onData = function (data) {
  this.onPacket(parser.decodePacket(data));
};

/**
 * Called with a decoded packet.
 */

Transport.prototype.onPacket = function (packet) {
  this.emit('packet', packet);
};

/**
 * Called upon close.
 *
 * @api private
 */

Transport.prototype.onClose = function () {
  this.readyState = 'closed';
  this.emit('close');
};

});
require.register("learnboost-engine.io-client/lib/emitter.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var Emitter = require('emitter');

/**
 * Module exports.
 */

module.exports = Emitter;

/**
 * Compatibility with `WebSocket#addEventListener`.
 *
 * @api public
 */

Emitter.prototype.addEventListener = Emitter.prototype.on;

/**
 * Compatibility with `WebSocket#removeEventListener`.
 *
 * @api public
 */

Emitter.prototype.removeEventListener = Emitter.prototype.off;

/**
 * Node-compatible `EventEmitter#removeListener`
 *
 * @api public
 */

Emitter.prototype.removeListener = Emitter.prototype.off;

});
require.register("learnboost-engine.io-client/lib/util.js", function(exports, require, module){

var global = require('global');

/**
 * Status of page load.
 */

var pageLoaded = false;

/**
 * Inheritance.
 *
 * @param {Function} ctor a
 * @param {Function} ctor b
 * @api private
 */

exports.inherits = function inherits (a, b) {
  function c () { }
  c.prototype = b.prototype;
  a.prototype = new c;
};

/**
 * Object.keys
 */

exports.keys = Object.keys || function (obj) {
  var ret = [];
  var has = Object.prototype.hasOwnProperty;

  for (var i in obj) {
    if (has.call(obj, i)) {
      ret.push(i);
    }
  }

  return ret;
};

/**
 * Adds an event.
 *
 * @api private
 */

exports.on = function (element, event, fn, capture) {
  if (element.attachEvent) {
    element.attachEvent('on' + event, fn);
  } else if (element.addEventListener) {
    element.addEventListener(event, fn, capture);
  }
};

/**
 * Load utility.
 *
 * @api private
 */

exports.load = function (fn) {
  if (global.document && document.readyState === 'complete' || pageLoaded) {
    return fn();
  }

  exports.on(global, 'load', fn, false);
};

/**
 * Change the internal pageLoaded value.
 */

if ('undefined' != typeof window) {
  exports.load(function () {
    pageLoaded = true;
  });
}

/**
 * Defers a function to ensure a spinner is not displayed by the browser.
 *
 * @param {Function} fn
 * @api private
 */

exports.defer = function (fn) {
  if (!exports.ua.webkit || 'undefined' != typeof importScripts) {
    return fn();
  }

  exports.load(function () {
    setTimeout(fn, 100);
  });
};

/**
 * JSON parse.
 *
 * @see Based on jQuery#parseJSON (MIT) and JSON2
 * @api private
 */

var rvalidchars = /^[\],:{}\s]*$/;
var rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
var rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
var rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;
var rtrimLeft = /^\s+/;
var rtrimRight = /\s+$/;

exports.parseJSON = function (data) {
  if ('string' != typeof data || !data) {
    return null;
  }

  data = data.replace(rtrimLeft, '').replace(rtrimRight, '');

  // Attempt to parse using the native JSON parser first
  if (global.JSON && JSON.parse) {
    return JSON.parse(data);
  }

  if (rvalidchars.test(data.replace(rvalidescape, '@')
      .replace(rvalidtokens, ']')
      .replace(rvalidbraces, ''))) {
    return (new Function('return ' + data))();
  }
};

/**
 * UA / engines detection namespace.
 *
 * @namespace
 */

exports.ua = {};

/**
 * Whether the UA supports CORS for XHR.
 *
 * @api private
 */

exports.ua.hasCORS = require('has-cors');

/**
 * Detect webkit.
 *
 * @api private
 */

exports.ua.webkit = 'undefined' != typeof navigator &&
  /webkit/i.test(navigator.userAgent);

/**
 * Detect gecko.
 *
 * @api private
 */

exports.ua.gecko = 'undefined' != typeof navigator &&
  /gecko/i.test(navigator.userAgent);

/**
 * Detect android;
 */

exports.ua.android = 'undefined' != typeof navigator &&
  /android/i.test(navigator.userAgent);

/**
 * Detect iOS.
 */

exports.ua.ios = 'undefined' != typeof navigator &&
  /^(iPad|iPhone|iPod)$/.test(navigator.platform);
exports.ua.ios6 = exports.ua.ios && /OS 6_/.test(navigator.userAgent);

/**
 * Detect Chrome Frame.
 */

exports.ua.chromeframe = Boolean(global.externalHost);

/**
 * XHR request helper.
 *
 * @param {Boolean} whether we need xdomain
 * @param {Object} opts Optional "options" object
 * @api private
 */

exports.request = function request (xdomain, opts) {
  try {
    var _XMLHttpRequest = require('xmlhttprequest');
    return new _XMLHttpRequest(opts);
  } catch (e) {}

  if (xdomain && 'undefined' != typeof XDomainRequest && !exports.ua.hasCORS) {
    return new XDomainRequest();
  }

  // XMLHttpRequest can be disabled on IE
  try {
    if ('undefined' != typeof XMLHttpRequest && (!xdomain || exports.ua.hasCORS)) {
      return new XMLHttpRequest();
    }
  } catch (e) { }

  if (!xdomain) {
    try {
      return new ActiveXObject('Microsoft.XMLHTTP');
    } catch(e) { }
  }
};

/**
 * Parses an URI
 *
 * @author Steven Levithan <stevenlevithan.com> (MIT license)
 * @api private
 */

var re = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

var parts = [
    'source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host'
  , 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'
];

exports.parseUri = function (str) {
  var m = re.exec(str || '')
    , uri = {}
    , i = 14;

  while (i--) {
    uri[parts[i]] = m[i] || '';
  }

  return uri;
};

/**
 * Compiles a querystring
 *
 * @param {Object}
 * @api private
 */

exports.qs = function (obj) {
  var str = '';

  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      if (str.length) str += '&';
      str += encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]);
    }
  }

  return str;
};

/**
 * Parses a simple querystring.
 *
 * @param {String} qs
 * @api private
 */

exports.qsParse = function(qs){
  var qry = {};
  var pairs = qs.split('&');
  for (var i = 0, l = pairs.length; i < l; i++) {
    var pair = pairs[i].split('=');
    qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
  }
  return qry;
};

});
require.register("learnboost-engine.io-client/lib/transports/index.js", function(exports, require, module){

/**
 * Module dependencies
 */

var XHR = require('./polling-xhr')
  , JSONP = require('./polling-jsonp')
  , websocket = require('./websocket')
  , flashsocket = require('./flashsocket')
  , util = require('../util');

/**
 * Export transports.
 */

exports.polling = polling;
exports.websocket = websocket;
exports.flashsocket = flashsocket;

/**
 * Global reference.
 */

var global = require('global');

/**
 * Polling transport polymorphic constructor.
 * Decides on xhr vs jsonp based on feature detection.
 *
 * @api private
 */

function polling (opts) {
  var xhr
    , xd = false
    , isXProtocol = false;

  if (global.location) {
    var isSSL = 'https:' == location.protocol;
    var port = location.port;

    // some user agents have empty `location.port`
    if (!port) {
      port = isSSL ? 443 : 80;
    }

    xd = opts.hostname != location.hostname || port != opts.port;
    isXProtocol = opts.secure != isSSL;
  }

  xhr = util.request(xd, opts);
  /* See #7 at http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx */
  if (isXProtocol && global.XDomainRequest && xhr instanceof global.XDomainRequest) {
    return new JSONP(opts);
  }

  if (xhr && !opts.forceJSONP) {
    return new XHR(opts);
  } else {
    return new JSONP(opts);
  }
};

});
require.register("learnboost-engine.io-client/lib/transports/polling.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var Transport = require('../transport')
  , util = require('../util')
  , parser = require('engine.io-parser')
  , debug = require('debug')('engine.io-client:polling');

/**
 * Module exports.
 */

module.exports = Polling;

/**
 * Global reference.
 */

var global = require('global');

/**
 * Polling interface.
 *
 * @param {Object} opts
 * @api private
 */

function Polling(opts){
  Transport.call(this, opts);
}

/**
 * Inherits from Transport.
 */

util.inherits(Polling, Transport);

/**
 * Transport name.
 */

Polling.prototype.name = 'polling';

/**
 * Opens the socket (triggers polling). We write a PING message to determine
 * when the transport is open.
 *
 * @api private
 */

Polling.prototype.doOpen = function(){
  this.poll();
};

/**
 * Pauses polling.
 *
 * @param {Function} callback upon buffers are flushed and transport is paused
 * @api private
 */

Polling.prototype.pause = function(onPause){
  var pending = 0;
  var self = this;

  this.readyState = 'pausing';

  function pause(){
    debug('paused');
    self.readyState = 'paused';
    onPause();
  }

  if (this.polling || !this.writable) {
    var total = 0;

    if (this.polling) {
      debug('we are currently polling - waiting to pause');
      total++;
      this.once('pollComplete', function(){
        debug('pre-pause polling complete');
        --total || pause();
      });
    }

    if (!this.writable) {
      debug('we are currently writing - waiting to pause');
      total++;
      this.once('drain', function(){
        debug('pre-pause writing complete');
        --total || pause();
      });
    }
  } else {
    pause();
  }
};

/**
 * Starts polling cycle.
 *
 * @api public
 */

Polling.prototype.poll = function(){
  debug('polling');
  this.polling = true;
  this.doPoll();
  this.emit('poll');
};

/**
 * Overloads onData to detect payloads.
 *
 * @api private
 */

Polling.prototype.onData = function(data){
  var self = this;
  debug('polling got data %s', data);

  // decode payload
  parser.decodePayload(data, function(packet, index, total) {
    // if its the first message we consider the transport open
    if ('opening' == self.readyState) {
      self.onOpen();
    }

    // if its a close packet, we close the ongoing requests
    if ('close' == packet.type) {
      self.onClose();
      return false;
    }

    // otherwise bypass onData and handle the message
    self.onPacket(packet);
  });

  // if an event did not trigger closing
  if ('closed' != this.readyState) {
    // if we got data we're not polling
    this.polling = false;
    this.emit('pollComplete');

    if ('open' == this.readyState) {
      this.poll();
    } else {
      debug('ignoring poll - transport state "%s"', this.readyState);
    }
  }
};

/**
 * For polling, send a close packet.
 *
 * @api private
 */

Polling.prototype.doClose = function(){
  var self = this;

  function close(){
    debug('writing close packet');
    self.write([{ type: 'close' }]);
  }

  if ('open' == this.readyState) {
    debug('transport open - closing');
    close();
  } else {
    // in case we're trying to close while
    // handshaking is in progress (GH-164)
    debug('transport not open - deferring close');
    this.once('open', close);
  }
};

/**
 * Writes a packets payload.
 *
 * @param {Array} data packets
 * @param {Function} drain callback
 * @api private
 */

Polling.prototype.write = function(packets){
  var self = this;
  this.writable = false;
  this.doWrite(parser.encodePayload(packets), function(){
    self.writable = true;
    self.emit('drain');
  });
};

/**
 * Generates uri for connection.
 *
 * @api private
 */

Polling.prototype.uri = function(){
  var query = this.query || {};
  var schema = this.secure ? 'https' : 'http';
  var port = '';

  // cache busting is forced for IE / android / iOS6 ಠ_ಠ
  if (global.ActiveXObject || util.ua.chromeframe || util.ua.android || util.ua.ios6 ||
      this.timestampRequests) {
    query[this.timestampParam] = +new Date;
  }

  query = util.qs(query);

  // avoid port if default for schema
  if (this.port && (('https' == schema && this.port != 443) ||
     ('http' == schema && this.port != 80))) {
    port = ':' + this.port;
  }

  // prepend ? to query
  if (query.length) {
    query = '?' + query;
  }

  return schema + '://' + this.hostname + port + this.path + query;
};

});
require.register("learnboost-engine.io-client/lib/transports/polling-xhr.js", function(exports, require, module){
/**
 * Module requirements.
 */

var Polling = require('./polling')
  , util = require('../util')
  , Emitter = require('../emitter')
  , debug = require('debug')('engine.io-client:polling-xhr');

/**
 * Module exports.
 */

module.exports = XHR;
module.exports.Request = Request;

/**
 * Global reference.
 */

var global = require('global');

/**
 * Obfuscated key for Blue Coat.
 */

var xobject = global[['Active'].concat('Object').join('X')];

/**
 * Empty function
 */

function empty(){}

/**
 * XHR Polling constructor.
 *
 * @param {Object} opts
 * @api public
 */

function XHR(opts){
  Polling.call(this, opts);

  if (global.location) {
    var isSSL = 'https:' == location.protocol;
    var port = location.port;

    // some user agents have empty `location.port`
    if (!port) {
      port = isSSL ? 443 : 80;
    }

    this.xd = opts.hostname != global.location.hostname ||
      port != opts.port;
  }
};

/**
 * Inherits from Polling.
 */

util.inherits(XHR, Polling);

/**
 * Opens the socket
 *
 * @api private
 */

XHR.prototype.doOpen = function(){
  var self = this;
  util.defer(function(){
    Polling.prototype.doOpen.call(self);
  });
};

/**
 * Creates a request.
 *
 * @param {String} method
 * @api private
 */

XHR.prototype.request = function(opts){
  opts = opts || {};
  opts.uri = this.uri();
  opts.xd = this.xd;
  opts.agent = this.agent || false;
  return new Request(opts);
};

/**
 * Sends data.
 *
 * @param {String} data to send.
 * @param {Function} called upon flush.
 * @api private
 */

XHR.prototype.doWrite = function(data, fn){
  var req = this.request({ method: 'POST', data: data });
  var self = this;
  req.on('success', fn);
  req.on('error', function(err){
    self.onError('xhr post error', err);
  });
  this.sendXhr = req;
};

/**
 * Starts a poll cycle.
 *
 * @api private
 */

XHR.prototype.doPoll = function(){
  debug('xhr poll');
  var req = this.request();
  var self = this;
  req.on('data', function(data){
    self.onData(data);
  });
  req.on('error', function(err){
    self.onError('xhr poll error', err);
  });
  this.pollXhr = req;
};

/**
 * Request constructor
 *
 * @param {Object} options
 * @api public
 */

function Request(opts){
  this.method = opts.method || 'GET';
  this.uri = opts.uri;
  this.xd = !!opts.xd;
  this.async = false !== opts.async;
  this.data = undefined != opts.data ? opts.data : null;
  this.agent = opts.agent;
  this.create();
}

/**
 * Mix in `Emitter`.
 */

Emitter(Request.prototype);

/**
 * Creates the XHR object and sends the request.
 *
 * @api private
 */

Request.prototype.create = function(){
  var xhr = this.xhr = util.request(this.xd, { agent: this.agent });
  var self = this;

  xhr.open(this.method, this.uri, this.async);

  if ('POST' == this.method) {
    try {
      if (xhr.setRequestHeader) {
        // xmlhttprequest
        xhr.setRequestHeader('Content-type', 'text/plain;charset=UTF-8');
      } else {
        // xdomainrequest
        xhr.contentType = 'text/plain';
      }
    } catch (e) {}
  }

  if (this.xd && global.XDomainRequest && xhr instanceof XDomainRequest) {
    xhr.onerror = function(e){
      self.onError(e);
    };
    xhr.onload = function(){
      self.onData(xhr.responseText);
    };
    xhr.onprogress = empty;
  } else {
    // ie6 check
    if ('withCredentials' in xhr) {
      xhr.withCredentials = true;
    }

    xhr.onreadystatechange = function(){
      var data;

      try {
        if (4 != xhr.readyState) return;
        if (200 == xhr.status || 1223 == xhr.status) {
          data = xhr.responseText;
        } else {
          self.onError(xhr.status);
        }
      } catch (e) {
        self.onError(e);
      }

      if (undefined !== data) {
        self.onData(data);
      }
    };
  }

  debug('sending xhr with url %s | data %s', this.uri, this.data);
  try {
    xhr.send(this.data);
  } catch (e) {
    // Need to defer since .create() is called directly from the constructor
    // and thus the 'error' event can only be only bound *after* this exception
    // occurs.  Therefore, also, we cannot throw here at all.
    setTimeout(function() {
      self.onError(e);
    }, 0);
    return;
  }

  if (xobject) {
    this.index = Request.requestsCount++;
    Request.requests[this.index] = this;
  }
};

/**
 * Called upon successful response.
 *
 * @api private
 */

Request.prototype.onSuccess = function(){
  this.emit('success');
  this.cleanup();
};

/**
 * Called if we have data.
 *
 * @api private
 */

Request.prototype.onData = function(data){
  this.emit('data', data);
  this.onSuccess();
};

/**
 * Called upon error.
 *
 * @api private
 */

Request.prototype.onError = function(err){
  this.emit('error', err);
  this.cleanup();
};

/**
 * Cleans up house.
 *
 * @api private
 */

Request.prototype.cleanup = function(){
  if ('undefined' == typeof this.xhr ) {
    return;
  }
  // xmlhttprequest
  this.xhr.onreadystatechange = empty;

  // xdomainrequest
  this.xhr.onload = this.xhr.onerror = empty;

  try {
    this.xhr.abort();
  } catch(e) {}

  if (xobject) {
    delete Request.requests[this.index];
  }

  this.xhr = null;
};

/**
 * Aborts the request.
 *
 * @api public
 */

Request.prototype.abort = function(){
  this.cleanup();
};

if (xobject) {
  Request.requestsCount = 0;
  Request.requests = {};

  global.attachEvent('onunload', function(){
    for (var i in Request.requests) {
      if (Request.requests.hasOwnProperty(i)) {
        Request.requests[i].abort();
      }
    }
  });
}

});
require.register("learnboost-engine.io-client/lib/transports/polling-jsonp.js", function(exports, require, module){

/**
 * Module requirements.
 */

var Polling = require('./polling')
  , util = require('../util');

/**
 * Module exports.
 */

module.exports = JSONPPolling;

/**
 * Global reference.
 */

var global = require('global');

/**
 * Cached regular expressions.
 */

var rNewline = /\n/g;

/**
 * Global JSONP callbacks.
 */

var callbacks;

/**
 * Callbacks count.
 */

var index = 0;

/**
 * Noop.
 */

function empty () { }

/**
 * JSONP Polling constructor.
 *
 * @param {Object} opts.
 * @api public
 */

function JSONPPolling (opts) {
  Polling.call(this, opts);

  // define global callbacks array if not present
  // we do this here (lazily) to avoid unneeded global pollution
  if (!callbacks) {
    // we need to consider multiple engines in the same page
    if (!global.___eio) global.___eio = [];
    callbacks = global.___eio;
  }

  // callback identifier
  this.index = callbacks.length;

  // add callback to jsonp global
  var self = this;
  callbacks.push(function (msg) {
    self.onData(msg);
  });

  // append to query string
  this.query.j = this.index;
};

/**
 * Inherits from Polling.
 */

util.inherits(JSONPPolling, Polling);

/**
 * Opens the socket.
 *
 * @api private
 */

JSONPPolling.prototype.doOpen = function () {
  var self = this;
  util.defer(function () {
    Polling.prototype.doOpen.call(self);
  });
};

/**
 * Closes the socket
 *
 * @api private
 */

JSONPPolling.prototype.doClose = function () {
  if (this.script) {
    this.script.parentNode.removeChild(this.script);
    this.script = null;
  }

  if (this.form) {
    this.form.parentNode.removeChild(this.form);
    this.form = null;
  }

  Polling.prototype.doClose.call(this);
};

/**
 * Starts a poll cycle.
 *
 * @api private
 */

JSONPPolling.prototype.doPoll = function () {
	var self = this;
  var script = document.createElement('script');

  if (this.script) {
    this.script.parentNode.removeChild(this.script);
    this.script = null;
  }

  script.async = true;
  script.src = this.uri();
	script.onerror = function(e){
		self.onError('jsonp poll error',e);
	}

  var insertAt = document.getElementsByTagName('script')[0];
  insertAt.parentNode.insertBefore(script, insertAt);
  this.script = script;


  if (util.ua.gecko) {
    setTimeout(function () {
      var iframe = document.createElement('iframe');
      document.body.appendChild(iframe);
      document.body.removeChild(iframe);
    }, 100);
  }
};

/**
 * Writes with a hidden iframe.
 *
 * @param {String} data to send
 * @param {Function} called upon flush.
 * @api private
 */

JSONPPolling.prototype.doWrite = function (data, fn) {
  var self = this;

  if (!this.form) {
    var form = document.createElement('form');
    var area = document.createElement('textarea');
    var id = this.iframeId = 'eio_iframe_' + this.index;
    var iframe;

    form.className = 'socketio';
    form.style.position = 'absolute';
    form.style.top = '-1000px';
    form.style.left = '-1000px';
    form.target = id;
    form.method = 'POST';
    form.setAttribute('accept-charset', 'utf-8');
    area.name = 'd';
    form.appendChild(area);
    document.body.appendChild(form);

    this.form = form;
    this.area = area;
  }

  this.form.action = this.uri();

  function complete () {
    initIframe();
    fn();
  };

  function initIframe () {
    if (self.iframe) {
      try {
        self.form.removeChild(self.iframe);
      } catch (e) {
        self.onError('jsonp polling iframe removal error', e);
      }
    }

    try {
      // ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
      var html = '<iframe src="javascript:0" name="'+ self.iframeId +'">';
      iframe = document.createElement(html);
    } catch (e) {
      iframe = document.createElement('iframe');
      iframe.name = self.iframeId;
      iframe.src = 'javascript:0';
    }

    iframe.id = self.iframeId;

    self.form.appendChild(iframe);
    self.iframe = iframe;
  };

  initIframe();

  // escape \n to prevent it from being converted into \r\n by some UAs
  this.area.value = data.replace(rNewline, '\\n');

  try {
    this.form.submit();
  } catch(e) {}

  if (this.iframe.attachEvent) {
    this.iframe.onreadystatechange = function(){
      if (self.iframe.readyState == 'complete') {
        complete();
      }
    };
  } else {
    this.iframe.onload = complete;
  }
};

});
require.register("learnboost-engine.io-client/lib/transports/websocket.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var Transport = require('../transport')
  , WebSocket = require('ws')
  , parser = require('engine.io-parser')
  , util = require('../util')
  , debug = require('debug')('engine.io-client:websocket');

/**
 * Module exports.
 */

module.exports = WS;

/**
 * Global reference.
 */

var global = require('global');

/**
 * WebSocket transport constructor.
 *
 * @api {Object} connection options
 * @api public
 */

function WS(opts){
  Transport.call(this, opts);
};

/**
 * Inherits from Transport.
 */

util.inherits(WS, Transport);

/**
 * Transport name.
 *
 * @api public
 */

WS.prototype.name = 'websocket';

/**
 * Opens socket.
 *
 * @api private
 */

WS.prototype.doOpen = function(){
  if (!this.check()) {
    // let probe timeout
    return;
  }

  var self = this;
  var uri = this.uri();
  var protocols = void(0);
  var opts = { agent: this.agent };

  this.socket = new WebSocket(uri, protocols, opts);
  this.addEventListeners();
};

/**
 * Adds event listeners to the socket
 *
 * @api private
 */

WS.prototype.addEventListeners = function() {
  var self = this;

  this.socket.onopen = function(){
    self.onOpen();
  };
  this.socket.onclose = function(){
    self.onClose();
  };
  this.socket.onmessage = function(ev){
    self.onData(ev.data);
  };
  this.socket.onerror = function(e){
    self.onError('websocket error', e);
  };
};

/**
 * Override `onData` to use a timer on iOS.
 * See: https://gist.github.com/mloughran/2052006
 *
 * @api private
 */

if ('undefined' != typeof navigator
  && /iPad|iPhone|iPod/i.test(navigator.userAgent)) {
  WS.prototype.onData = function(data){
    var self = this;
    setTimeout(function(){
      Transport.prototype.onData.call(self, data);
    }, 0);
  };
}

/**
 * Writes data to socket.
 *
 * @param {Array} array of packets.
 * @api private
 */

WS.prototype.write = function(packets){
  var self = this;
  this.writable = false;
  // encodePacket efficient as it uses WS framing
  // no need for encodePayload
  for (var i = 0, l = packets.length; i < l; i++) {
    this.socket.send(parser.encodePacket(packets[i]));
  }
  function ondrain() {
    self.writable = true;
    self.emit('drain');
  }
  // fake drain
  // defer to next tick to allow Socket to clear writeBuffer
  setTimeout(ondrain, 0);
};

/**
 * Called upon close
 *
 * @api private
 */

WS.prototype.onClose = function(){
  Transport.prototype.onClose.call(this);
};

/**
 * Closes socket.
 *
 * @api private
 */

WS.prototype.doClose = function(){
  if (typeof this.socket !== 'undefined') {
    this.socket.close();
  }
};

/**
 * Generates uri for connection.
 *
 * @api private
 */

WS.prototype.uri = function(){
  var query = this.query || {};
  var schema = this.secure ? 'wss' : 'ws';
  var port = '';

  // avoid port if default for schema
  if (this.port && (('wss' == schema && this.port != 443)
    || ('ws' == schema && this.port != 80))) {
    port = ':' + this.port;
  }

  // append timestamp to URI
  if (this.timestampRequests) {
    query[this.timestampParam] = +new Date;
  }

  query = util.qs(query);

  // prepend ? to query
  if (query.length) {
    query = '?' + query;
  }

  return schema + '://' + this.hostname + port + this.path + query;
};

/**
 * Feature detection for WebSocket.
 *
 * @return {Boolean} whether this transport is available.
 * @api public
 */

WS.prototype.check = function(){
  return !!WebSocket && !('__initialize' in WebSocket && this.name === WS.prototype.name);
};

});
require.register("learnboost-engine.io-client/lib/transports/flashsocket.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var WS = require('./websocket')
  , util = require('../util')
  , debug = require('debug')('engine.io-client:flashsocket');

/**
 * Module exports.
 */

module.exports = FlashWS;

/**
 * Global reference.
 */

var global = require('global');

/**
 * Obfuscated key for Blue Coat.
 */

var xobject = global[['Active'].concat('Object').join('X')];

/**
 * FlashWS constructor.
 *
 * @api public
 */

function FlashWS (options) {
  WS.call(this, options);
  this.flashPath = options.flashPath;
  this.policyPort = options.policyPort;
};

/**
 * Inherits from WebSocket.
 */

util.inherits(FlashWS, WS);

/**
 * Transport name.
 *
 * @api public
 */

FlashWS.prototype.name = 'flashsocket';

/**
 * Opens the transport.
 *
 * @api public
 */

FlashWS.prototype.doOpen = function () {
  if (!this.check()) {
    // let the probe timeout
    return;
  }

  // instrument websocketjs logging
  function log (type) {
    return function(){
      var str = Array.prototype.join.call(arguments, ' ');
      debug('[websocketjs %s] %s', type, str);
    };
  };

  WEB_SOCKET_LOGGER = { log: log('debug'), error: log('error') };
  WEB_SOCKET_SUPPRESS_CROSS_DOMAIN_SWF_ERROR = true;
  WEB_SOCKET_DISABLE_AUTO_INITIALIZATION = true;

  if ('undefined' == typeof WEB_SOCKET_SWF_LOCATION) {
    WEB_SOCKET_SWF_LOCATION = this.flashPath + 'WebSocketMainInsecure.swf';
  }

  // dependencies
  var deps = [this.flashPath + 'web_socket.js'];

  if ('undefined' == typeof swfobject) {
    deps.unshift(this.flashPath + 'swfobject.js');
  }

  var self = this;

  load(deps, function () {
    self.ready(function () {
      WebSocket.__addTask(function () {
        self.socket = new WebSocket(self.uri());
        self.addEventListeners();
      });
    });
  });
};

/**
 * Override to prevent closing uninitialized flashsocket.
 *
 * @api private
 */

FlashWS.prototype.doClose = function () {
  if (!this.socket) return;
  var self = this;
  WebSocket.__addTask(function() {
    WS.prototype.doClose.call(self);
  });
};

/**
 * Writes to the Flash socket.
 *
 * @api private
 */

FlashWS.prototype.write = function() {
  var self = this, args = arguments;
  WebSocket.__addTask(function () {
    WS.prototype.write.apply(self, args);
  });
};

/**
 * Called upon dependencies are loaded.
 *
 * @api private
 */

FlashWS.prototype.ready = function (fn) {
  if (typeof WebSocket == 'undefined' ||
    !('__initialize' in WebSocket) || !swfobject) {
    return;
  }

  if (swfobject.getFlashPlayerVersion().major < 10) {
    return;
  }

  function init () {
    // Only start downloading the swf file when the checked that this browser
    // actually supports it
    if (!FlashWS.loaded) {
      if (843 != self.policyPort) {
        WebSocket.loadFlashPolicyFile('xmlsocket://' + self.hostname + ':' + self.policyPort);
      }

      WebSocket.__initialize();
      FlashWS.loaded = true;
    }

    fn.call(self);
  }

  var self = this;
  if (document.body) {
    return init();
  }

  util.load(init);
};

/**
 * Feature detection for flashsocket.
 *
 * @return {Boolean} whether this transport is available.
 * @api public
 */

FlashWS.prototype.check = function () {
  if ('undefined' == typeof window) {
    return false;
  }

  if (typeof WebSocket != 'undefined' && !('__initialize' in WebSocket)) {
    return false;
  }

  if (xobject) {
    var control = null;
    try {
      control = new xobject('ShockwaveFlash.ShockwaveFlash');
    } catch (e) { }
    if (control) {
      return true;
    }
  } else {
    for (var i = 0, l = navigator.plugins.length; i < l; i++) {
      for (var j = 0, m = navigator.plugins[i].length; j < m; j++) {
        if (navigator.plugins[i][j].description == 'Shockwave Flash') {
          return true;
        }
      }
    }
  }

  return false;
};

/**
 * Lazy loading of scripts.
 * Based on $script by Dustin Diaz - MIT
 */

var scripts = {};

/**
 * Injects a script. Keeps tracked of injected ones.
 *
 * @param {String} path
 * @param {Function} callback
 * @api private
 */

function create (path, fn) {
  if (scripts[path]) return fn();

  var el = document.createElement('script');
  var loaded = false;

  debug('loading "%s"', path);
  el.onload = el.onreadystatechange = function () {
    if (loaded || scripts[path]) return;
    var rs = el.readyState;
    if (!rs || 'loaded' == rs || 'complete' == rs) {
      debug('loaded "%s"', path);
      el.onload = el.onreadystatechange = null;
      loaded = true;
      scripts[path] = true;
      fn();
    }
  };

  el.async = 1;
  el.src = path;

  var head = document.getElementsByTagName('head')[0];
  head.insertBefore(el, head.firstChild);
};

/**
 * Loads scripts and fires a callback.
 *
 * @param {Array} paths
 * @param {Function} callback
 */

function load (arr, fn) {
  function process (i) {
    if (!arr[i]) return fn();
    create(arr[i], function () {
      process(++i);
    });
  };

  process(0);
};

});
require.register("component-object/index.js", function(exports, require, module){

/**
 * HOP ref.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Return own keys in `obj`.
 *
 * @param {Object} obj
 * @return {Array}
 * @api public
 */

exports.keys = Object.keys || function(obj){
  var keys = [];
  for (var key in obj) {
    if (has.call(obj, key)) {
      keys.push(key);
    }
  }
  return keys;
};

/**
 * Return own values in `obj`.
 *
 * @param {Object} obj
 * @return {Array}
 * @api public
 */

exports.values = function(obj){
  var vals = [];
  for (var key in obj) {
    if (has.call(obj, key)) {
      vals.push(obj[key]);
    }
  }
  return vals;
};

/**
 * Merge `b` into `a`.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api public
 */

exports.merge = function(a, b){
  for (var key in b) {
    if (has.call(b, key)) {
      a[key] = b[key];
    }
  }
  return a;
};

/**
 * Return length of `obj`.
 *
 * @param {Object} obj
 * @return {Number}
 * @api public
 */

exports.length = function(obj){
  return exports.keys(obj).length;
};

/**
 * Check if `obj` is empty.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api public
 */

exports.isEmpty = function(obj){
  return 0 == exports.length(obj);
};
});
require.register("cloudup-mongo-eql/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var type;

try {
  type = require('type');
} catch(e){
  type = require('type-component');
}

/**
 * Module exports.
 */

module.exports = eql;

/**
 * MongoDB style value comparisons.
 *
 * @param {Object} matcher
 * @param {Object} value
 * @return {Boolean} true if they match
 */

function eql(matcher, val){
  switch (type(matcher)) {
    case 'null':
    case 'undefined':
      // we treat null as undefined
      return null == val;

    case 'regexp':
      return matcher.test(val);

    case 'array':
      if ('array' == type(val) && matcher.length == val.length) {
        for (var i = 0; i < matcher.length; i++) {
          if (!eql(val[i], matcher[i])) return false;
        }
        return true;
      } else {
        return false;
      }
      break;

    case 'object':
      // object can match keys in any order
      var keys = {};

      // we match all values of `matcher` in `val`
      for (var i in matcher) {
        if (matcher.hasOwnProperty(i)) {
          if (!eql(matcher[i], val[i])) return false;
        }
        keys[i] = true;
      }

      // we make sure `val` doesn't have extra keys
      for (var i in val) {
        if (val.hasOwnProperty(i) && !keys.hasOwnProperty(i)) {
          return false;
        }
      }

      return true;

    default:
      return matcher === val;
  }
}

});
require.register("cloudup-mongo-query/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var mods = require('./mods')
  , filter = require('./filter')
  , debug = require('debug')('mongo-query')
  , object, type, dot;

/**
 * Dual require for components.
 */

try {
  type = require('type');
  object = require('object');
  dot = require('dot');
} catch(e){
  type = require('type-component');
  object = require('object-component');
  dot = require('dot-component');
}

/**
 * Module exports.
 */

module.exports = exports = query;

/**
 * Export filter helper.
 */

exports.filter = filter;

/**
 * Export modifiers.
 */

exports.mods = mods;

/**
 * Execute a query.
 *
 * Options:
 *  - `strict` only modify if query matches
 *
 * @param {Object} object to alter
 * @param {Object} query to filter modifications by
 * @param {Object} update object
 * @param {Object} options
 */

function query(obj, query, update, opts){
  obj = obj || {};
  opts = opts || {};
  query = query || {};
  update = update || {};

  // strict mode
  var strict = !!opts.strict;

  var match;
  var log = [];

  if (object.length(query)) {
    match = filter(obj, query);
  }

  if (!strict || false !== match) {
    var keys = object.keys(update);
    var transactions = [];

    for (var i = 0, l = keys.length; i < l; i++) {
      if (mods[keys[i]]) {
        debug('found modifier "%s"', keys[i]);
        for (var key in update[keys[i]]) {
          var pos = key.indexOf('.$.');

          if (~pos) {
            var prefix = key.substr(0, pos);
            var suffix = key.substr(pos + 3);

            if (match[prefix]) {
              debug('executing "%s" %s on first match within "%s"', key, keys[i], prefix);
              var fn = mods[keys[i]](match[prefix][0], suffix, update[keys[i]][key]);
              if (fn) {
                // produce a key name replacing $ with the actual index
                // TODO: this is unnecessarily expensive
                var index = dot.get(obj, prefix).indexOf(match[prefix][0]);
                fn.key = prefix + '.' + index + '.' + suffix;
                fn.op = keys[i];
                transactions.push(fn);
              }
            } else {
              debug('ignoring "%s" %s - no matches within "%s"', key, keys[i], prefix);
            }
          } else {
            var fn = mods[keys[i]](obj, key, update[keys[i]][key]);
            if (fn) {
              fn.key = key;
              fn.op = keys[i];
              transactions.push(fn);
            }
          }
        }
      } else {
        debug('skipping unknown modifier "%s"', keys[i]);
      }
    }

    if (transactions.length) {
      // if we got here error free we process all transactions
      for (var i = 0; i < transactions.length; i++) {
        var fn = transactions[i];
        var val = fn();
        log.push({ op: fn.op, key: fn.key, value: val });
      }
    }
  } else {
    debug("no matches for query %j", query);
  }

  return log;
}

});
require.register("cloudup-mongo-query/mods.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var eql = require('mongo-eql');
var debug = require('debug')('mongo-query');
var type, keys, dot;

try {
  dot = require('dot');
  type = require('type');
  keys = require('object').keys;
} catch(e){
  dot = require('dot-component');
  type = require('type-component');
  keys = require('object-component').keys;
}

/**
 * Performs a `$set`.
 *
 * @param {Object} object to modify
 * @param {String} path to alter
 * @param {String} value to set
 * @return {Function} transaction (unless noop)
 */

exports.$set = function $set(obj, path, val){
  var key = path.split('.').pop();
  obj = dot.parent(obj, path, true);

  switch (type(obj)) {
    case 'object':
      if (!eql(obj[key], val)) {
        return function(){
          obj[key] = val;
          return val;
        };
      }
      break;

    case 'array':
      if (numeric(key)) {
        if (!eql(obj[key], val)) {
          return function(){
            obj[key] = val;
            return val;
          };
        }
      } else {
        throw new Error('can\'t append to array using string field name [' + key + ']');
      }
      break;

    default:
      throw new Error('$set only supports object not ' + type(obj));
  }
};

/**
 * Performs an `$unset`.
 *
 * @param {Object} object to modify
 * @param {String} path to alter
 * @param {String} value to set
 * @return {Function} transaction (unless noop)
 */

exports.$unset = function $unset(obj, path){
  var key = path.split('.').pop();
  obj = dot.parent(obj, path);

  switch (type(obj)) {
    case 'array':
    case 'object':
      if (obj.hasOwnProperty(key)) {
        return function(){
          // reminder: `delete arr[1]` === `delete arr['1']` [!]
          delete obj[key];
        };
      } else {
        // we fail silently
        debug('ignoring unset of inexisting key');
      }
  }
};

/**
 * Performs a `$rename`.
 *
 * @param {Object} object to modify
 * @param {String} path to alter
 * @param {String} value to set
 * @return {Function} transaction (unless noop)
 */

exports.$rename = function $rename(obj, path, newKey){
  // target = source
  if (path == newKey) {
    throw new Error('$rename source must differ from target');
  }

  // target is parent of source
  if (0 === path.indexOf(newKey + '.')) {
    throw new Error('$rename target may not be a parent of source');
  }

  var p = dot.parent(obj, path);
  var t = type(p);

  if ('object' == t) {
    var key = path.split('.').pop();

    if (p.hasOwnProperty(key)) {
      return function(){
        var val = p[key];
        delete p[key];

        // target does initialize the path
        var newp = dot.parent(obj, newKey, true);

        // and also fails silently upon type mismatch
        if ('object' == type(newp)) {
          newp[newKey.split('.').pop()] = val;
        } else {
          debug('invalid $rename target path type');
        }

        // returns the name of the new key
        return newKey;
      };
    } else {
      debug('ignoring rename from inexisting source');
    }
  } else if ('undefined' != t) {
    throw new Error('$rename source field invalid');
  }
};

/**
 * Performs an `$inc`.
 *
 * @param {Object} object to modify
 * @param {String} path to alter
 * @param {String} value to set
 * @return {Function} transaction (unless noop)
 */

exports.$inc = function $inc(obj, path, inc){
  if ('number' != type(inc)) {
    throw new Error('Modifier $inc allowed for numbers only');
  }

  obj = dot.parent(obj, path, true);
  var key = path.split('.').pop();

  switch (type(obj)) {
    case 'array':
    case 'object':
      if (obj.hasOwnProperty(key)) {
        if ('number' != type(obj[key])) {
          throw new Error('Cannot apply $inc modifier to non-number');
        }

        return function(){
          obj[key] += inc;
          return inc;
        };
      } else if('object' == type(obj) || numeric(key)){
        return function(){
          obj[key] = inc;
          return inc;
        };
      } else {
        throw new Error('can\'t append to array using string field name [' + key + ']');
      }
      break;

    default:
      throw new Error('Cannot apply $inc modifier to non-number');
  }
};

/**
 * Performs an `$pop`.
 *
 * @param {Object} object to modify
 * @param {String} path to alter
 * @param {String} value to set
 * @return {Function} transaction (unless noop)
 */

exports.$pop = function $pop(obj, path, val){
  obj = dot.parent(obj, path);
  var key = path.split('.').pop();

  // we make sure the array is not just the parent of the main key
  switch (type(obj)) {
    case 'array':
    case 'object':
      if (obj.hasOwnProperty(key)) {
        switch (type(obj[key])) {
          case 'array':
            if (obj[key].length) {
              return function(){
                if (-1 == val) {
                  return obj[key].shift();
                } else {
                  // mongodb allows any value to pop
                  return obj[key].pop();
                }
              };
            }
            break;

          case 'undefined':
            debug('ignoring pop to inexisting key');
            break;

          default:
            throw new Error('Cannot apply $pop modifier to non-array');
        }
      } else {
        debug('ignoring pop to inexisting key');
      }
      break;

    case 'undefined':
      debug('ignoring pop to inexisting key');
      break;
  }
};

/**
 * Performs a `$push`.
 *
 * @param {Object} object to modify
 * @param {String} path to alter
 * @param {Object} value to push
 * @return {Function} transaction (unless noop)
 */

exports.$push = function $push(obj, path, val){
  obj = dot.parent(obj, path, true);
  var key = path.split('.').pop();

  switch (type(obj)) {
    case 'object':
      if (obj.hasOwnProperty(key)) {
        if ('array' == type(obj[key])) {
          return function(){
            obj[key].push(val);
            return val;
          };
        } else {
          throw new Error('Cannot apply $push/$pushAll modifier to non-array');
        }
      } else {
        return function(){
          obj[key] = [val];
          return val;
        };
      }
      break;

    case 'array':
      if (obj.hasOwnProperty(key)) {
        if ('array' == type(obj[key])) {
          return function(){
            obj[key].push(val);
            return val;
          };
        } else {
          throw new Error('Cannot apply $push/$pushAll modifier to non-array');
        }
      } else if (numeric(key)) {
        return function(){
          obj[key] = [val];
          return val;
        };
      } else {
        throw new Error('can\'t append to array using string field name [' + key + ']');
      }
      break;
  }
};

/**
 * Performs a `$pushAll`.
 *
 * @param {Object} object to modify
 * @param {String} path to alter
 * @param {Array} values to push
 * @return {Function} transaction (unless noop)
 */

exports.$pushAll = function $pushAll(obj, path, val){
  if ('array' != type(val)) {
    throw new Error('Modifier $pushAll/pullAll allowed for arrays only');
  }

  obj = dot.parent(obj, path, true);
  var key = path.split('.').pop();

  switch (type(obj)) {
    case 'object':
      if (obj.hasOwnProperty(key)) {
        if ('array' == type(obj[key])) {
          return function(){
            obj[key].push.apply(obj[key], val);
            return val;
          };
        } else {
          throw new Error('Cannot apply $push/$pushAll modifier to non-array');
        }
      } else {
        return function(){
          obj[key] = val;
          return val;
        };
      }
      break;

    case 'array':
      if (obj.hasOwnProperty(key)) {
        if ('array' == type(obj[key])) {
          return function(){
            obj[key].push.apply(obj[key], val);
            return val;
          };
        } else {
          throw new Error('Cannot apply $push/$pushAll modifier to non-array');
        }
      } else if (numeric(key)) {
        return function(){
          obj[key] = val;
          return val;
        };
      } else {
        throw new Error('can\'t append to array using string field name [' + key + ']');
      }
      break;
  }
};

/**
 * Performs a `$pull`.
 */

exports.$pull = function $pull(obj, path, val){
  obj = dot.parent(obj, path, true);
  var key = path.split('.').pop();
  var t = type(obj);

  switch (t) {
    case 'object':
      if (obj.hasOwnProperty(key)) {
        if ('array' == type(obj[key])) {
          var pulled = [];
          var splice = pull(obj[key], [val], pulled);
          if (pulled.length) {
            return function(){
              splice();
              return pulled;
            };
          }
        } else {
          throw new Error('Cannot apply $pull/$pullAll modifier to non-array');
        }
      }
      break;

    case 'array':
      if (obj.hasOwnProperty(key)) {
        if ('array' == type(obj[key])) {
          var pulled = [];
          var splice = pull(obj[key], [val], pulled);
          if (pulled.length) {
            return function(){
              splice();
              return pulled;
            };
          }
        } else {
          throw new Error('Cannot apply $pull/$pullAll modifier to non-array');
        }
      } else {
        debug('ignoring pull to non array');
      }
      break;

    default:
      if ('undefined' != t) {
        throw new Error('LEFT_SUBFIELD only supports Object: hello not: ' + t);
      }
  }
};

/**
 * Performs a `$pullAll`.
 */

exports.$pullAll = function $pullAll(obj, path, val){
  if ('array' != type(val)) {
    throw new Error('Modifier $pushAll/pullAll allowed for arrays only');
  }

  obj = dot.parent(obj, path, true);
  var key = path.split('.').pop();
  var t = type(obj);

  switch (t) {
    case 'object':
      if (obj.hasOwnProperty(key)) {
        if ('array' == type(obj[key])) {
          var pulled = [];
          var splice = pull(obj[key], val, pulled);
          if (pulled.length) {
            return function(){
              splice();
              return pulled;
            };
          }
        } else {
          throw new Error('Cannot apply $pull/$pullAll modifier to non-array');
        }
      }
      break;

    case 'array':
      if (obj.hasOwnProperty(key)) {
        if ('array' == type(obj[key])) {
          var pulled = [];
          var splice = pull(obj[key], val, pulled);
          if (pulled.length) {
            return function(){
              splice();
              return pulled;
            };
          }
        } else {
          throw new Error('Cannot apply $pull/$pullAll modifier to non-array');
        }
      } else {
        debug('ignoring pull to non array');
      }
      break;

    default:
      if ('undefined' != t) {
        throw new Error('LEFT_SUBFIELD only supports Object: hello not: ' + t);
      }
  }
};

/**
 * Performs a `$addToSet`.
 *
 * @param {Object} object to modify
 * @param {String} path to alter
 * @param {Object} value to push
 * @param {Boolean} internal, true if recursing
 * @return {Function} transaction (unless noop)
 */

exports.$addToSet = function $addToSet(obj, path, val, recursing){
  if (!recursing && 'array' == type(val.$each)) {
    var fns = [];
    for (var i = 0, l = val.$each.length; i < l; i++) {
      var fn = $addToSet(obj, path, val.$each[i], true);
      if (fn) fns.push(fn);
    }
    if (fns.length) {
      return function(){
        var values = [];
        for (var i = 0; i < fns.length; i++) values.push(fns[i]());
        return values;
      };
    } else {
      return;
    }
  }

  obj = dot.parent(obj, path, true);
  var key = path.split('.').pop();

  switch (type(obj)) {
    case 'object':
      if (obj.hasOwnProperty(key)) {
        if ('array' == type(obj[key])) {
          if (!has(obj[key], val)) {
            return function(){
              obj[key].push(val);
              return val;
            };
          }
        } else {
          throw new Error('Cannot apply $addToSet modifier to non-array');
        }
      } else {
        return function(){
          obj[key] = [val];
          return val;
        };
      }
      break;

    case 'array':
      if (obj.hasOwnProperty(key)) {
        if ('array' == type(obj[key])) {
          if (!has(obj[key], val)) {
            return function(){
              obj[key].push(val);
              return val;
            };
          }
        } else {
          throw new Error('Cannot apply $addToSet modifier to non-array');
        }
      } else if (numeric(key)) {
        return function(){
          obj[key] = [val];
          return val;
        };
      } else {
        throw new Error('can\'t append to array using string field name [' + key + ']');
      }
      break;
  }
};

/**
 * Helper for determining if an array has the given value.
 *
 * @param {Array} array
 * @param {Object} value to check
 * @return {Boolean}
 */

function has(array, val){
  for (var i = 0, l = array.length; i < l; i++) {
    if (eql(val, array[i])) return true;
  }
  return false;
}

/**
 * Array#filter function generator for `$pull`/`$pullAll` operations.
 *
 * @param {Array} array of values to match
 * @param {Array} array to populate with results
 * @return {Function} that splices the array
 */

function pull(arr, vals, pulled){
  var indexes = [];

  for (var a = 0; a < arr.length; a++) {
    var val = arr[a];

    for (var i = 0; i < vals.length; i++) {
      var matcher = vals[i];
      if ('object' == type(matcher)) {
        // we only are only interested in obj <-> obj comparisons
        if ('object' == type(val)) {
          var match = false;

          if (keys(matcher).length) {
            for (var i in matcher) {
              if (matcher.hasOwnProperty(i)) {
                // we need at least one matching key to pull
                if (eql(matcher[i], val[i])) {
                  match = true;
                } else {
                  // if a single key doesn't match we move on
                  match = false;
                  break;
                }
              }
            }
          } else if (!keys(val).length) {
            // pull `{}` matches [{}]
            match = true;
          }

          if (match) {
            indexes.push(a);
            pulled.push(val);
            continue;
          }
        } else {
          debug('ignoring pull match against object');
        }
      } else {
        if (eql(matcher, val)) {
          indexes.push(a);
          pulled.push(val);
          continue;
        }
      }
    }
  }

  return function(){
    for (var i = 0; i < indexes.length; i++) {
      var index = indexes[i];
      arr.splice(index - i, 1);
    }
  };
}

/**
 * Helper to determine if a value is numeric.
 *
 * @param {String|Number} value
 * @return {Boolean} true if numeric
 * @api private
 */

function numeric(val){
  return 'number' == type(val) || Number(val) == val;
}

});
require.register("cloudup-mongo-query/filter.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var eql = require('mongo-eql');
var ops = require('./ops');
var debug = require('debug')('mongo-query');
var object, type, dot;

try {
  dot = require('dot');
  type = require('type');
  object = require('object');
} catch(e){
  dot = require('dot-component');
  type = require('type-component');
  object = require('object-component');
}

/**
 * Module exports.
 */

module.exports = exports = filter;
exports.ops = ops;

/**
 * Filters an `obj` by the given `query` for subdocuments.
 *
 * @return {Object|Boolean} false if no match, or matched subdocs
 * @api public
 */

function filter(obj, query){
  obj = obj || {};
  var ret = {};

  for (var key in query) {
    if (!query.hasOwnProperty(key)) continue;

    // search value
    var val = query[key];

    // split the key into prefix and suffix
    var keys = key.split('.');
    var target = obj;
    var prefix, search;
    var matches = [];

    walk_keys:
    for (var i = 0; i < keys.length; i++) {
      target = target[keys[i]];

      switch (type(target)) {
        case 'array':
          // if it's an array subdocument search we stop here
          prefix = keys.slice(0, i + 1).join('.');
          search = keys.slice(i + 1).join('.');

          debug('searching array "%s"', prefix);

          // we special case operators that don't walk the array
          if (val.$size && !search.length) {
            return compare(val, target);
          }

          // walk subdocs
          var subset = ret[prefix] || target;

          for (var ii = 0; ii < subset.length; ii++) {
            if (search.length) {
              var q = {};
              q[search] = val;
              if ('object' == type(subset[ii])) {
                debug('attempting subdoc search with query %j', q);
                if (filter(subset[ii], q)) {
                  // we ignore the ret value of filter
                  if (!ret[prefix] || !~ret[prefix].indexOf(subset[ii])) {
                    matches.push(subset[ii]);
                  }
                }
              }
            } else {
              debug('performing simple array item search');
              if (compare(val, subset[ii])) {
                if (!ret[prefix] || !~ret[prefix].indexOf(subset[ii])) {
                  matches.push(subset[ii]);
                }
              }
            }
          }

          if (matches.length) {
            ret[prefix] = ret[prefix] || [];
            ret[prefix].push.apply(ret[prefix], matches);
          }

          // we don't continue the key search
          break walk_keys;

        case 'undefined':
          // if we can't find the key
          return false;

        case 'object':
          if (null != keys[i + 1]) {
            continue;
          } else if (!compare(val, target)) {
            return false;
          }
          break;

        default:
          if (!compare(val, target)) return false;
      }
    }
  }

  return ret;
}

/**
 * Compares the given matcher with the document value.
 *
 * @param {Mixed} matcher
 * @param {Mixed} value
 * @api private
 */

function compare(matcher, val){
  if ('object' != type(matcher)) {
    return eql(matcher, val);
  }

  var keys = object.keys(matcher);
  if ('$' == keys[0][0]) {
    for (var i = 0; i < keys.length; i++) {
      // special case for sub-object matching
      if ('$elemMatch' == keys[i]) {
        return false !== filter(val, matcher.$elemMatch);
      } else {
        if (!ops[keys[i]](matcher[keys[i]], val)) return false;
      }
    }
    return true;
  } else {
    return eql(matcher, val);
  }
}

});
require.register("cloudup-mongo-query/ops.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var eql = require('mongo-eql');
var type;

try {
  type = require('type');
} catch(e){
  type = require('type-component');
}

/**
 * $ne: not equal.
 */

exports.$ne = function $ne(matcher, val){
  return !eql(matcher, val);
};

/**
 * $gt: greater than.
 */

exports.$gt = function $gt(matcher, val){
  return val > matcher;
};

/**
 * $gte: greater than equal.
 */

exports.$gte = function $gte(matcher, val){
  return val >= matcher;
};

/**
 * $lt: less than.
 */

exports.$lt = function $lt(matcher, val){
  return val < matcher;
};

/**
 * $lte: less than equal.
 */

exports.$lte = function $lte(matcher, val){
  return val <= matcher;
};

/**
 * $regex: supply a regular expression as a string.
 */

exports.$regex = function $regex(matcher, val){
  // TODO: add $options support
  if ('regexp' != type('matcher')) matcher = new RegExp(matcher);
  return matcher.test(val);
};

/**
 * $exists: key exists.
 */

exports.$exists = function $exists(matcher, val){
  if (matcher) {
    return undefined !== val;
  } else {
    return undefined === val;
  }
};

/**
 * $in: value in array.
 */

exports.$in = function $in(matcher, val){
  if ('array' != type(matcher)) return false;
  for (var i = 0; i < matcher.length; i++) {
    if (eql(matcher[i], val)) return true;
  }
  return false;
};

/**
 * $nin: value not in array.
 */

exports.$nin = function $nin(matcher, val){
  return !exports.$in(matcher, val);
};

/**
 * @size: array length
 */

exports.$size = function(matcher, val){
  return Array.isArray(val) && matcher == val.length;
};

});
require.register("cloudup-dot/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

try {
  var type = require('type');
} catch(e){
  var type = require('type-component');
}

/**
 * Gets a certain `path` from the `obj`.
 *
 * @param {Object} target
 * @param {String} key
 * @return {Object} found object, or `undefined
 * @api public
 */

exports.get = function(obj, path){
  if (~path.indexOf('.')) {
    var par = parent(obj, path);
    var mainKey = path.split('.').pop();
    var t = type(par);
    if ('object' == t || 'array' == t) return par[mainKey];
  } else {
    return obj[path];
  }
};

/**
 * Sets the given `path` to `val` in `obj`.
 *
 * @param {Object} target
 * @Param {String} key
 * @param {Object} value
 * @api public
 */

exports.set = function(obj, path, val){
  if (~path.indexOf('.')) {
    var par = parent(obj, path, true);
    var mainKey = path.split('.').pop();
    if (par && 'object' == type(par)) par[mainKey] = val;
  } else {
    obj[path] = val;
  }
};

/**
 * Gets the parent object for a given key (dot notation aware).
 *
 * - If a parent object doesn't exist, it's initialized.
 * - Array index lookup is supported
 *
 * @param {Object} target object
 * @param {String} key
 * @param {Boolean} true if it should initialize the path
 * @api public
 */

exports.parent = parent;

function parent(obj, key, init){
  if (~key.indexOf('.')) {
    var pieces = key.split('.');
    var ret = obj;

    for (var i = 0; i < pieces.length - 1; i++) {
      // if the key is a number string and parent is an array
      if (Number(pieces[i]) == pieces[i] && 'array' == type(ret)) {
        ret = ret[pieces[i]];
      } else if ('object' == type(ret)) {
        if (init && !ret.hasOwnProperty(pieces[i])) {
          ret[pieces[i]] = {};
        }
        if (ret) ret = ret[pieces[i]];
      }
    }

    return ret;
  } else {
    return obj;
  }
}

});
require.register("component-type/index.js", function(exports, require, module){
/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val && val.nodeType === 1) return 'element';

  return typeof val.valueOf();
};

});
require.register("component-clone/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var type;

try {
  type = require('type');
} catch(e){
  type = require('type-component');
}

/**
 * Module exports.
 */

module.exports = clone;

/**
 * Clones objects.
 *
 * @param {Mixed} any object
 * @api public
 */

function clone(obj){
  switch (type(obj)) {
    case 'object':
      var copy = {};
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          copy[key] = clone(obj[key]);
        }
      }
      return copy;

    case 'array':
      var copy = new Array(obj.length);
      for (var i = 0, l = obj.length; i < l; i++) {
        copy[i] = clone(obj[i]);
      }
      return copy;

    case 'regexp':
      // from millermedeiros/amd-utils - MIT
      var flags = '';
      flags += obj.multiline ? 'm' : '';
      flags += obj.global ? 'g' : '';
      flags += obj.ignoreCase ? 'i' : '';
      return new RegExp(obj.source, flags);

    case 'date':
      return new Date(obj.getTime());

    default: // string, number, boolean, …
      return obj;
  }
}

});
require.register("component-json/index.js", function(exports, require, module){

module.exports = 'undefined' == typeof JSON
  ? require('component-json-fallback')
  : JSON;

});
require.register("RedVentures-reduce/index.js", function(exports, require, module){

/**
 * Reduce `arr` with `fn`.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @param {Mixed} initial
 *
 * TODO: combatible error handling?
 */

module.exports = function(arr, fn, initial){  
  var idx = 0;
  var len = arr.length;
  var curr = arguments.length == 3
    ? initial
    : arr[idx++];

  while (idx < len) {
    curr = fn.call(null, curr, arr[idx], ++idx, arr);
  }
  
  return curr;
};
});
require.register("visionmedia-superagent/lib/client.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var reduce = require('reduce');

/**
 * Root reference for iframes.
 */

var root = 'undefined' == typeof window
  ? this
  : window;

/**
 * Noop.
 */

function noop(){};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * TODO: future proof, move to compoent land
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isHost(obj) {
  var str = {}.toString.call(obj);

  switch (str) {
    case '[object File]':
    case '[object Blob]':
    case '[object FormData]':
      return true;
    default:
      return false;
  }
}

/**
 * Determine XHR.
 */

function getXHR() {
  if (root.XMLHttpRequest
    && ('file:' != root.location.protocol || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  return false;
}

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return obj === Object(obj);
}

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    pairs.push(encodeURIComponent(key)
      + '=' + encodeURIComponent(obj[key]));
  }
  return pairs.join('&');
}

/**
 * Expose serialization method.
 */

 request.serializeObject = serialize;

 /**
  * Parse the given x-www-form-urlencoded `str`.
  *
  * @param {String} str
  * @return {Object}
  * @api private
  */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var parts;
  var pair;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    parts = pair.split('=');
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

 request.serialize = {
   'application/x-www-form-urlencoded': serialize,
   'application/json': JSON.stringify
 };

 /**
  * Default parsers.
  *
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  *
  */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function type(str){
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function params(str){
  return reduce(str.split(/ *; */), function(obj, str){
    var parts = str.split(/ *= */)
      , key = parts.shift()
      , val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(req, options) {
  options = options || {};
  this.req = req;
  this.xhr = this.req.xhr;
  this.text = this.xhr.responseText;
  this.setStatusProperties(this.xhr.status);
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.
  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
  this.setHeaderProperties(this.header);
  this.body = this.parseBody(this.text);
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

Response.prototype.get = function(field){
  return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

Response.prototype.setHeaderProperties = function(header){
  // content-type
  var ct = this.header['content-type'] || '';
  this.type = type(ct);

  // params
  var obj = params(ct);
  for (var key in obj) this[key] = obj[key];
};

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype.parseBody = function(str){
  var parse = request.parse[this.type];
  return parse
    ? parse(str)
    : null;
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

Response.prototype.setStatusProperties = function(status){
  var type = status / 100 | 0;

  // status / class
  this.status = status;
  this.statusType = type;

  // basics
  this.info = 1 == type;
  this.ok = 2 == type;
  this.clientError = 4 == type;
  this.serverError = 5 == type;
  this.error = (4 == type || 5 == type)
    ? this.toError()
    : false;

  // sugar
  this.accepted = 202 == status;
  this.noContent = 204 == status || 1223 == status;
  this.badRequest = 400 == status;
  this.unauthorized = 401 == status;
  this.notAcceptable = 406 == status;
  this.notFound = 404 == status;
  this.forbidden = 403 == status;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var req = this.req;
  var method = req.method;
  var path = req.path;

  var msg = 'cannot ' + method + ' ' + path + ' (' + this.status + ')';
  var err = new Error(msg);
  err.status = this.status;
  err.method = method;
  err.path = path;

  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  Emitter.call(this);
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {};
  this._header = {};
  this.on('end', function(){
    var res = new Response(self);
    if ('HEAD' == method) res.text = null;
    self.callback(null, res);
  });
}

/**
 * Inherit from `Emitter.prototype`.
 */

Request.prototype = new Emitter;
Request.prototype.constructor = Request;

/**
 * Set timeout to `ms`.
 *
 * @param {Number} ms
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.timeout = function(ms){
  this._timeout = ms;
  return this;
};

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.clearTimeout = function(){
  this._timeout = 0;
  clearTimeout(this._timer);
  return this;
};

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */

Request.prototype.abort = function(){
  if (this.aborted) return;
  this.aborted = true;
  this.xhr.abort();
  this.clearTimeout();
  this.emit('abort');
  return this;
};

/**
 * Set header `field` to `val`, or multiple fields with one object.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Get case-insensitive header `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api private
 */

Request.prototype.getHeader = function(field){
  return this._header[field.toLowerCase()];
};

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', request.types[type] || type);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} pass
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass){
  var str = btoa(user + ':' + pass);
  this.set('Authorization', 'Basic ' + str);
  return this;
};

/**
* Add query-string `val`.
*
* Examples:
*
*   request.get('/shoes')
*     .query('size=10')
*     .query({ color: 'blue' })
*
* @param {Object|String} val
* @return {Request} for chaining
* @api public
*/

Request.prototype.query = function(val){
  if ('string' != typeof val) val = serialize(val);
  this._query.push(val);
  return this;
};

/**
 * Send `data`, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // querystring
 *       request.get('/search')
 *         .end(callback)
 *
 *       // multiple data "writes"
 *       request.get('/search')
 *         .send({ search: 'query' })
 *         .send({ range: '1..5' })
 *         .send({ order: 'desc' })
 *         .end(callback)
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"})
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
  *      request.post('/user')
  *        .send('name=tobi')
  *        .send('species=ferret')
  *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.send = function(data){
  var obj = isObject(data);
  var type = this.getHeader('Content-Type');

  // merge
  if (obj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ('string' == typeof data) {
    if (!type) this.type('form');
    type = this.getHeader('Content-Type');
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!obj) return this;
  if (!type) this.type('json');
  return this;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  var fn = this._callback;
  if (2 == fn.length) return fn(err, res);
  if (err) return this.emit('error', err);
  fn(res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function(){
  var err = new Error('Origin is not allowed by Access-Control-Allow-Origin');
  err.crossDomain = true;
  this.callback(err);
};

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

Request.prototype.timeoutError = function(){
  var timeout = this._timeout;
  var err = new Error('timeout of ' + timeout + 'ms exceeded');
  err.timeout = timeout;
  this.callback(err);
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

Request.prototype.withCredentials = function(){
  this._withCredentials = true;
  return this;
};

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  var self = this;
  var xhr = this.xhr = getXHR();
  var query = this._query.join('&');
  var timeout = this._timeout;
  var data = this._data;

  // store callback
  this._callback = fn || noop;

  // CORS
  if (this._withCredentials) xhr.withCredentials = true;

  // state change
  xhr.onreadystatechange = function(){
    if (4 != xhr.readyState) return;
    if (0 == xhr.status) {
      if (self.aborted) return self.timeoutError();
      return self.crossDomainError();
    }
    self.emit('end');
  };

  // progress
  if (xhr.upload) {
    xhr.upload.onprogress = function(e){
      e.percent = e.loaded / e.total * 100;
      self.emit('progress', e);
    };
  }

  // timeout
  if (timeout && !this._timer) {
    this._timer = setTimeout(function(){
      self.abort();
    }, timeout);
  }

  // querystring
  if (query) {
    query = request.serializeObject(query);
    this.url += ~this.url.indexOf('?')
      ? '&' + query
      : '?' + query;
  }

  // initiate request
  xhr.open(this.method, this.url, true);

  // body
  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {
    // serialize stuff
    var serialize = request.serialize[this.getHeader('Content-Type')];
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;
    xhr.setRequestHeader(field, this.header[field]);
  }

  // send stuff
  xhr.send(data);
  return this;
};

/**
 * Expose `Request`.
 */

request.Request = Request;

/**
 * Issue a request:
 *
 * Examples:
 *
 *    request('GET', '/users').end(callback)
 *    request('/users').end(callback)
 *    request('/users', callback)
 *
 * @param {String} method
 * @param {String|Function} url or callback
 * @return {Request}
 * @api public
 */

function request(method, url) {
  // callback
  if ('function' == typeof url) {
    return new Request('GET', method).end(url);
  }

  // url first
  if (1 == arguments.length) {
    return new Request('GET', method);
  }

  return new Request(method, url);
}

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.get = function(url, data, fn){
  var req = request('GET', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.head = function(url, data, fn){
  var req = request('HEAD', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.del = function(url, fn){
  var req = request('DELETE', url);
  if (fn) req.end(fn);
  return req;
};

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.patch = function(url, data, fn){
  var req = request('PATCH', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * Expose `request`.
 */

module.exports = request;

});
require.register("bmcmahen-mydb-client/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var Document = require('./document');
var debug = require('debug')('mydb-client');
var type, json, clone, Socket, Emitter;

try {
  type = require('type');
  json = require('json');
  clone = require('clone');
  Socket = require('engine.io');
  Emitter = require('emitter');
} catch(e) {
  type = require('type-component');
  json = require('json-component');
  clone = require('clone-component');
  Socket = require('engine.io-client');
  Emitter = require('emitter-component');
}

/**
 * Module exports.
 */

module.exports = Manager;

/**
 * Make `Manager` an emitter itself.
 */

Emitter(Manager);

/**
 * Expose instances.
 */

Manager.instances = [];

/**
 * Noop.
 */

function noop(){}

/**
 * Manager constructor.
 *
 * Options:
 *   - `headers` custom headers for the resource request
 *
 * @param {String|Object} optional, url to connect socket to or eio opts
 * @parma {Object} options
 * @api public
 */

function Manager(url, opts){
  if (!(this instanceof Manager)) return new Manager(url, opts);

  opts = opts || {};
  this.agent = opts.agent || false;
  this.headers = opts.headers || {};
  this.connected = false;
  this.subscriptions = {};
  this.bufferedOps = {};
  this.cache = {};
  this.preloaded = {};

  if (opts.sid) {
    // assign socket id
    this.id = opts.sid;
  }

  this.open(url);

  // keep track of the instance
  Manager.instances.push(this);
  Manager.emit('instance', this);
}

/**
 * Mixes in `Emitter`.
 */

Emitter(Manager.prototype);

/**
 * Called upon `open`.
 *
 * @param {String} url
 * @api private
 */

Manager.prototype.open =
Manager.prototype.reconnect = function(url){
  if (!url && this.url) url = this.url;

  if (this.socket) {
    this.socket.onopen = noop;
    this.socket.onclose = noop;
    this.socket.onmessage = noop;
    this.socket.onerror = noop;
    this.socket.close();
  }

  if (this.connected) {
    this.onClose();
  }

  var opts = {
    agent: this.agent
  };
  if (this.id) {
    debug('connecting with existing mydb_id %s', this.id);
    opts.query = { mydb_id: this.id };
  }

  this.socket = new Socket(url, opts);
  this.socket.onopen = this.onOpen.bind(this);
  this.socket.onclose = this.onClose.bind(this);
  this.socket.onmessage = this.onMessage.bind(this);
  this.socket.onerror = this.onError.bind(this);
  this.url = url;
};

/**
 * Called upon upon open.
 *
 * @api private
 */

Manager.prototype.onOpen = function(){
  debug('mydb-client socket open');
  this.connected = true;
  this.socket.onerror = noop;
  this.emit('connect');
};

/**
 * Called upon upon close.
 *
 * @api private
 */

Manager.prototype.onClose = function(){
  debug('mydb-client socket closed');
  this.id = null;
  this.subscriptions = {};
  this.bufferedOps = {};
  this.cache = {};
  this.preloaded = {};
  this.connected = false;
  this.emit('disconnect');
};

/**
 * Called when a message is received.
 *
 * @api private
 */

Manager.prototype.onMessage = function(msg){
  var obj = json.parse(msg);
  var sid = obj.i;

  function doOp(sub){
    // next tick to make sure the op handler doesn't alter
    // the subscriptions array
    setTimeout(function(){
      sub.$op(obj.d);
    }, 0);
  }

  switch (obj.e) {
    case 'i': // socket id
      debug('got id "%s"', obj.i);
      this.id = obj.i;
      this.emit('id', obj.i);
      break;

    case 'o': // operation
      this.process(obj.d[0]);
      this.process(obj.d[1]);

      if (this.subscriptions[sid]) {
        debug('got operations for subscription "%s"', sid);
        for (var i = 0, l = this.subscriptions[sid].length; i < l; i++) {
          doOp(this.subscriptions[sid][i]);
        }
      } else {
        debug('buffering operation for subscription "%s"', sid);
      }
      break;

    case 'u': // unsubscribe confirmation
      this.emit('unsubscribe', sid);
      break;
  }
};

/**
 * Handles socket errors.
 *
 * @api private
 */

Manager.prototype.onError = function(err){
  debug('connect error');
  this.socket.onopen = noop;
  this.socket.onerror = noop;
  this.emit('connect_error', err);
};

/**
 * Converts bson-json into JavaScript counterparts.
 * Eg: `$oid` > string, `$date` > Date
 *
 * @param {Object} obj
 * @api public
 */

Manager.prototype.process = function(obj){
  if ('object' != type(obj)) return;
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      var val = obj[i];
      if ('object' == type(val)) {
        if (val.$oid) {
          // $oid => string
          obj[i] = val.$oid;
        } else if (val.$date) {
          // $date => Date(ts)
          obj[i] = new Date(val.$date);
        } else {
          // recurse
          this.process(obj[i]);
        }
      } else if ('array' == type(val)) {
        for (var ii = 0; ii < val.length; ii++) {
          this.process(val[ii]);
        }
      }
    }
  }
};

/**
 * Subscribes to the given sid.
 *
 * @param {Document} doc
 * @api private
 */

Manager.prototype.subscribe = function(doc){
  var sid = doc.$_sid;
  var url = doc.$_url;
  debug('subscribing "%s" ("%s")', sid, url);

  // cache url
  this.cache[url] = doc;

  // track subscription
  this.subscriptions[sid] = this.subscriptions[sid] || [];
  this.subscriptions[sid].push(doc);

  // check for buffered ops
  var buffer = this.bufferedOps[sid];
  if (buffer) {
    debug('emitting buffered ops for "%s"', sid);
    for (var i = 0, l = buffer.length; i < l; i++) {
      doc.$op(buffer[i]);
    }
    delete this.bufferedOps[sid];
  }
};

/**
 * Writes the given object to the socket.
 *
 * @api private
 */

Manager.prototype.write = function(obj){
  this.socket.send(json.stringify(obj));
};

/**
 * Destroys a subscription.
 *
 * @param {Document} doc
 * @param {String} subscription id
 * @api private
 */

Manager.prototype.unsubscribe = function(doc, id){
  var subs = this.subscriptions[id];

  // check that the subscription exists
  if (!subs || !subs.length) {
    debug('ignore destroy of inexisting subscription "%s"', id);
    return;
  }

  // we substract from the reference count
  subs.splice(subs.indexOf(doc), 1);

  // if no references are left we unsubscribe from the server
  if (!subs.length) {
    debug('destroying subscription for "%s"', id);

    // clear cache
    delete this.cache[doc.$_url];

    // clear subscription
    delete this.subscriptions[id];

    // notify server
    this.write({ e: 'unsubscribe', i: id });
    this.emit('destroy', id);
  } else {
    debug('maintaining subscription for "%s" - %d docs left', id, subs.length);
  }
};

/**
 * Preloads a document.
 *
 * Options:
 *  - {String} url
 *  - {String} subscription id
 *  - {Object} document
 *
 * @param {Object} options
 * @api public
 */

Manager.prototype.preload = function(opts){
  debug('preloaded %s (%s): %j', opts.url, opts.sid, opts.doc);
  this.preloaded[opts.url] = opts;
};

/**
 * Retrieves a document.
 *
 * @return {Document}
 * @api public
 */

Manager.prototype.get = function(url, fn){
  var doc = new Document(this);
  if (url) {
    debug('creating new document for url %s', url);
    doc.load(url, fn);
  } else {
    debug('creating new vanilla document');
  }
  return doc;
};

});
require.register("bmcmahen-mydb-client/document.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var request = require('superagent');
var query = require('mongo-query');
var debug = require('debug')('mydb-client:document');
var clone, dot, type, Emitter;

try {
  dot = require('dot');
  type = require('type');
  clone = require('clone');
  Emitter = require('emitter');
} catch(e){
  dot = require('dot-component');
  type = require('type-component');
  clone = require('clone-component');
  Emitter = require('emitter-component');
}

/**
 * Module exports.
 */

module.exports = Document;

/**
 * Document constructor.
 *
 * @param {Manager} originating manager.
 * @api public
 */

function Document(manager){
  this.$_manager = manager;
  this.$_readyState = 'unloaded';
}

/**
 * Mixes in `Emitter`.
 */

Emitter(Document.prototype);

/**
 * Returns the manager instance.
 *
 * @return {Manager} mng this doc was created from
 * @api public
 */

Document.prototype.$manager = function(){
  return this.$_manager;
};

/**
 * Returns the subscription id.
 *
 * @return {String} subscription id
 * @api public
 */

Document.prototype.$sid = function(){
  return this.$_sid;
};

/**
 * Returns the resource url.
 *
 * @return {String} url
 * @api public
 */

Document.prototype.$url = function(){
  return this.$_url;
};

/**
 * Returns the readyState.
 *
 * @param {String} readyState if setting
 * @return {Document|String} `this` if setting, or state string
 * @api public
 */

Document.prototype.$readyState = function(s){
  if (s) {
    if (s != this.$_readyState) {
      debug('setting state %s', s);
      this.$_readyState = s;
      this.emit('$state', s);
      this.emit('$state:' + s);
    }
    return this;
  } else {
    return this.$_readyState;
  }
};

/**
 * Override `on`.
 *
 * @param {String} key, or regular event
 * @param {String} optional, operation (eg: `set`, `$push`, `push`)
 * @param {Function} callback
 * @api public
 */

Document.prototype.on = function(key, op, fn){
  if ('string' == type(op)) {
    key = key + '$' + op.replace(/^\$/, '');
    op = fn;
  }
  return Emitter.prototype.on.call(this, key, op);
};

/**
 * Override `once`.
 *
 * @param {String} key, or regular event
 * @param {String} optional, operation (eg: `set`, `$push`, `push`)
 * @param {Function} callback
 * @api public
 */

Document.prototype.once = function(key, op, fn){
  if ('string' == type(op)) {
    key = key + '$' + op.replace(/^\$/, '');
    op = fn;
  }
  return Emitter.prototype.once.call(this, key, op);
};

/**
 * Override `off`.
 *
 * @param {String} key, or regular event
 * @param {String} optional, operation (eg: `set`, `$push`, `push`)
 * @param {Function} callback
 * @api public
 */

Document.prototype.off =
Document.prototype.removeListener = function(key, op, fn){
  if ('string' == type(op)) {
    key = key + '$' + op.replace(/^\$/, '');
    op = fn;
  }
  return Emitter.prototype.off.call(this, key, op);
};

/**
 * Override `listeners`.
 *
 * @param {String} key, or regular event
 * @param {String} optional, operation (eg: `set`, `$push`, `push`)
 * @api public
 */

Document.prototype.listeners = function(key, op){
  if (op) key = key + '$' + op.replace(/^\$/, '');
  return Emitter.prototype.listeners.call(this, key);
};

/**
 * Override `hasListeners`.
 *
 * @param {String} key, or regular event
 * @param {String} optional, operation (eg: `set`, `$push`, `push`)
 * @api public
 */

Document.prototype.hasListeners = function(key, op){
  if (op) key = key + '$' + op.replace(/^\$/, '');
  return Emitter.prototype.hasListeners.call(this, key);
};

/**
 * Payloads listener.
 *
 * @param {Object} doc payload
 * @api private
 */

Document.prototype.$onPayload = function(obj){
  debug('loading payload %j', obj);
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      this[i] = obj[i];
    }
  }

  // allow for buffered ops to be applied
  var self = this;
  setTimeout(function(){
    self.$readyState('loaded');
    self.emit('ready');
  }, 0);
};

/**
 * Operations listener.
 *
 * @param {Array} operation data `[query, op]`
 * @api private
 */

Document.prototype.$op = function(data){
  debug('got operation %j', data);
  var log = query(this, data[0], data[1], { strict: false });

  for (var i = 0; i < log.length; i++) {
    var ii;
    var obj = log[i];
    var val = obj.value;
    var key = obj.key;
    var type = obj.op;

    // express $addToSet as a $push
    if ('$addToSet' == type) {
      this.emit(key + '$push', val, obj);
    }

    // express $pop as a $pull
    if ('$pop' == type) {
      this.emit(key + '$pull', val, obj);
    }

    // express $rename as $unset + $set
    if ('$rename' == type) {
      this.emit(key + '$unset', null, obj);
      this.emit(val, this.get(val), obj);
      this.emit(val + '$set', this.get(val), obj);
    }

    // express $pushAll/$pullAll/$pull as multiple single ops
    if ('$pull' == type || /All/.test(type)) {
      for (ii = 0; ii < val.length; ii++) {
        this.emit(key + type.replace(/All/, ''), val[ii], obj);
      }
    } else {
      this.emit(key + type, val, obj);
    }

    var keys = key.split('.');
    for (ii = 0; ii < keys.length; ii++) {
      key = keys.slice(0, ii + 1).join('.');
      this.emit(key, this.get(key), obj);
    }
    this.emit('op', obj);
  }
};

/**
 * Called when the document is ready.
 *
 * @param {Function} callback
 * @return {Document} for chaining
 * @api public
 */

Document.prototype.ready = function(fn){
  // make sure we dont fire `fn` if one of the `ready`
  // handlers triggered an `unloading` state by wrapping
  // each callback
  var self = this;
  function done(){
    if ('loaded' == self.$readyState()) fn();
  }

  if ('loaded' == this.$readyState()) {
    debug('ready() fired - doc ready');
    setTimeout(done, 0);
  } else {
    debug('ready() defered until doc is loaded');
    this.once('ready', done);
  }
  return this;
};

/**
 * Connects to the given url.
 *
 * @return {Document} for chaining
 * @api public
 */

Document.prototype.load = function(url, fn){
  var manager = this.$manager();
  var socket = manager.socket;
  var self = this;

  if (manager.id) {
    load();
  } else {
    debug('will wait for manager socket id');
    this.$connectLoad = load;
    manager.once('id', load);
  }

  function load(){
    // cleanup
    delete self.$connectLoad;

    // perform cleanup
    if ('loading' == self.$readyState()) {
      self.destroy();
    }

    // mark ready state as loading the doc
    self.$readyState('loading');

    // decide whether to make a request
    var preloaded = manager.preloaded[url];
    if (preloaded) {
      debug('using preloaded document for url %s', url);
      self.$_url = url;
      self.$_sid = preloaded.sid;
      self.$onPayload(preloaded.doc);
      self.$readyState('loaded');
      manager.subscribe(self);
      delete manager.preloaded[url];
      if (fn) setTimeout(function(){ fn(null); }, 0);
      return;
    } else {
      debug('loading %s with headers %j', url, manager.headers);
    }

    // if in node, try to prefix the url if relative
    if ('undefined' != typeof process && '/' == url[0]) {
      url = (socket.secure ? 'https' : 'http') + '://' +
        socket.hostname + ':' + socket.port + url;
    }

    // keep track of current url
    self.$_url = url;
    url = url + (~url.indexOf('?') ? '' : '?') + '&mydb=1';
    url = url.replace('?&', '?');

    // get the subscription id over REST
    var xhr = request.get(url);
    if ('function' == typeof xhr.agent) {
      xhr.agent(this.agent);
    }
    xhr.set(manager.headers);

    // include socket id
    xhr.set('X-MyDB-SocketId', manager.id);

    // if we already have a document for this url
    // include the id to potentially leverage our cache
    var cached = manager.cache[self.$_url];
    if (cached) {
      xhr.set('X-MyDB-Id', cached.$id);
    }

    xhr.end(function(err, res){
      // XXX: remove this check when superagent gets `abort`
      if (xhr == self.$xhr) {
        if (err instanceof Error) {
          debug('socket error %s', err.stack);
          return fn && fn(err);
        } else if (!res) {
          // browser superagent doesn't support err, res
          res = err;
          err = null;
        }

        if (err) return fn && fn(err);

        if (res.ok) {
          if (fn) self.ready(function(){ fn(null); });
          self.$onresponse(res);
        } else {
          debug('subscription error %d', res.status);
          if (fn) {
            err = new Error('Subscription error: ' + res.status);
            err.url = url;
            err.status = res.status;
            fn(err);
          }
        }
      } else {
        debug('ignoring outdated resource subscription %s',
          res ? res.text : (err ? err.stack : ''));
      }
    });

    self.$xhr = xhr;
  }

  return this;
};

/**
 * Subscribe to a given `sid`.
 *
 * @param {Response} response
 * @api public
 */

Document.prototype.$onresponse = function(res){
  var sid = res.header['x-mydb-id'];
  var mng = this.$manager();

  debug('got subscription id "%s"', sid);

  this.$_sid = sid;

  if (200 == res.status) {
    debug('got payload with response');

    if (mng.subscriptions[sid]) {
      debug('applying cached payload');
      this.$onPayload(mng.subscriptions[sid][0].$clone());
    } else {
      debug('applying response payload');
      this.$onPayload(res.body);
    }
  } else if (304 == res.status) {
    debug('got 304 - payload already cached');
    this.$onPayload(mng.cache[this.$_url].$clone());
  } else {
    throw new Error('Unhandled status %d', res.status);
  }

  mng.subscribe(this);
};

/**
 * Gets the given key.
 *
 * @param {String} key
 * @param {Function} optional, if supplied wraps with `ready`
 * @return {Document} for chaining
 * @api public
 */

Document.prototype.get = function(key, fn){
  var obj = this;

  function get(){
    return dot.get(obj, key);
  }

  if (fn) {
    this.ready(function(){
      fn(get());
    });
  } else {
    return get();
  }

  return this;
};

/**
 * Calls with the initial value + subsequent ones.
 *
 * @param {String} key
 * @param {Function} callback
 * @return {Document} for chaining
 * @api public
 */

Document.prototype.upon = function(key, fn){
  this.get(key, function(v){
    fn(v, true);
  });
  this.on(key, function(v){
    fn(v, false);
  });
  return this;
};

/**
 * Loops through the given key.
 *
 * @param {String} key
 * @param {Function} callback
 * @return {Document} for chaining
 * @api public
 */

Document.prototype.each = function(key, fn){
  var self = this;
  this.get(key, function(v){
    if ('array' == type(v)) v.forEach(fn);
    self.on(key, 'push', fn);
  });
  return this;
};

/**
 * Cleans up event listeners and data.
 *
 * @api private
 */

Document.prototype.$cleanup = function(){
  debug('cleaning up');

  if (this.$xhr) {
    if ('undefined' != typeof window) {
      try {
        debug('aborting xhr');
        this.$xhr.abort();
      } catch(e){}
    }
    this.$xhr = null;
  }

  this.$_sid = null;
  this.$_url = null;

  // cleanup existing state
  for (var i in this) {
    if ('_callbacks' == i) continue;
    if ('$' == i.charAt(0)) continue;
    if (!this.hasOwnProperty(i)) continue;
    if ('function' == typeof this[i]) continue;
    delete this[i];
  }
};

/**
 * Clones a document.
 *
 * @return {Object} cloned doc
 * @api private
 */

Document.prototype.$clone = function(){
  var obj = {};
  for (var i in this) {
    if ('_callbacks' == i) continue;
    if ('$' == i.charAt(0)) continue;
    if (!this.hasOwnProperty(i)) continue;
    if ('function' == typeof this[i]) continue;
    obj[i] = this[i];
  }
  return clone(obj);
};

/**
 * Destroys the subscription (if any)
 *
 * @param {Function} optional, callback
 * @return {Document} for chaining
 * @api public
 */

Document.prototype.destroy = function(fn){
  var sid = this.$sid();

  // clear callbacks prior to destroy
  this._callbacks = {};

  // clean up
  this.$cleanup();

  // remove payload / ops event listeners
  var manager = this.$manager();
  manager.off('op', this.$onOp);

  // clean up pending `load`
  if (this.$connectLoad) {
    manager.off('id', this.$connectLoad);
    delete this.$connectLoad;
  }

  // get current ready state
  var state = this.$readyState();

  function onunsubscribe(){
    if ('unloading' == self.$readyState()) {
      self.$readyState('unloaded');
    }
    if (fn) fn(null);
  }

  // unsubscribe if we have a sid
  if (sid) {
    manager.unsubscribe(this, sid);
 
    // get sid before cleanup
    this.$_unloading = sid;

    // mark ready state
    this.$readyState('unloading');

    // unsubscribe
    var self = this;
    if (manager.connected) {
      manager.on('unsubscribe', function unsubscribe(s){
        if (s == self.$_unloading) {
          debug('unsubscription "%s" complete', s);
          manager.off('unsubscribe', unsubscribe);
          onunsubscribe();
        }
      });
    } else {
      setTimeout(onunsubscribe, 0);
    }
  } else {
    if (state == 'unloaded') {
      debug('destroying in unloaded state');
      if (fn) {
        setTimeout(function(){
          fn(null);
        }, 0);
      }
    }
  }

  return this;
};

});
require.register("component-link-delegate/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var delegate = require('delegate');
var url = require('url');

/**
 * Handle link delegation on `el` or the document,
 * and invoke `fn(e)` when clickable.
 *
 * @param {Element|Function} el or fn
 * @param {Function} [fn]
 * @api public
 */

module.exports = function(el, fn){
  // default to document
  if ('function' == typeof el) {
    fn = el;
    el = document;
  }

  delegate.bind(el, 'a', 'click', function(e){
    if (clickable(e)) fn(e);
  });
};

/**
 * Check if `e` is clickable.
 */

function clickable(e) {
  if (1 != which(e)) return;
  if (e.metaKey || e.ctrlKey || e.shiftKey) return;
  if (e.defaultPrevented) return;

  // target
  var el = e.target;

  // check target
  if (el.target) return;

  // x-origin
  if (url.isCrossDomain(el.href)) return;

  return true;
}

/**
 * Event button.
 */

function which(e) {
  e = e || window.event;
  return null == e.which
    ? e.button
    : e.which;
}

});
require.register("component-path-to-regexp/index.js", function(exports, require, module){
/**
 * Expose `pathtoRegexp`.
 */

module.exports = pathtoRegexp;

/**
 * Normalize the given path string,
 * returning a regular expression.
 *
 * An empty array should be passed,
 * which will contain the placeholder
 * key names. For example "/user/:id" will
 * then contain ["id"].
 *
 * @param  {String|RegExp|Array} path
 * @param  {Array} keys
 * @param  {Object} options
 * @return {RegExp}
 * @api private
 */

function pathtoRegexp(path, keys, options) {
  options = options || {};
  var sensitive = options.sensitive;
  var strict = options.strict;
  keys = keys || [];

  if (path instanceof RegExp) return path;
  if (path instanceof Array) path = '(' + path.join('|') + ')';

  path = path
    .concat(strict ? '' : '/?')
    .replace(/\/\(/g, '(?:/')
    .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?(\*)?/g, function(_, slash, format, key, capture, optional, star){
      keys.push({ name: key, optional: !! optional });
      slash = slash || '';
      return ''
        + (optional ? '' : slash)
        + '(?:'
        + (optional ? slash : '')
        + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')'
        + (optional || '')
        + (star ? '(/*)?' : '');
    })
    .replace(/([\/.])/g, '\\$1')
    .replace(/\*/g, '(.*)');

  return new RegExp('^' + path + '$', sensitive ? '' : 'i');
};

});
require.register("component-querystring/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var trim = require('trim');

/**
 * Parse the given query `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api public
 */

exports.parse = function(str){
  if ('string' != typeof str) return {};

  str = trim(str);
  if ('' == str) return {};
  if ('?' == str.charAt(0)) str = str.slice(1);

  var obj = {};
  var pairs = str.split('&');
  for (var i = 0; i < pairs.length; i++) {
    var parts = pairs[i].split('=');
    obj[parts[0]] = null == parts[1]
      ? ''
      : decodeURIComponent(parts[1]);
  }

  return obj;
};

/**
 * Stringify the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api public
 */

exports.stringify = function(obj){
  if (!obj) return '';
  var pairs = [];
  for (var key in obj) {
    pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
  }
  return pairs.join('&');
};

});
require.register("component-url/index.js", function(exports, require, module){

/**
 * Parse the given `url`.
 *
 * @param {String} str
 * @return {Object}
 * @api public
 */

exports.parse = function(url){
  var a = document.createElement('a');
  a.href = url;
  return {
    href: a.href,
    host: a.host || location.host,
    port: ('0' === a.port || '' === a.port) ? port(a.protocol) : a.port,
    hash: a.hash,
    hostname: a.hostname || location.hostname,
    pathname: a.pathname.charAt(0) != '/' ? '/' + a.pathname : a.pathname,
    protocol: !a.protocol || ':' == a.protocol ? location.protocol : a.protocol,
    search: a.search,
    query: a.search.slice(1)
  };
};

/**
 * Check if `url` is absolute.
 *
 * @param {String} url
 * @return {Boolean}
 * @api public
 */

exports.isAbsolute = function(url){
  return 0 == url.indexOf('//') || !!~url.indexOf('://');
};

/**
 * Check if `url` is relative.
 *
 * @param {String} url
 * @return {Boolean}
 * @api public
 */

exports.isRelative = function(url){
  return !exports.isAbsolute(url);
};

/**
 * Check if `url` is cross domain.
 *
 * @param {String} url
 * @return {Boolean}
 * @api public
 */

exports.isCrossDomain = function(url){
  url = exports.parse(url);
  return url.hostname !== location.hostname
    || url.port !== location.port
    || url.protocol !== location.protocol;
};

/**
 * Return default port for `protocol`.
 *
 * @param  {String} protocol
 * @return {String}
 * @api private
 */
function port (protocol){
  switch (protocol) {
    case 'http:':
      return 80;
    case 'https:':
      return 443;
    default:
      return location.port;
  }
}

});
require.register("yields-stop/index.js", function(exports, require, module){

/**
 * stop propagation on the given `e`.
 * 
 * examples:
 * 
 *      anchor.onclick = require('stop');
 *      anchor.onclick = function(e){
 *        if (!some) return require('stop')(e);
 *      };
 * 
 * 
 * @param {Event} e
 */

module.exports = function(e){
  e = e || window.event;
  return e.stopPropagation
    ? e.stopPropagation()
    : e.cancelBubble = true;
};

});
require.register("yields-prevent/index.js", function(exports, require, module){

/**
 * prevent default on the given `e`.
 * 
 * examples:
 * 
 *      anchor.onclick = prevent;
 *      anchor.onclick = function(e){
 *        if (something) return prevent(e);
 *      };
 * 
 * @param {Event} e
 */

module.exports = function(e){
  e = e || window.event
  return e.preventDefault
    ? e.preventDefault()
    : e.returnValue = false;
};

});
require.register("bmcmahen-transit/index.js", function(exports, require, module){
module.exports = require('./lib');
});
require.register("bmcmahen-transit/lib/index.js", function(exports, require, module){
// Dependencies
var toRegexp = require('path-to-regexp');
var Emitter = require('emitter');
var link = require('link-delegate');
var prevent = require('prevent');
var stop = require('stop');
var urlUtil = require('url');

// Locals
var Context = require('./context');
var convert = require('./conversion');
var Route = require('./route');


module.exports = transit;


/**
 * transit
 * @param  {String}   url 
 * @param  {Function} fn  
 * @return {transit}       
 */

function transit(url, fn){
  if (!url) throw new TypeError('url required');

  // definition of a new route with given functions
  if ('function' == typeof fn) {
    var fns = Array.prototype.slice.call(arguments);
    fns.shift();
    transit.define(url, fns);
    return transit;
  }

  // otherwise goes to a route
  transit.go(url);
  return transit;
}


Emitter(transit);

transit.routes = [];

transit.running = false;

transit.previous = null;

transit.context = function(path){
  var previous = transit._context || {};
  var context = transit._context = new Context(path);
  context.previous = previous;
  return context;
}

/**
 * Goes to a route.
 * Equivalent to `push` + `exec`.
 *
 * @param {String} url
 * @api public
 */

transit.go = function go(url){
  transit.push(url);
  transit.exec(url);
};


/**
 * Defines a route.
 *
 * @param {String} url
 * @param {Function} callback
 * @api public
 */

transit.define = function define(url, fns){
  var route = new Route(url);
  route.in = fns;
  transit.currentHandler = route;
  transit.routes.push(route);
};


/**
 * Define handlers for when we leave a route.
 */

transit.out = function out(){
  var fns = Array.prototype.slice.call(arguments);
  if (!transit.currentHandler) return;
  transit.currentHandler.out = fns;
};


/**
 * Starts the router and invokes the
 * current url. 
 */

transit.start = function start(){
  if (transit.running) return;
  transit.running = true;
  transit.api.listen(transit.check);
  var isHash = false;
  var url = convert.normalizedRoute();
  if (transit.lookup(url)){
    // fix this - logic should be agnostic to api
    // also, we dont need to do this if at our root url
    hash = transit.api.convert();
    if (hash) transit.invoke();
  }
}

/**
 * Checks to see if the route is the same as our current
 * route. Used primarily to filter hashchange events
 * so that they dont fire on a push.
 */

transit.check = function check(){
  var current = transit.api.get();
  if (current === transit.fragment) return false;
  transit.invoke();
}

/**
 *
 * Invokes the router.
 *
 * @api public
 */

transit.invoke = function invoke(){
  transit.fragment = transit.api.get();
  transit.exec(transit.fragment);
};


/**
 * Ultra simple middleware
 * @param  {Context} ctx 
 * @param  {Array} fns 
 */

function middleware(ctx, fns){
  var i = 0;
  function next(){
    var fn = fns[i++];
    if (!fn) return;
    fn(ctx, next);
  }
  next();
}

/**
 * Executes a route.
 *
 * @param {String} url
 * @api public
 */


transit.exec = function exec(url){  
  var match = transit.lookup(url);

  var out = transit.previous && transit.previous.out;
  if (out) {
    transit._context._currentPath = url;
    middleware(transit._context, out);
  }
  
  transit.emit('change', url);

  if (!match) return;
  var ctx = transit.context(url);
  ctx.params = match.params;
  middleware(ctx, match.in);
  transit.previous = match;
  transit.url = url;
  transit.emit('exec', url);
};

/**
 * Looks up a handler for the given `url`.
 *
 * @param {String} url
 * @return {Number} route index
 * @api private
 */

transit.lookup = function lookup(url){
  var routes = transit.routes;
  for (var i = 0; i < routes.length; i++){
    if (routes[i].match(url)) return routes[i];
  }
}

/**
 * Push state.
 */

transit.push = function push(url){
  if (url == transit.api.get()) return;
  transit.fragment = url;
  transit.api.push(url);
  transit.emit('push', url);
};

/**
 * Replace state.
 */

transit.replace = function replace(url){
  transit.api.replace(url);
  transit.emit('replace', url);
};

/**
 * Check if a given 'href' is routable under 'path'.
 * Credits: https://github.com/ianstormtaylor/router
 * @param  {String} href 
 * @param  {String} path 
 * @return {Boolean}  
 */

function routable(href, path){
  if (!path) return true;
  var parsed = urlUtil.parse(href);
  if (parsed.pathname.indexOf(path) === 0) return true;
  return false;
};


/**
 * Listen for link clicks to a specified path,
 * and trigger router events. 
 * Credits: https://github.com/ianstormtaylor/router
 * @param  {String} path 
 */

transit.listen = function listen(path){
  link(function(e){
    var el = e.delegateTarget || e.target;
    var href = el.href;
    if (!el.hasAttribute('href') 
      || !routable(href, path)
      || !transit.lookup(urlUtil.parse(href).pathname)) return;
    var parsed = urlUtil.parse(href);
    transit.go(parsed.pathname);
    prevent(e);
    stop(e);
  });
};

/**
 * History Adapter (defaults to HTML5, with fallback to 
 * Hash). IE < 8 is not supported.
 *
 * @api private
 */

var hasPushState = !!(window.history && window.history.pushState);
transit.api = hasPushState ? require('./html5') : require('./hash');
});
require.register("bmcmahen-transit/lib/html5.js", function(exports, require, module){
var hash = require('./hash');

/**
 * Looks up the current pathname.
 * @param {String} current path
 * @api private
 */

exports.get = function(){
  return window.location.pathname;
};


/**
 * pushState.
 * @param {String} url
 */

exports.push = function push(url){
  history.pushState(null, null, url);
};

/**
 * replaceState
 * @param {String} url
 */

exports.replace = function replace(url){
  history.replaceState(null, null, url);
};

/**
 * Listen Fn for when popstate changes
 * @param  {Function} fn 
 */

exports.listen = function listen(fn){
  window.addEventListener('popstate', fn, false);
};

/**
 * Unbind our Listen Fn
 * @param  {Function} fn
 */

exports.stop = function(fn){
  window.removeEventListener('popstate', fn, false);
};


/**
 * If we have a hash Url, but we are working with a
 * pushState enabled browser, then convert the hash to the
 * equivalent pushState. Used on startup.
 * @return {Boolean} 
 */

exports.convert = function(){
  if (window.location.hash){
    exports.replace(hash.get() + window.location.search);
  }
  return false;
};

});
require.register("bmcmahen-transit/lib/hash.js", function(exports, require, module){
var convert = require('./conversion');

/**
 * Looks up the current pathname, normalizing
 * to standard URL. 
 * @return {String}
 */

exports.get = function(){
  return convert.hashToUrl(window.location.href);
};

/**
 * pushState
 * @param  {String} url 
 */

exports.push = function(url){
  url = convert.urlToHash(url);
  url = convert.removeSlash(url);
  window.location.hash = url;
};


/**
 * replaceState
 * @param  {String} url 
 */

exports.replace = function(url){
  var href = window.location.href.replace(/(javascript:|#).*$/, '');
  url = convert.urlToHash(url);
  window.location.replace(href + convert.removeSlash(url));
};

/**
 * Listen Fn for when our hash changes
 * Our hash-change API needs to be different, because it executes our
 * function any time that it changes... including when we set it!
 * See how backbone manages this.
 * @param  {Function} fn 
 */

exports.listen = function(fn){
  window.addEventListener('hashchange', fn, false);
};

/**
 * Unbind our Listen Fn
 * @param  {Function} fn 
 */

exports.stop = function(fn){
  window.removeEventListener('hashchange', fn, false);
};

/**
 * If we have a pushState URL but we are using hash instead,
 * then convert the pushState URL to the equivalent hashUrl.
 * @return {Boolean} isHash
 */

exports.convert = function(){
  if (window.location.hash) return true;
  var path = window.location.pathname;
  exports.replace(path);
  return true;
};
});
require.register("bmcmahen-transit/lib/conversion.js", function(exports, require, module){
var firstSlash = /^\//;
var afterHash = /\#(.*)/;
var firstHash = /\#/; 
var urlUtil = require('url');

/**
 * Convert a hash based URL to a pushState relative path
 * Eg. '/#bacon/ater' to '/bacon/ater'
 * Eg. 'http://localhost:3000/#bacon/ater' -> '/bacon/ater'
 * @param {String} url
 */

exports.hashToUrl = function(url){
  var match = url.match(afterHash);
  if (!match) return '/';
  return '/' + (match[1] || '');
};

// this needs to be way more sophisticated
exports.isRoot = function(path){
  path = path.replace(firstHash, '');
  if (path === '/') return true;
};

/**
 * Convert a URL to hash-based URL
 * Eg. '/bacon/ater' -> '/#bacon/ater';
 * @param {String} url 
 */

exports.urlToHash = function(url){
   return '/' + url.replace(firstSlash, '#');
};


/**
 * Return the normalized route
 * @return {String} '/foo/bar'
 */

exports.normalizedRoute = function(){
  return window.location.hash
    ? exports.hashToUrl(window.location.href)
    : window.location.pathname;
};

/**
 * Remove the first slash of a string
 * Eg. '/#farmer/john' -> '#farmer/john'
 * @param  {String} url 
 * @return {String}     
 */

exports.removeSlash = function(url){
  return url.replace(firstSlash, '');
};

});
require.register("bmcmahen-transit/lib/context.js", function(exports, require, module){
var querystring = require('querystring');
var url = require('url');

module.exports = Context;

/**
 * Initialize a new `Context`.
 * Credit: https://github.com/ianstormtaylor/router/blob/master/lib/context.js
 * @param {String} path 
 */

function Context(path){
  this.path = path || '';
  this.params = [];
  this.url = url.parse(window.location.href);
  this.query = this.path.indexOf('?')
    ? querystring.parse(this.path.split('?')[1])
    : {};
}
});
require.register("bmcmahen-transit/lib/route.js", function(exports, require, module){
var toRegexp = require('path-to-regexp');

function Route(path){
  this.path = path;
  this.regexp = toRegexp(path, this.keys = []);
  this.in = [];
  this.out = [];
  this.params = [];
}

module.exports = Route;

Route.prototype.match = function(path){
  var params = this.params = [];
  var keys = this.keys;
  var qsIndex = path.indexOf('?');
  var pathname = ~qsIndex ? path.slice(0, qsIndex) : path;
  var m = this.regexp.exec(decodeURIComponent(pathname));

  if (!m) return false;

  for (var i = 1, len = m.length; i < len; i++){
    var key = keys[i - 1];
    var val = 'string' == typeof m[i]
      ? decodeURIComponent(m[i])
      : m[i];

    if (key) {
      params[key.name] = undefined !== params[key.name]
        ? params[key.name]
        : val;
    } else {
      params.push(val);
    }
    // pass in non-keyed params too. figure out the best way
    // to do this.
  }

  return true;
}
});

require.register("yields-k-sequence/index.js", function(exports, require, module){

/**
 * dependencies
 */

var keycode = require('keycode');

/**
 * Export `sequence`
 */

module.exports = sequence;

/**
 * Create sequence fn with `keys`.
 * optional `ms` which defaults
 * to `500ms` and `fn`.
 *
 * Example:
 *
 *      seq = sequence('a b c', fn);
 *      el.addEventListener('keydown', seq);
 *
 * @param {String} keys
 * @param {Number} ms
 * @param {Function} fn
 * @return {Function}
 * @api public
 */

function sequence(keys, ms, fn){
  var codes = keys.split(/ +/).map(keycode)
    , clen = codes.length
    , seq = []
    , i = 0
    , prev;

  if (2 == arguments.length) {
    fn = ms;
    ms = 500;
  }

  return function(e){
    var code = codes[i++];
    if (42 != code && code != e.which) return reset();
    if (prev && new Date - prev > ms) return reset();
    var len = seq.push(e.which);
    prev = new Date;
    if (len != clen) return;
    reset();
    fn(e);
  };

  function reset(){
    prev = null;
    seq = [];
    i = 0;
  }
};

});
require.register("yields-keycode/index.js", function(exports, require, module){

/**
 * map
 */

var map = {
    backspace: 8
  , command: 91
  , tab: 9
  , clear: 12
  , enter: 13
  , shift: 16
  , ctrl: 17
  , alt: 18
  , capslock: 20
  , escape: 27
  , esc: 27
  , space: 32
  , left: 37
  , up: 38
  , right: 39
  , down: 40
  , del: 46
  , comma: 188
  , ',': 188
  , '.': 190
  , '/': 191
  , '`': 192
  , '-': 189
  , '=': 187
  , ';': 186
  , '[': 219
  , '\\': 220
  , ']': 221
  , '\'': 222
};

/**
 * find a keycode.
 *
 * @param {String} name
 * @return {Number}
 */

module.exports = function(name){
  return map[name] || name.toUpperCase().charCodeAt(0);
};

});
require.register("component-bind/index.js", function(exports, require, module){
/**
 * Slice reference.
 */

var slice = [].slice;

/**
 * Bind `obj` to `fn`.
 *
 * @param {Object} obj
 * @param {Function|String} fn or string
 * @return {Function}
 * @api public
 */

module.exports = function(obj, fn){
  if ('string' == typeof fn) fn = obj[fn];
  if ('function' != typeof fn) throw new Error('bind() requires a function');
  var args = slice.call(arguments, 2);
  return function(){
    return fn.apply(obj, args.concat(slice.call(arguments)));
  }
};

});
require.register("component-os/index.js", function(exports, require, module){


module.exports = os();

function os() {
  var ua = navigator.userAgent;
  if (/mac/i.test(ua)) return 'mac';
  if (/win/i.test(ua)) return 'windows';
  if (/linux/i.test(ua)) return 'linux';
}

});
require.register("yields-k/lib/index.js", function(exports, require, module){

/**
 * dependencies.
 */

var event = require('event')
  , proto = require('./proto')
  , bind = require('bind');

/**
 * Create a new dispatcher with `el`.
 *
 * example:
 *
 *      var k = require('k')(window);
 *      k('shift + tab', function(){});
 *
 * @param {Element} el
 * @return {Function}
 * @api public
 */

module.exports = function(el){
  function k(e, fn){ k.handle(e, fn) };
  k._handle = bind(k, proto.handle);
  k._clear = bind(k, proto.clear);
  event.bind(el, 'keydown', k._handle, false);
  event.bind(el, 'keyup', k._handle, false);
  event.bind(el, 'keyup', k._clear, false);
  event.bind(el, 'focus', k._clear, false);
  for (var p in proto) k[p] = proto[p];
  k.listeners = [];
  k.el = el;
  return k;
};

});
require.register("yields-k/lib/proto.js", function(exports, require, module){

/**
 * dependencies
 */

var sequence = require('k-sequence')
  , keycode = require('keycode')
  , event = require('event')
  , os = require('os');

/**
 * modifiers.
 */

var modifiers = {
  91: 'command',
  93: 'command',
  16: 'shift',
  17: 'ctrl',
  18: 'alt'
};

/**
 * Super key.
 */

exports.super = 'mac' == os
  ? 'command'
  : 'ctrl';

/**
 * Handle the given `KeyboardEvent` or bind
 * a new `keys` handler.
 *
 * @param {String|KeyboardEvent} e
 * @param {Function} fn
 * @api private
 */

exports.handle = function(e, fn){
  var ignore = this.ignore;
  var event = e.type;
  var code = e.which;

  // bind
  if (fn) return this.bind(e, fn);

  // modifiers
  var mod = modifiers[code];
  if ('keydown' == event && mod) {
    this.super = exports.super == mod;
    this[mod] = true;
    this.modifiers = true;
    return;
  }

  // ignore
  if (ignore && ignore(e)) return;

  // listeners
  var all = this.listeners;

  // match
  for (var i = 0; i < all.length; ++i) {
    var invoke = true;
    var obj = all[i];
    var seq = obj.seq;
    var mods = obj.mods;
    var fn = seq || obj.fn;

    if (!seq && code != obj.code) continue;
    if (event != obj.event) continue;

    for (var j = 0; j < mods.length; ++j) {
      if (!this[mods[j]]) {
        invoke = null;
        break;
      }
    }

    invoke && fn(e);
  }
};

/**
 * Destroy this `k` dispatcher instance.
 *
 * @api public
 */

exports.destroy = function(){
  event.unbind(this.el, 'keydown', this._handle);
  event.unbind(this.el, 'keyup', this._handle);
  event.unbind(this.el, 'keyup', this._clear);
  event.unbind(this.el, 'focus', this._clear);
  this.listeners = [];
};

/**
 * Unbind the given `keys` with optional `fn`.
 *
 * example:
 *
 *      k.unbind('enter, tab', myListener); // unbind `myListener` from `enter, tab` keys
 *      k.unbind('enter, tab'); // unbind all `enter, tab` listeners
 *      k.unbind(); // unbind all listeners
 *
 * @param {String} keys
 * @param {Function} fn
 * @return {k}
 * @api public
 */

exports.unbind = function(keys, fn){
  var fns = this.listeners
    , len = fns.length
    , all;

  // unbind all
  if (0 == arguments.length) {
    this.listeners = [];
    return this;
  }

  // parse
  all = parseKeys(keys);

  // unbind
  for (var i = 0; i < all.length; ++i) {
    for (var j = 0, obj; j < len; ++j) {
      obj = fns[j];
      if (!obj) continue;
      if (fn && obj.fn != fn) continue;
      if (obj.key != all[i].key) continue;
      if (!matches(obj, all[i])) continue;
      fns.splice(j--, 1);
    }
  }

  return this;
};

/**
 * Bind the given `keys` to `fn` with optional `event`
 *
 * example:
 *
 *      k.bind('shift + tab, ctrl + a', function(e){});
 *
 * @param {String} event
 * @param {String} keys
 * @param {Function} fn
 * @return {k}
 * @api public
 */

exports.bind = function(event, keys, fn){
  var fns = this.listeners
    , len
    , all;

  if (2 == arguments.length) {
    fn = keys;
    keys = event;
    event = 'keydown';
  }

  all = parseKeys(keys);
  len = all.length;

  for (var i = 0; i < len; ++i) {
    var obj = all[i];
    obj.seq = obj.seq && sequence(obj.key, fn);
    obj.event = event;
    obj.fn = fn;
    fns.push(obj);
  }

  return this;
};

/**
 * Bind keyup with `keys` and `fn`.
 *
 * @param {String} keys
 * @param {Function} fn
 * @return {k}
 * @api public
 */

exports.up = function(keys, fn){
  return this.bind('keyup', keys, fn);
};

/**
 * Bind keydown with `keys` and `fn`.
 *
 * @param {String} keys
 * @param {Function} fn
 * @return {k}
 * @api public
 */

exports.down = function(keys, fn){
  return this.bind('keydown', keys, fn);
};

/**
 * Clear all modifiers on `keyup`.
 *
 * @api private
 */

exports.clear = function(e){
  var code = e.keyCode || e.which;
  if (!(code in modifiers)) return;
  this[modifiers[code]] = null;
  this.modifiers = this.command
    || this.shift
    || this.ctrl
    || this.alt;
};

/**
 * Ignore all input elements by default.
 *
 * @param {Event} e
 * @return {Boolean}
 * @api private
 */

exports.ignore = function(e){
  var el = e.target || e.srcElement;
  var name = el.tagName.toLowerCase();
  return 'textarea' == name
    || 'select' == name
    || 'input' == name;
};

/**
 * Parse the given `keys`.
 *
 * @param {String} keys
 * @return {Array}
 * @api private
 */

function parseKeys(keys){
  keys = keys.replace('super', exports.super);

  var all = ',' != keys
    ? keys.split(/ *, */)
    : [','];

  var ret = [];
  for (var i = 0; i < all.length; ++i) {
    if ('' == all[i]) continue;
    var mods = all[i].split(/ *\+ */);
    var key = mods.pop() || ',';

    ret.push({
      seq: !!~ key.indexOf(' '),
      code: keycode(key),
      mods: mods,
      key: key
    });
  }

  return ret;
}

/**
 * Check if the given `a` matches `b`.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Boolean}
 * @api private
 */

function matches(a, b){
  return 0 == b.mods.length || eql(a, b);
}

/**
 * Shallow eql util.
 *
 * TODO: move to yields/eql
 *
 * @param {Array} a
 * @param {Array} b
 * @return {Boolean}
 * @api private
 */

function eql(a, b){
  a = a.mods.sort().toString();
  b = b.mods.sort().toString();
  return a == b;
}

});
require.register("cristiandouce-tags-free/index.js", function(exports, require, module){
/**
 * Tags free regular expression
 */
var re = /<(.*?)>/g;

module.exports = function (html) {
  if('string' !== typeof html) return html;
  return html.replace(re, '');
}
});
require.register("component-value/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var typeOf = require('type');

/**
 * Set or get `el`'s' value.
 *
 * @param {Element} el
 * @param {Mixed} val
 * @return {Mixed}
 * @api public
 */

module.exports = function(el, val){
  if (2 == arguments.length) return set(el, val);
  return get(el);
};

/**
 * Get `el`'s value.
 */

function get(el) {
  switch (type(el)) {
    case 'checkbox':
    case 'radio':
      if (el.checked) {
        var attr = el.getAttribute('value');
        return null == attr ? true : attr;
      } else {
        return false;
      }
    case 'radiogroup':
      for (var i = 0, radio; radio = el[i]; i++) {
        if (radio.checked) return radio.value;
      }
      break;
    case 'select':
      for (var i = 0, option; option = el.options[i]; i++) {
        if (option.selected) return option.value;
      }
      break;
    default:
      return el.value;
  }
}

/**
 * Set `el`'s value.
 */

function set(el, val) {
  switch (type(el)) {
    case 'checkbox':
    case 'radio':
      if (val) {
        el.checked = true;
      } else {
        el.checked = false;
      }
      break;
    case 'radiogroup':
      for (var i = 0, radio; radio = el[i]; i++) {
        radio.checked = radio.value === val;
      }
      break;
    case 'select':
      for (var i = 0, option; option = el.options[i]; i++) {
        option.selected = option.value === val;
      }
      break;
    default:
      el.value = val;
  }
}

/**
 * Element type.
 */

function type(el) {
  var group = 'array' == typeOf(el) || 'object' == typeOf(el);
  if (group) el = el[0];
  var name = el.nodeName.toLowerCase();
  var type = el.getAttribute('type');

  if (group && type && 'radio' == type.toLowerCase()) return 'radiogroup';
  if ('input' == name && type && 'checkbox' == type.toLowerCase()) return 'checkbox';
  if ('input' == name && type && 'radio' == type.toLowerCase()) return 'radio';
  if ('select' == name) return 'select';
  return name;
}

});
require.register("yields-traverse/index.js", function(exports, require, module){

/**
 * dependencies
 */

var matches = require('matches-selector');

/**
 * Traverse with the given `el`, `selector` and `len`.
 *
 * @param {String} type
 * @param {Element} el
 * @param {String} selector
 * @param {Number} len
 * @return {Array}
 * @api public
 */

module.exports = function(type, el, selector, len){
  var el = el[type]
    , n = len || 1
    , ret = [];

  if (!el) return ret;

  do {
    if (n == ret.length) break;
    if (1 != el.nodeType) continue;
    if (matches(el, selector)) ret.push(el);
    if (!selector) ret.push(el);
  } while (el = el[type]);

  return ret;
}

});
require.register("yields-isArray/index.js", function(exports, require, module){

/**
 * isArray
 */

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Wether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */

module.exports = isArray || function (val) {
  return !! val && '[object Array]' == str.call(val);
};

});
require.register("component-props/index.js", function(exports, require, module){
/**
 * Global Names
 */

var globals = /\b(Array|Date|Object|Math|JSON)\b/g;

/**
 * Return immediate identifiers parsed from `str`.
 *
 * @param {String} str
 * @param {String|Function} map function or prefix
 * @return {Array}
 * @api public
 */

module.exports = function(str, fn){
  var p = unique(props(str));
  if (fn && 'string' == typeof fn) fn = prefixed(fn);
  if (fn) return map(str, p, fn);
  return p;
};

/**
 * Return immediate identifiers in `str`.
 *
 * @param {String} str
 * @return {Array}
 * @api private
 */

function props(str) {
  return str
    .replace(/\.\w+|\w+ *\(|"[^"]*"|'[^']*'|\/([^/]+)\//g, '')
    .replace(globals, '')
    .match(/[a-zA-Z_]\w*/g)
    || [];
}

/**
 * Return `str` with `props` mapped with `fn`.
 *
 * @param {String} str
 * @param {Array} props
 * @param {Function} fn
 * @return {String}
 * @api private
 */

function map(str, props, fn) {
  var re = /\.\w+|\w+ *\(|"[^"]*"|'[^']*'|\/([^/]+)\/|[a-zA-Z_]\w*/g;
  return str.replace(re, function(_){
    if ('(' == _[_.length - 1]) return fn(_);
    if (!~props.indexOf(_)) return _;
    return fn(_);
  });
}

/**
 * Return unique array.
 *
 * @param {Array} arr
 * @return {Array}
 * @api private
 */

function unique(arr) {
  var ret = [];

  for (var i = 0; i < arr.length; i++) {
    if (~ret.indexOf(arr[i])) continue;
    ret.push(arr[i]);
  }

  return ret;
}

/**
 * Map with prefix `str`.
 */

function prefixed(str) {
  return function(_){
    return str + _;
  };
}

});
require.register("component-to-function/index.js", function(exports, require, module){
/**
 * Module Dependencies
 */

try {
  var expr = require('props');
} catch(e) {
  var expr = require('props-component');
}

/**
 * Expose `toFunction()`.
 */

module.exports = toFunction;

/**
 * Convert `obj` to a `Function`.
 *
 * @param {Mixed} obj
 * @return {Function}
 * @api private
 */

function toFunction(obj) {
  switch ({}.toString.call(obj)) {
    case '[object Object]':
      return objectToFunction(obj);
    case '[object Function]':
      return obj;
    case '[object String]':
      return stringToFunction(obj);
    case '[object RegExp]':
      return regexpToFunction(obj);
    default:
      return defaultToFunction(obj);
  }
}

/**
 * Default to strict equality.
 *
 * @param {Mixed} val
 * @return {Function}
 * @api private
 */

function defaultToFunction(val) {
  return function(obj){
    return val === obj;
  }
}

/**
 * Convert `re` to a function.
 *
 * @param {RegExp} re
 * @return {Function}
 * @api private
 */

function regexpToFunction(re) {
  return function(obj){
    return re.test(obj);
  }
}

/**
 * Convert property `str` to a function.
 *
 * @param {String} str
 * @return {Function}
 * @api private
 */

function stringToFunction(str) {
  // immediate such as "> 20"
  if (/^ *\W+/.test(str)) return new Function('_', 'return _ ' + str);

  // properties such as "name.first" or "age > 18" or "age > 18 && age < 36"
  return new Function('_', 'return ' + get(str));
}

/**
 * Convert `object` to a function.
 *
 * @param {Object} object
 * @return {Function}
 * @api private
 */

function objectToFunction(obj) {
  var match = {}
  for (var key in obj) {
    match[key] = typeof obj[key] === 'string'
      ? defaultToFunction(obj[key])
      : toFunction(obj[key])
  }
  return function(val){
    if (typeof val !== 'object') return false;
    for (var key in match) {
      if (!(key in val)) return false;
      if (!match[key](val[key])) return false;
    }
    return true;
  }
}

/**
 * Built the getter function. Supports getter style functions
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function get(str) {
  var props = expr(str);
  if (!props.length) return '_.' + str;

  var val;
  for(var i = 0, prop; prop = props[i]; i++) {
    val = '_.' + prop;
    val = "('function' == typeof " + val + " ? " + val + "() : " + val + ")";
    str = str.replace(new RegExp(prop, 'g'), val);
  }

  return str;
}

});
require.register("component-dom/index.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var isArray = require('isArray');
var domify = require('domify');
var events = require('event');
var query = require('query');
var trim = require('trim');
var slice = [].slice;

/**
 * Attributes supported.
 */

var attrs = [
  'id',
  'src',
  'rel',
  'cols',
  'rows',
  'type',
  'name',
  'href',
  'title',
  'style',
  'width',
  'height',
  'action',
  'method',
  'tabindex',
  'placeholder'
];

/*
 * A simple way to check for HTML strings or ID strings
 */

var quickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/;

/**
 * Expose `dom()`.
 */

module.exports = dom;

/**
 * Return a dom `List` for the given
 * `html`, selector, or element.
 *
 * @param {String|Element|List} selector
 * @param {String|ELement|context} context
 * @return {List}
 * @api public
 */

function dom(selector, context) {
  // array
  if (isArray(selector)) {
    return new List(selector);
  }

  // List
  if (selector instanceof List) {
    return selector;
  }

  // node
  if (selector.nodeName) {
    return new List([selector]);
  }

  if ('string' != typeof selector) {
    throw new TypeError('invalid selector');
  }

  // html
  var htmlselector = trim.left(selector);
  if (isHTML(htmlselector)) {
    return new List([domify(htmlselector)], htmlselector);
  }

  // selector
  var ctx = context
    ? (context instanceof List ? context[0] : context)
    : document;

  return new List(query.all(selector, ctx), selector);
}

/**
 * Static: Expose `List`
 */

dom.List = List;

/**
 * Static: Expose supported attrs.
 */

dom.attrs = attrs;

/**
 * Static: Mixin a function
 *
 * @param {Object|String} name
 * @param {Object|Function} obj
 * @return {List} self
 */

dom.use = function(name, fn) {
  var keys = [];
  var tmp;

  if (2 == arguments.length) {
    keys.push(name);
    tmp = {};
    tmp[name] = fn;
    fn = tmp;
  } else if (name.name) {
    // use function name
    fn = name;
    name = name.name;
    keys.push(name);
    tmp = {};
    tmp[name] = fn;
    fn = tmp;
  } else {
    keys = Object.keys(name);
    fn = name;
  }

  for(var i = 0, len = keys.length; i < len; i++) {
    List.prototype[keys[i]] = fn[keys[i]];
  }

  return this;
}

/**
 * Initialize a new `List` with the
 * given array-ish of `els` and `selector`
 * string.
 *
 * @param {Mixed} els
 * @param {String} selector
 * @api private
 */

function List(els, selector) {
  els = els || [];
  var len = this.length = els.length;
  for(var i = 0; i < len; i++) this[i] = els[i];
  this.selector = selector;
}

/**
 * Remake the list
 *
 * @param {String|ELement|context} context
 * @return {List}
 * @api private
 */

List.prototype.dom = dom;

/**
 * Make `List` an array-like object
 */

List.prototype.length = 0;
List.prototype.splice = Array.prototype.splice;

/**
 * Array-like object to array
 *
 * @return {Array}
 */

List.prototype.toArray = function() {
  return slice.call(this);
}

/**
 * Attribute accessors.
 */

attrs.forEach(function(name){
  List.prototype[name] = function(val){
    if (0 == arguments.length) return this.attr(name);
    return this.attr(name, val);
  };
});

/**
 * Mixin the API
 */

dom.use(require('./lib/attributes'));
dom.use(require('./lib/classes'));
dom.use(require('./lib/events'));
dom.use(require('./lib/manipulate'));
dom.use(require('./lib/traverse'));

/**
 * Check if the string is HTML
 *
 * @param {String} str
 * @return {Boolean}
 * @api private
 */

function isHTML(str) {
  // Faster than running regex, if str starts with `<` and ends with `>`, assume it's HTML
  if (str.charAt(0) === '<' && str.charAt(str.length - 1) === '>' && str.length >= 3) return true;

  // Run the regex
  var match = quickExpr.exec(str);
  return !!(match && match[1]);
}

});
require.register("component-dom/lib/traverse.js", function(exports, require, module){
/**
 * Module Dependencies
 */

var proto = Array.prototype;
var traverse = require('traverse');
var toFunction = require('to-function');
var matches = require('matches-selector');

/**
 * Find children matching the given `selector`.
 *
 * @param {String} selector
 * @return {List}
 * @api public
 */

exports.find = function(selector){
  return this.dom(selector, this);
};

/**
 * Check if the any element in the selection
 * matches `selector`.
 *
 * @param {String} selector
 * @return {Boolean}
 * @api public
 */

exports.is = function(selector){
  for(var i = 0, el; el = this[i]; i++) {
    if (matches(el, selector)) return true;
  }

  return false;
};

/**
 * Get parent(s) with optional `selector` and `limit`
 *
 * @param {String} selector
 * @param {Number} limit
 * @return {List}
 * @api public
 */

exports.parent = function(selector, limit){
  return this.dom(traverse('parentNode',
    this[0],
    selector,
    limit
    || 1));
};

/**
 * Get next element(s) with optional `selector` and `limit`.
 *
 * @param {String} selector
 * @param {Number} limit
 * @retrun {List}
 * @api public
 */

exports.next = function(selector, limit){
  return this.dom(traverse('nextSibling',
    this[0],
    selector,
    limit
    || 1));
};

/**
 * Get previous element(s) with optional `selector` and `limit`.
 *
 * @param {String} selector
 * @param {Number} limit
 * @return {List}
 * @api public
 */

exports.prev =
exports.previous = function(selector, limit){
  return this.dom(traverse('previousSibling',
    this[0],
    selector,
    limit
    || 1));
};

/**
 * Iterate over each element creating a new list with
 * one item and invoking `fn(list, i)`.
 *
 * @param {Function} fn
 * @return {List} self
 * @api public
 */

exports.each = function(fn){
  var dom = this.dom;

  for (var i = 0, list, len = this.length; i < len; i++) {
    list = dom(this[i]);
    fn.call(list, list, i);
  }

  return this;
};

/**
 * Iterate over each element and invoke `fn(el, i)`
 *
 * @param {Function} fn
 * @return {List} self
 * @api public
 */

exports.forEach = function(fn) {
  for (var i = 0, len = this.length; i < len; i++) {
    fn.call(this[i], this[i], i);
  }

  return this;
};

/**
 * Map each return value from `fn(val, i)`.
 *
 * Passing a callback function:
 *
 *    inputs.map(function(input){
 *      return input.type
 *    })
 *
 * Passing a property string:
 *
 *    inputs.map('type')
 *
 * @param {Function} fn
 * @return {List} self
 * @api public
 */

exports.map = function(fn){
  fn = toFunction(fn);
  var dom = this.dom;
  var out = [];

  for (var i = 0, len = this.length; i < len; i++) {
    out.push(fn.call(dom(this[i]), this[i], i));
  }

  return this.dom(out);
};

/**
 * Select all values that return a truthy value of `fn(val, i)`.
 *
 *    inputs.select(function(input){
 *      return input.type == 'password'
 *    })
 *
 *  With a property:
 *
 *    inputs.select('type == password')
 *
 * @param {Function|String} fn
 * @return {List} self
 * @api public
 */

exports.filter =
exports.select = function(fn){
  fn = toFunction(fn);
  var dom = this.dom;
  var out = [];
  var val;

  for (var i = 0, len = this.length; i < len; i++) {
    val = fn.call(dom(this[i]), this[i], i);
    if (val) out.push(this[i]);
  }

  return this.dom(out);
};

/**
 * Reject all values that return a truthy value of `fn(val, i)`.
 *
 * Rejecting using a callback:
 *
 *    input.reject(function(user){
 *      return input.length < 20
 *    })
 *
 * Rejecting with a property:
 *
 *    items.reject('password')
 *
 * Rejecting values via `==`:
 *
 *    data.reject(null)
 *    input.reject(file)
 *
 * @param {Function|String|Mixed} fn
 * @return {List}
 * @api public
 */

exports.reject = function(fn){
  var out = [];
  var len = this.length;
  var val, i;

  if ('string' == typeof fn) fn = toFunction(fn);

  if (fn) {
    for (i = 0; i < len; i++) {
      val = fn.call(dom(this[i]), this[i], i);
      if (!val) out.push(this[i]);
    }
  } else {
    for (i = 0; i < len; i++) {
      if (this[i] != fn) out.push(this[i]);
    }
  }

  return this.dom(out);
};

/**
 * Return a `List` containing the element at `i`.
 *
 * @param {Number} i
 * @return {List}
 * @api public
 */

exports.at = function(i){
  return this.dom(this[i]);
};

/**
 * Return a `List` containing the first element.
 *
 * @param {Number} i
 * @return {List}
 * @api public
 */

exports.first = function(){
  return this.dom(this[0]);
};

/**
 * Return a `List` containing the last element.
 *
 * @param {Number} i
 * @return {List}
 * @api public
 */

exports.last = function(){
  return this.dom(this[this.length - 1]);
};

/**
 * Mixin the array functions
 */

[
  'push',
  'pop',
  'shift',
  'splice',
  'unshift',
  'reverse',
  'sort',
  'toString',
  'concat',
  'join',
  'slice'
].forEach(function(method) {
  exports[method] = function() {
    return proto[method].apply(this.toArray(), arguments);
  };
});


});
require.register("component-dom/lib/manipulate.js", function(exports, require, module){
/**
 * Module Dependencies
 */

var value = require('value');
var css = require('css');

/**
 * Return element text.
 *
 * @param {String} str
 * @return {String|List}
 * @api public
 */

exports.text = function(str) {
  if (1 == arguments.length) {
    return this.forEach(function(el) {
      var node = document.createTextNode(str);
      el.textContent = '';
      el.appendChild(node);
    });
  }

  var out = '';
  this.forEach(function(el) {
    out += getText(el);
  });

  return out;
};

/**
 * Get text helper from Sizzle.
 *
 * Source: https://github.com/jquery/sizzle/blob/master/src/sizzle.js#L914-L947
 *
 * @param {Element|Array} el
 * @return {String}
 */

function getText(el) {
  var ret = '';
  var type = el.nodeType;
  var node;

  switch(type) {
    case 1:
    case 9:
    case 11:
      if ('string' == typeof el.textContent) return el.textContent;
      for (el = el.firstChild; el; el = el.nextSibling) ret += text(el);
      break;
    case 3:
    case 4:
      return el.nodeValue;
    default:
      while (node = el[i++]) {
        ret += getText(node);
      }
  }

  return ret;
}

/**
 * Return element html.
 *
 * @return {String} html
 * @api public
 */

exports.html = function(html) {
  if (1 == arguments.length) {
    return this.forEach(function(el) {
      el.innerHTML = html;
    });
  }

  // TODO: real impl
  return this[0] && this[0].innerHTML;
};

/**
 * Get and set the css value
 *
 * @param {String|Object} prop
 * @param {Mixed} val
 * @return {Mixed}
 * @api public
 */

exports.css = function(prop, val) {
  // getter
  if (!val && 'object' != typeof prop) {
    return css(this[0], prop);
  }
  // setter
  this.forEach(function(el) {
    css(el, prop, val);
  });

  return this;
};

/**
 * Prepend `val`.
 *
 * From jQuery: if there is more than one target element
 * cloned copies of the inserted element will be created
 * for each target after the first.
 *
 * @param {String|Element|List} val
 * @return {List} self
 * @api public
 */

exports.prepend = function(val) {
  var dom = this.dom;

  this.forEach(function(target, i) {
    dom(val).forEach(function(selector) {
      selector = i ? selector.cloneNode(true) : selector;
      if (target.children.length) {
        target.insertBefore(selector, target.firstChild);
      } else {
        target.appendChild(selector);
      }
    });
  });

  return this;
};

/**
 * Append `val`.
 *
 * From jQuery: if there is more than one target element
 * cloned copies of the inserted element will be created
 * for each target after the first.
 *
 * @param {String|Element|List} val
 * @return {List} self
 * @api public
 */

exports.append = function(val) {
  var dom = this.dom;

  this.forEach(function(target, i) {
    dom(val).forEach(function(el) {
      el = i ? el.cloneNode(true) : el;
      target.appendChild(el);
    });
  });

  return this;
};

/**
 * Insert self's `els` after `val`
 *
 * From jQuery: if there is more than one target element,
 * cloned copies of the inserted element will be created
 * for each target after the first, and that new set
 * (the original element plus clones) is returned.
 *
 * @param {String|Element|List} val
 * @return {List} self
 * @api public
 */

exports.insertAfter = function(val) {
  var dom = this.dom;

  this.forEach(function(el) {
    dom(val).forEach(function(target, i) {
      if (!target.parentNode) return;
      el = i ? el.cloneNode(true) : el;
      target.parentNode.insertBefore(el, target.nextSibling);
    });
  });

  return this;
};

/**
 * Append self's `el` to `val`
 *
 * @param {String|Element|List} val
 * @return {List} self
 * @api public
 */

exports.appendTo = function(val) {
  this.dom(val).append(this);
  return this;
};

/**
 * Replace elements in the DOM.
 *
 * @param {String|Element|List} val
 * @return {List} self
 * @api public
 */

exports.replace = function(val) {
  var self = this;
  var list = this.dom(val);

  list.forEach(function(el, i) {
    var old = self[i];
    var parent = old.parentNode;
    if (!parent) return;
    el = i ? el.cloneNode(true) : el;
    parent.replaceChild(el, old);
  });

  return this;
};

/**
 * Empty the dom list
 *
 * @return self
 * @api public
 */

exports.empty = function() {
  return this.forEach(function(el) {
    el.textContent = '';
  });
};

/**
 * Remove all elements in the dom list
 *
 * @return {List} self
 * @api public
 */

exports.remove = function() {
  return this.forEach(function(el) {
    var parent = el.parentNode;
    if (parent) parent.removeChild(el);
  });
};

/**
 * Return a cloned dom list with all elements cloned.
 *
 * @return {List}
 * @api public
 */

exports.clone = function() {
  var out = this.map(function(el) {
    return el.cloneNode(true);
  });

  return this.dom(out);
};

});
require.register("component-dom/lib/classes.js", function(exports, require, module){
/**
 * Module Dependencies
 */

var classes = require('classes');

/**
 * Add the given class `name`.
 *
 * @param {String} name
 * @return {List} self
 * @api public
 */

exports.addClass = function(name){
  return this.forEach(function(el) {
    el._classes = el._classes || classes(el);
    el._classes.add(name);
  });
};

/**
 * Remove the given class `name`.
 *
 * @param {String|RegExp} name
 * @return {List} self
 * @api public
 */

exports.removeClass = function(name){
  return this.forEach(function(el) {
    el._classes = el._classes || classes(el);
    el._classes.remove(name);
  });
};

/**
 * Toggle the given class `name`,
 * optionally a `bool` may be given
 * to indicate that the class should
 * be added when truthy.
 *
 * @param {String} name
 * @param {Boolean} bool
 * @return {List} self
 * @api public
 */

exports.toggleClass = function(name, bool){
  var fn = 'toggle';

  // toggle with boolean
  if (2 == arguments.length) {
    fn = bool ? 'add' : 'remove';
  }

  return this.forEach(function(el) {
    el._classes = el._classes || classes(el);
    el._classes[fn](name);
  })
};

/**
 * Check if the given class `name` is present.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

exports.hasClass = function(name){
  var el;

  for(var i = 0, len = this.length; i < len; i++) {
    el = this[i];
    el._classes = el._classes || classes(el);
    if (el._classes.has(name)) return true;
  }

  return false;
};

});
require.register("component-dom/lib/attributes.js", function(exports, require, module){
/**
 * Module Dependencies
 */

var value = require('value');

/**
 * Set attribute `name` to `val`, or get attr `name`.
 *
 * @param {String} name
 * @param {String} [val]
 * @return {String|List} self
 * @api public
 */

exports.attr = function(name, val){
  // get
  if (1 == arguments.length) {
    return this[0] && this[0].getAttribute(name);
  }

  // remove
  if (null == val) {
    return this.removeAttr(name);
  }

  // set
  return this.forEach(function(el){
    el.setAttribute(name, val);
  });
};

/**
 * Remove attribute `name`.
 *
 * @param {String} name
 * @return {List} self
 * @api public
 */

exports.removeAttr = function(name){
  return this.forEach(function(el){
    el.removeAttribute(name);
  });
};

/**
 * Set property `name` to `val`, or get property `name`.
 *
 * @param {String} name
 * @param {String} [val]
 * @return {Object|List} self
 * @api public
 */

exports.prop = function(name, val){
  if (1 == arguments.length) {
    return this[0] && this[0][name];
  }

  return this.forEach(function(el){
    el[name] = val;
  });
};

/**
 * Get the first element's value or set selected
 * element values to `val`.
 *
 * @param {Mixed} [val]
 * @return {Mixed}
 * @api public
 */

exports.val =
exports.value = function(val){
  if (0 == arguments.length) {
    return this[0]
      ? value(this[0])
      : undefined;
  }

  return this.forEach(function(el){
    value(el, val);
  });
};

});
require.register("component-dom/lib/events.js", function(exports, require, module){
/**
 * Module Dependencies
 */

var events = require('event');
var delegate = require('delegate');

/**
 * Bind to `event` and invoke `fn(e)`. When
 * a `selector` is given then events are delegated.
 *
 * @param {String} event
 * @param {String} [selector]
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {List}
 * @api public
 */

exports.on = function(event, selector, fn, capture){
  if ('string' == typeof selector) {
    return this.forEach(function (el) {
      fn._delegate = delegate.bind(el, selector, event, fn, capture);
    });
  }

  capture = fn;
  fn = selector;

  return this.forEach(function (el) {
    events.bind(el, event, fn, capture);
  });
};

/**
 * Unbind to `event` and invoke `fn(e)`. When
 * a `selector` is given then delegated event
 * handlers are unbound.
 *
 * @param {String} event
 * @param {String} [selector]
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {List}
 * @api public
 */

exports.off = function(event, selector, fn, capture){
  if ('string' == typeof selector) {
    return this.forEach(function (el) {
      // TODO: add selector support back
      delegate.unbind(el, event, fn._delegate, capture);
    });
  }

  capture = fn;
  fn = selector;

  return this.forEach(function (el) {
    events.unbind(el, event, fn, capture);
  });
};

});
require.register("anthonyshort-map/index.js", function(exports, require, module){
var SimpleMap = function(values){
  this._keys = [];
  this._values = [];
  if(values) {
    values.forEach(function(data){
      this.set.apply(this, data);
    });
  }
};

SimpleMap.prototype.set = function(key, value) {
  var index = this._keys.indexOf(key);
  if (index === -1) {
    index = this._keys.length;
  }
  this._values[index] = value;
  this._keys[index] = key;
};

SimpleMap.prototype.get = function(key) {
  if ( this.has(key) === false ) return undefined;
  var index = this._keys.indexOf(key);
  return this._values[index];
};

SimpleMap.prototype.size = function() {
  return this._keys.length;
};

SimpleMap.prototype.remove = function(key) {
  if ( this.has(key) === false ) return true;
  var index = this._keys.indexOf(key);
  this._keys.splice(index, 1);
  this._values.splice(index, 1);
  return true;
};

SimpleMap.prototype.values = function() {
  return this._values;
};

SimpleMap.prototype.keys = function() {
  return this._keys;
};

SimpleMap.prototype.forEach = function(callback, context) {
  var i;
  for(i = 0; i < this._keys.length; i++) {
    callback.call(context || this._values[i], this._values[i], this._keys[i]);
  }
};

SimpleMap.prototype.has = function(key) {
  return this._keys.indexOf(key) > -1;
};

module.exports = SimpleMap;
});
require.register("anthonyshort-emitter-manager/index.js", function(exports, require, module){
var HashMap = require('map');

function mixin(obj) {
  obj._eventManager = new Manager();
  obj.listenTo = function(emitter, type, fn){
    this._eventManager.on(emitter, type, fn, this);
  };
  obj.stopListening = function(emitter, type, fn){
    this._eventManager.off(emitter, type, fn);
  };
}

function Manager(obj) {
  if(obj) return mixin(obj);
  this._events = new HashMap();
}

Manager.prototype.on = function(obj, type, fn, context) {
  var data = this._events.get(obj) || {};
  var fns = data[type] || (data[type] = []);
  var bound = fn.bind(context);
  obj.on(type, bound);
  fns.push({ original: fn, bound: bound });
  this._events.set(obj, data);
};

Manager.prototype.off = function(obj, name, fn) {
  var events = this._events;
  if(typeof name === 'function') {
    fn = name;
  }
  if(typeof obj === 'string') {
    name = obj;
    obj = null;
  }
  var objs = obj ? [obj] : this._events.keys();
  objs.forEach(function(emitter){
    var data = events.get(emitter);
    for (var eventName in data) {
      data[eventName] = data[eventName].filter(function(callback){
        if(fn && callback.original !== fn) return true;
        emitter.off(name || eventName, callback.bound);
        return false;
      });
    }
  });
};

module.exports = Manager;
});
require.register("component-format-parser/index.js", function(exports, require, module){

/**
 * Parse the given format `str`.
 *
 * @param {String} str
 * @return {Array}
 * @api public
 */

module.exports = function(str){
	return str.split(/ *\| */).map(function(call){
		var parts = call.split(':');
		var name = parts.shift();
		var args = parseArgs(parts.join(':'));

		return {
			name: name,
			args: args
		};
	});
};

/**
 * Parse args `str`.
 *
 * @param {String} str
 * @return {Array}
 * @api private
 */

function parseArgs(str) {
	var args = [];
	var re = /"([^"]*)"|'([^']*)'|([^ \t,]+)/g;
	var m;
	
	while (m = re.exec(str)) {
		args.push(m[2] || m[1] || m[0]);
	}
	
	return args;
}

});
require.register("yields-merge-attrs/index.js", function(exports, require, module){

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

});
require.register("yields-uniq/index.js", function(exports, require, module){

/**
 * dependencies
 */

try {
  var indexOf = require('indexof');
} catch(e){
  var indexOf = require('indexof-component');
}

/**
 * Create duplicate free array
 * from the provided `arr`.
 *
 * @param {Array} arr
 * @param {Array} select
 * @return {Array}
 */

module.exports = function (arr, select) {
  var len = arr.length, ret = [], v;
  select = select ? (select instanceof Array ? select : [select]) : false;

  for (var i = 0; i < len; i++) {
    v = arr[i];
    if (select && !~indexOf(select, v)) {
      ret.push(v);
    } else if (!~indexOf(ret, v)) {
      ret.push(v);
    }
  }
  return ret;
};

});
require.register("yields-carry/index.js", function(exports, require, module){

/**
 * dependencies
 */

var merge = require('merge-attrs')
  , classes = require('classes')
  , uniq = require('uniq');

/**
 * Export `carry`
 */

module.exports = carry;

/**
 * Carry over attrs and classes
 * from `b` to `a`.
 *
 * @param {Element} a
 * @param {Element} b
 * @return {Element}
 * @api public
 */

function carry(a, b){
  if (!a) return b.cloneNode();
  carry.attrs(a, b);
  carry.classes(a, b);
  return a;
}

/**
 * Carry attributes.
 *
 * @param {Element} a
 * @param {Element} b
 * @return {Element} a
 * @api public
 */

carry.attrs = function(a, b){
  merge(a, b);
  return a;
};

/**
 * Carry over classes.
 *
 * @param {Element} a
 * @param {Element} b
 * @return {Element} a
 * @api public
 */

carry.classes = function(a, b){
  if (a.className == b.className) return a;
  var blist = classes(b).array();
  var alist = classes(a).array();
  var list = alist.concat(blist);
  a.className = uniq(list).join(' ');
  return a;
};

});
require.register("component-reactive/lib/index.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var adapter = require('./adapter');
var AttrBinding = require('./attr-binding');
var TextBinding = require('./text-binding');
var debug = require('debug')('reactive');
var bindings = require('./bindings');
var Binding = require('./binding');
var utils = require('./utils');
var query = require('query');

/**
 * Expose `Reactive`.
 */

exports = module.exports = Reactive;

/**
 * Bindings.
 */

exports.bindings = {};

/**
 * Define subscription function.
 *
 * @param {Function} fn
 * @api public
 */

exports.subscribe = function(fn){
  adapter.subscribe = fn;
};

/**
 * Define unsubscribe function.
 *
 * @param {Function} fn
 * @api public
 */

exports.unsubscribe = function(fn){
  adapter.unsubscribe = fn;
};

/**
 * Define a get function.
 *
 * @param {Function} fn
 * @api public
 */

exports.get = function(fn) {
  adapter.get = fn;
};

/**
 * Define a set function.
 *
 * @param {Function} fn
 * @api public
 */

exports.set = function(fn) {
  adapter.set = fn;
};

/**
 * Expose adapter
 */

exports.adapter = adapter;

/**
 * Define binding `name` with callback `fn(el, val)`.
 *
 * @param {String} name or object
 * @param {String|Object} name
 * @param {Function} fn
 * @api public
 */

exports.bind = function(name, fn){
  if ('object' == typeof name) {
    for (var key in name) {
      exports.bind(key, name[key]);
    }
    return;
  }

  exports.bindings[name] = fn;
};

/**
 * Middleware
 * @param {Function} fn
 * @api public
 */

exports.use = function(fn) {
  fn(exports);
  return this;
};

/**
 * Initialize a reactive template for `el` and `obj`.
 *
 * @param {Element} el
 * @param {Element} obj
 * @param {Object} options
 * @api public
 */

function Reactive(el, model, view) {
  if (!(this instanceof Reactive)) return new Reactive(el, model, view);
  this.adapter = exports.adapter;
  this.el = el;
  this.model = model;
  this.els = [];
  this.view = view || {};
  this.bindAll();
  this.bindInterpolation(this.el, []);
}

/**
 * Subscribe to changes on `prop`.
 *
 * @param {String} prop
 * @param {Function} fn
 * @return {Reactive}
 * @api private
 */

Reactive.prototype.sub = function(prop, fn){
  this.adapter.subscribe(this.model, prop, fn);
  return this;
};

/**
 * Unsubscribe to changes from `prop`.
 *
 * @param {String} prop
 * @param {Function} fn
 * @return {Reactive}
 * @api private
 */

Reactive.prototype.unsub = function(prop, fn){
  this.adapter.unsubscribe(this.model, prop, fn);
  return this;
};

/**
 * Get a `prop`
 *
 * @param {String} prop
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

Reactive.prototype.get = function(prop) {
  return this.adapter.get(this.model, prop);
};

/**
 * Set a `prop`
 *
 * @param {String} prop
 * @param {Mixed} val
 * @return {Reactive}
 * @api private
 */

Reactive.prototype.set = function(prop, val) {
  this.adapter.set(this.model, prop, val);
  return this;
};

/**
 * Traverse and bind all interpolation within attributes and text.
 *
 * @param {Element} el
 * @api private
 */

Reactive.prototype.bindInterpolation = function(el, els){

  // element
  if (el.nodeType == 1) {
    for (var i = 0; i < el.attributes.length; i++) {
      var attr = el.attributes[i];
      if (utils.hasInterpolation(attr.value)) {
        new AttrBinding(this, el, attr);
      }
    }
  }

  // text node
  if (el.nodeType == 3) {
    if (utils.hasInterpolation(el.data)) {
      debug('bind text "%s"', el.data);
      new TextBinding(this, el);
    }
  }

  // walk nodes
  for (var i = 0; i < el.childNodes.length; i++) {
    var node = el.childNodes[i];
    this.bindInterpolation(node, els);
  }
};

/**
 * Apply all bindings.
 *
 * @api private
 */

Reactive.prototype.bindAll = function() {
  for (var name in exports.bindings) {
    this.bind(name, exports.bindings[name]);
  }
};

/**
 * Bind `name` to `fn`.
 *
 * @param {String|Object} name or object
 * @param {Function} fn
 * @api public
 */

Reactive.prototype.bind = function(name, fn) {
  if ('object' == typeof name) {
    for (var key in name) {
      this.bind(key, name[key]);
    }
    return;
  }

  var els = query.all('[' + name + ']', this.el);
  if (this.el.hasAttribute && this.el.hasAttribute(name)) {
    els = [].slice.call(els);
    els.unshift(this.el);
  }
  if (!els.length) return;

  debug('bind [%s] (%d elements)', name, els.length);
  for (var i = 0; i < els.length; i++) {
    var binding = new Binding(name, this, els[i], fn);
    binding.bind();
  }
};

/**
 * Use middleware
 *
 * @api public
 */

Reactive.prototype.use = function(fn) {
  fn(this);
  return this;
};

// bundled bindings

exports.use(bindings);

});
require.register("component-reactive/lib/utils.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var debug = require('debug')('reactive:utils');
var props = require('props');
var adapter = require('./adapter');

/**
 * Function cache.
 */

var cache = {};

/**
 * Return interpolation property names in `str`,
 * for example "{foo} and {bar}" would return
 * ['foo', 'bar'].
 *
 * @param {String} str
 * @return {Array}
 * @api private
 */

exports.interpolationProps = function(str) {
  var m;
  var arr = [];
  var re = /\{([^}]+)\}/g;

  while (m = re.exec(str)) {
    var expr = m[1];
    arr = arr.concat(props(expr));
  }

  return unique(arr);
};

/**
 * Interpolate `str` with the given `fn`.
 *
 * @param {String} str
 * @param {Function} fn
 * @return {String}
 * @api private
 */

exports.interpolate = function(str, fn){
  return str.replace(/\{([^}]+)\}/g, function(_, expr){
    var cb = cache[expr];
    if (!cb) cb = cache[expr] = compile(expr);
    var val = fn(expr.trim(), cb);
    return val == null ? '' : val;
  });
};

/**
 * Check if `str` has interpolation.
 *
 * @param {String} str
 * @return {Boolean}
 * @api private
 */

exports.hasInterpolation = function(str) {
  return ~str.indexOf('{');
};

/**
 * Remove computed properties notation from `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

exports.clean = function(str) {
  return str.split('<')[0].trim();
};

/**
 * Call `prop` on `model` or `view`.
 *
 * @param {Object} model
 * @param {Object} view
 * @param {String} prop
 * @return {Mixed}
 * @api private
 */

exports.call = function(model, view, prop){
  // view method
  if ('function' == typeof view[prop]) {
    return view[prop]();
  }

  // view value
  if (view.hasOwnProperty(prop)) {
    return view[prop];
  }

  // get property from model
  return adapter.get(model, prop);
};

/**
 * Compile `expr` to a `Function`.
 *
 * @param {String} expr
 * @return {Function}
 * @api private
 */

function compile(expr) {
  // TODO: use props() callback instead
  var re = /\.\w+|\w+ *\(|"[^"]*"|'[^']*'|\/([^/]+)\/|[a-zA-Z_]\w*/g;
  var p = props(expr);

  var body = expr.replace(re, function(_) {
    if ('(' == _[_.length - 1]) return access(_);
    if (!~p.indexOf(_)) return _;
    return call(_);
  });

  debug('compile `%s`', body);
  return new Function('model', 'view', 'call', 'return ' + body);
}

/**
 * Access a method `prop` with dot notation.
 *
 * @param {String} prop
 * @return {String}
 * @api private
 */

function access(prop) {
  prop = prop.replace('(', '');
  return '(view.' + prop + ' '
    + '? view '
    + ': model).' + prop + '(';
}

/**
 * Call `prop` on view, model, or access the model's property.
 *
 * @param {String} prop
 * @return {String}
 * @api private
 */

function call(prop) {
  return 'call(model, view, "' + prop + '")';
}

/**
 * Return unique array.
 *
 * @param {Array} arr
 * @return {Array}
 * @api private
 */

function unique(arr) {
  var ret = [];

  for (var i = 0; i < arr.length; i++) {
    if (~ret.indexOf(arr[i])) continue;
    ret.push(arr[i]);
  }

  return ret;
}

});
require.register("component-reactive/lib/text-binding.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var debug = require('debug')('reactive:text-binding');
var utils = require('./utils');

/**
 * Expose `TextBinding`.
 */

module.exports = TextBinding;

/**
 * Initialize a new text binding.
 *
 * @param {Reactive} view
 * @param {Element} node
 * @param {Attribute} attr
 * @api private
 */

function TextBinding(reactive, node) {
  this.reactive = reactive;
  this.text = node.data;
  this.node = node;
  this.props = utils.interpolationProps(this.text);
  this.subscribe();
  this.render();
}

/**
 * Subscribe to changes.
 */

TextBinding.prototype.subscribe = function(){
  var self = this;
  var reactive = this.reactive;
  this.props.forEach(function(prop){
    reactive.sub(prop, function(){
      self.render();
    });
  });
};

/**
 * Render text.
 */

TextBinding.prototype.render = function(){
  var node = this.node;
  var text = this.text;
  var reactive = this.reactive;
  var model = reactive.model;

  // TODO: delegate most of this to `Reactive`
  debug('render "%s"', text);
  node.data = utils.interpolate(text, function(prop, fn){
    if (fn) {
      return fn(model, reactive.view, utils.call);
    } else {
      return reactive.get(model, prop);
    }
  });
};

});
require.register("component-reactive/lib/attr-binding.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var debug = require('debug')('reactive:attr-binding');
var utils = require('./utils');

/**
 * Expose `AttrBinding`.
 */

module.exports = AttrBinding;

/**
 * Initialize a new attribute binding.
 *
 * @param {Reactive} view
 * @param {Element} node
 * @param {Attribute} attr
 * @api private
 */

function AttrBinding(reactive, node, attr) {
  var self = this;
  this.reactive = reactive;
  this.node = node;
  this.attr = attr;
  this.text = attr.value;
  this.props = utils.interpolationProps(this.text);
  this.subscribe();
  this.render();
}

/**
 * Subscribe to changes.
 */

AttrBinding.prototype.subscribe = function(){
  var self = this;
  var reactive = this.reactive;
  this.props.forEach(function(prop){
    reactive.sub(prop, function(){
      self.render();
    });
  });
};

/**
 * Render the value.
 */

AttrBinding.prototype.render = function(){
  var attr = this.attr;
  var text = this.text;
  var reactive = this.reactive;
  var model = reactive.model;

  // TODO: delegate most of this to `Reactive`
  debug('render %s "%s"', attr.name, text);
  attr.value = utils.interpolate(text, function(prop, fn){
    if (fn) {
      return fn(model, reactive.view, utils.call);
    } else {
      return reactive.get(model, prop);
    }
  });
};

});
require.register("component-reactive/lib/binding.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var parse = require('format-parser');

/**
 * Expose `Binding`.
 */

module.exports = Binding;

/**
 * Initialize a binding.
 *
 * @api private
 */

function Binding(name, reactive, el, fn) {
  this.name = name;
  this.reactive = reactive;
  this.model = reactive.model;
  this.view = reactive.view;
  this.el = el;
  this.fn = fn;
}

/**
 * Apply the binding.
 *
 * @api private
 */

Binding.prototype.bind = function() {
  var val = this.el.getAttribute(this.name);
  this.fn(this.el, val, this.model);
};

/**
 * Perform interpolation on `name`.
 *
 * @param {String} name
 * @return {String}
 * @api public
 */

Binding.prototype.interpolate = function(name) {
  var self = this;
  name = clean(name);

  if (~name.indexOf('{')) {
    return name.replace(/{([^}]+)}/g, function(_, name){
      return self.value(name);
    });
  }

  return this.formatted(name);
};

/**
 * Return value for property `name`.
 *
 *  - check if the "view" has a `name` method
 *  - check if the "model" has a `name` method
 *  - check if the "model" has a `name` property
 *
 * @param {String} name
 * @return {Mixed}
 * @api public
 */

Binding.prototype.value = function(name) {
  var view = this.view;
  name = clean(name);

  // view method
  if ('function' == typeof view[name]) {
    return view[name]();
  }

  // view value
  if (view.hasOwnProperty(name)) {
    return view[name];
  }

  return this.reactive.get(name);
};

/**
 * Return formatted property.
 *
 * @param {String} fmt
 * @return {Mixed}
 * @api public
 */

Binding.prototype.formatted = function(fmt) {
  var calls = parse(clean(fmt));
  var name = calls[0].name;
  var val = this.value(name);

  for (var i = 1; i < calls.length; ++i) {
    var call = calls[i];
    call.args.unshift(val);
    var fn = this.view[call.name];
    val = fn.apply(this.view, call.args);
  }

  return val;
};

/**
 * Invoke `fn` on changes.
 *
 * @param {Function} fn
 * @api public
 */

Binding.prototype.change = function(fn) {
  fn.call(this);

  var self = this;
  var reactive = this.reactive;
  var val = this.el.getAttribute(this.name);

  // computed props
  var parts = val.split('<');
  val = parts[0];
  var computed = parts[1];
  if (computed) computed = computed.trim().split(/\s+/);

  // interpolation
  if (hasInterpolation(val)) {
    var props = interpolationProps(val);
    props.forEach(function(prop){
      reactive.sub(prop, fn.bind(self));
    });
    return;
  }

  // formatting
  var calls = parse(val);
  var prop = calls[0].name;

  // computed props
  if (computed) {
    computed.forEach(function(prop){
      reactive.sub(prop, fn.bind(self));
    });
    return;
  }

  // bind to prop
  reactive.sub(prop, fn.bind(this));
};

/**
 * Return interpolation property names in `str`,
 * for example "{foo} and {bar}" would return
 * ['foo', 'bar'].
 *
 * @param {String} str
 * @return {Array}
 * @api private
 */

function interpolationProps(str) {
  var m;
  var arr = [];
  var re = /\{([^}]+)\}/g;
  while (m = re.exec(str)) {
    arr.push(m[1]);
  }
  return arr;
}

/**
 * Check if `str` has interpolation.
 *
 * @param {String} str
 * @return {Boolean}
 * @api private
 */

function hasInterpolation(str) {
  return ~str.indexOf('{');
}

/**
 * Remove computed properties notation from `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function clean(str) {
  return str.split('<')[0].trim();
}

});
require.register("component-reactive/lib/bindings.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var carry = require('carry');
var classes = require('classes');
var event = require('event');

/**
 * Attributes supported.
 */

var attrs = [
  'id',
  'src',
  'rel',
  'cols',
  'rows',
  'name',
  'href',
  'title',
  'class',
  'style',
  'width',
  'value',
  'height',
  'tabindex',
  'placeholder'
];

/**
 * Events supported.
 */

var events = [
  'change',
  'click',
  'dblclick',
  'mousedown',
  'mouseup',
  'blur',
  'focus',
  'input',
  'submit',
  'keydown',
  'keypress',
  'keyup'
];

/**
 * Apply bindings.
 */

module.exports = function(reactive){

  /**
   * Generate attribute bindings.
   */

  attrs.forEach(function(attr){
    reactive.bind('data-' + attr, function(el, name, obj){
      this.change(function(){
        el.setAttribute(attr, this.interpolate(name));
      });
    });
  });

/**
 * Append child element.
 */

  reactive.bind('data-append', function(el, name){
    var other = this.value(name);
    el.appendChild(other);
  });

/**
 * Replace element, carrying over its attributes.
 */

  reactive.bind('data-replace', function(el, name){
    var other = carry(this.value(name), el);
    el.parentNode.replaceChild(other, el);
  });

  /**
   * Show binding.
   */

  reactive.bind('data-visible', function(el, name){
    this.change(function(){
      if (this.value(name)) {
        classes(el).add('visible').remove('hidden');
      } else {
        classes(el).remove('visible').add('hidden');
      }
    });
  });

  /**
   * Hide binding.
   */

  reactive.bind('data-hidden', function(el, name){
    this.change(function(){
      if (this.value(name)) {
        classes(el).remove('visible').add('hidden');
      } else {
        classes(el).add('visible').remove('hidden');
      }
    });
  });

  /**
   * Checked binding.
   */

  reactive.bind('data-checked', function(el, name){
    this.change(function(){
      if (this.value(name)) {
        el.setAttribute('checked', 'checked');
      } else {
        el.removeAttribute('checked');
      }
    });
  });

  /**
   * Text binding.
   */

  reactive.bind('data-text', function(el, name){
    this.change(function(){
      el.textContent = this.interpolate(name);
    });
  });

  /**
   * HTML binding.
   */

  reactive.bind('data-html', function(el, name){
    this.change(function(){
      el.innerHTML = this.formatted(name);
    });
  });

  /**
   * Generate event bindings.
   */

  events.forEach(function(name){
    reactive.bind('on-' + name, function(el, method){
      var view = this.reactive.view;
      event.bind(el, name, function(e){
        var fn = view[method];
        if (!fn) throw new Error('method .' + method + '() missing');
        view[method](e);
      });
    });
  });
};

});
require.register("component-reactive/lib/adapter.js", function(exports, require, module){
/**
 * Default subscription method.
 * Subscribe to changes on the model.
 *
 * @param {Object} obj
 * @param {String} prop
 * @param {Function} fn
 */

exports.subscribe = function(obj, prop, fn) {
  if (!obj.on) return;
  obj.on('change ' + prop, fn);
};

/**
 * Default unsubscription method.
 * Unsubscribe from changes on the model.
 */

exports.unsubscribe = function(obj, prop, fn) {
  if (!obj.off) return;
  obj.off('change ' + prop, fn);
};

/**
 * Default setter method.
 * Set a property on the model.
 *
 * @param {Object} obj
 * @param {String} prop
 * @param {Mixed} val
 */

exports.set = function(obj, prop, val) {
  if ('function' == typeof obj[prop]) {
    obj[prop](val);
  }
  else if ('function' == typeof obj.set) {
    obj.set(prop, val);
  }
  else {
    obj[prop] = val;
  }
};

/**
 * Default getter method.
 * Get a property from the model.
 *
 * @param {Object} obj
 * @param {String} prop
 * @return {Mixed}
 */

exports.get = function(obj, prop) {
  if ('function' == typeof obj[prop]) {
    return obj[prop]();
  }
  else if ('function' == typeof obj.get) {
    return obj.get(prop);
  }
  else {
    return obj[prop];
  }
};

});
require.register("bmcmahen-view/index.js", function(exports, require, module){
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



});

require.register("component-keyname/index.js", function(exports, require, module){

/**
 * Key name map.
 */

var map = {
  8: 'backspace',
  9: 'tab',
  13: 'enter',
  16: 'shift',
  17: 'ctrl',
  18: 'alt',
  20: 'capslock',
  27: 'esc',
  32: 'space',
  33: 'pageup',
  34: 'pagedown',
  35: 'end',
  36: 'home',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
  45: 'ins',
  46: 'del',
  91: 'meta',
  93: 'meta',
  224: 'meta'
};

/**
 * Return key name for `n`.
 *
 * @param {Number} n
 * @return {String}
 * @api public
 */

module.exports = function(n){
  return map[n];
};
});
require.register("bmcmahen-selection-range/index.js", function(exports, require, module){

/**
 * Set / get caret position with `el`.
 *
 * @param {Element} el
 * @param {Number} at
 * @param {Number} end
 * @return {Number}
 * @api private
 */

function position(el, start, end){
  var selection = window.getSelection();

  // get our current range
  if (1 == arguments.length) {
    if (!selection.rangeCount) return;
    var range = selection.getRangeAt(0);
    var clone = range.cloneRange();
    clone.selectNodeContents(el);
    clone.setEnd(range.endContainer, range.endOffset);
    var indexes = { end : clone.toString().length };
    clone.setStart(range.startContainer, range.startOffset);
    indexes.start = indexes.end - clone.toString().length;
    return indexes;
  }

  // set a selection or cursor position.
  var hasSelection = arguments.length == 3;
  var length = 0;
  var abort;
  var ranger = document.createRange();

  visit(el, function(node){
    if (3 != node.nodeType) return;
    var textLength = node.textContent.length;
    length += textLength;
    var sub = length - textLength;

    // If we have a selection, then we need to set the
    // start position for the correct node. 
  
    if (hasSelection && length >= start){
      var slen = start - sub;
      if (slen > 0) {
        ranger.setStart(node, slen);
      }
    }

    // if we don't have a selection, we need to
    // set the start and end of the range to the 
    // start index.
  
    if (length >= (end || start)){
      if (abort) return;
      abort = true;
      if (!hasSelection){
        ranger.setStart(node, start - sub);
        ranger.setEnd(node, start - sub);
      } else {
        ranger.setEnd(node, end - sub);
      }

      el.focus(); // necessary for firefox
      selection.removeAllRanges();
      selection.addRange(ranger);
      return true;
    }
  });
}

module.exports = position;

/**
 * Walk all text nodes of `node`.
 *
 * @param {Element|Node} node
 * @param {Function} fn
 * @api private
 */

function visit(node, fn){
  var nodes = node.childNodes;
  for (var i = 0; i < nodes.length; ++i) {
    if (fn(nodes[i])) break;
    visit(nodes[i], fn);
  }
}

});
require.register("bmcmahen-auto-save/index.js", function(exports, require, module){
/**
 * Basically a glorified setTimeout that I inevitably
 * implement in any auto-save context.
 * @param  {Number} time ms
 * @return {Timer}      
 */

module.exports = function(time){
  var time = time || 1000;
  var timer;
  var resetTimer = function(fn){
    timer = setTimeout(fn, time);
  };
  return function(fn){
    clearTimeout(timer);
    resetTimer(fn);
  }
};


});
require.register("bmcmahen-is-key/index.js", function(exports, require, module){
var keycode = require('keycode');

module.exports = function(e, keys){
  var key = e.keyCode || e.charCode;
  for (var i = 0, len = keys.length; i < len; i++) {
    if (keycode(keys[i]) === key) {
      return true;
    }
  }
  return false;
}
});
require.register("discore-closest/index.js", function(exports, require, module){
var matches = require('matches-selector')

module.exports = function (element, selector, checkYoSelf, root) {
  element = checkYoSelf ? {parentNode: element} : element

  root = root || document

  // Make sure `element !== document` and `element != null`
  // otherwise we get an illegal invocation
  while ((element = element.parentNode) && element !== document) {
    if (matches(element, selector))
      return element
    // After `matches` on the edge case that
    // the selector matches the root
    // (when the root is not the document)
    if (element === root)
      return  
  }
}
});
require.register("bmcmahen-cursor-within/index.js", function(exports, require, module){
var closest = require('closest');

/**
 * Get the first matching element in which the 
 * cursor is contained.
 * @param  {String} selector 
 * @return {Element}          
 */

module.exports = function(selector){
  var selection;
  var node;

  // Good browsers
  if (window.getSelection){
    selection = window.getSelection();
    if (selection.anchorNode) {
      var anchor = selection.anchorNode;
      node = anchor.nodeType === 3
        ? anchor.parentNode
        : anchor;
    // Less good, good browsers.
    } else {
      var range = selection.getRangeAt(0);
      node = range.commonAncestorContainer.parentNode;
    }

  // IE fallback
  } else if (document.selection){
    node = document.selection.createRange().parentElement();
  }
  
  return closest(node, selector, true);
};
});
require.register("matthewmueller-uid/index.js", function(exports, require, module){
/**
 * Export `uid`
 */

module.exports = uid;

/**
 * Create a `uid`
 *
 * @param {String} len
 * @return {String} uid
 */

function uid(len) {
  len = len || 7;
  return Math.random().toString(35).substr(2, len);
}

});
require.register("editable-placeholder/index.js", function(exports, require, module){
/**
 * dependencies
 */

var classes = require('classes')
  , events = require('events')
  , raf = require('raf')
  , isKey = require('is-key');

/**
 * Export `Placeholder`
 */

module.exports = Placeholder;

/**
 * Initialize a new `Placeholder`.
 *
 * @param {Element} el
 * @param {String} str
 * @param {Element} editor 
 */

function Placeholder(el, str, editor){
  if (!(this instanceof Placeholder)) return new Placeholder(el, str, editor);
  this.classes = classes(el);
  this.events = events(editor || el, this);
  this.editor = editor;
  this.el = el;
  this.str = str;
  this.place();
}

/**
 * Place the placeholder.
 *
 * @return {Placeholder}
 */

Placeholder.prototype.place = function(){
  if (this._placed || this.contents()) return;
  this.classes.add('editable-placeholder');
  this.el.textContent = this.str;
  this.placeholderEvents = events(this.editor || this.el, this);
  this.placeholderEvents.bind('keydown', 'disableArrowKeys');
  this.bind();
  this._placed = true;
  return this;
};

/**
 * Unplace placeholder.
 *
 * @return {Placeholder}
 */

Placeholder.prototype.unplace = function(){
  this.classes.remove('editable-placeholder');
  this.placeholderEvents.unbind();
  this.el.textContent = '';
  this._placed = false;
  this.events.unbind();
  this.blur = events(this.editor || this.el, this);
  this.blur.bind('blur');
  return this;
};

Placeholder.prototype.onblur = function(){
  if (this.contents()) return;
  this.place();
  this.blur.unbind();
};

/**
 * Check if the placeholder is placed.
 *
 * @return {Placeholder}
 */

Placeholder.prototype.placed = function(){
  return this.classes.has('editable-placeholder')
    && this.str == this.contents();
};

/**
 * Bind internal events.
 *
 * @return {Placeholder}
 */

Placeholder.prototype.bind = function(){
  this.events.bind('keyup', 'onkeydown');
  this.events.bind('paste', 'onkeydown');
  this.events.bind('mousedown');
  this.events.bind('keydown');
  return this;
};

/**
 * Unbind internal events.
 *
 * @return {Placeholder}
 */

Placeholder.prototype.unbind = function(){
  this.events.unbind();
  return this;
};

/**
 * Get inner contents.
 *
 * @return {String}
 */

Placeholder.prototype.contents = function(){
  return this.editor ? this.editor.textContent.trim() : this.el.textContent;
};

/**
 * on-mousedown
 */

Placeholder.prototype.onmousedown = function(e){
  if (!this.placed()) return;
  var sel = window.getSelection();
  var range = document.createRange();
  range.setStart(this.el, 0);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
  e.preventDefault();
  this.el.focus();
};

/**
 * on-keyup
 */

Placeholder.prototype.onkeydown = function(e){
  var self = this;
  var id;


  // unplace
  if (this.placed()) this.unplace();

  // placeholder
  id = raf(function(){
    raf.cancel(id);
    if ('' != self.contents()) return;
    self.place();
  });
};

Placeholder.prototype.disableArrowKeys = function(e){
  if (isKey(e, ['left', 'up', 'down', 'right'])){
    e.preventDefault();
  }
};

});
require.register("editable-view/index.js", function(exports, require, module){
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
});
require.register("redact/index.js", function(exports, require, module){
var Popover = require('redact-popover');
var inherit = require('inherit');
var dom = require('dom');

module.exports = Redact;

function Redact(el){
  Popover.call(this, el);
  this.tip.on('show', this.determineState.bind(this));
}

inherit(Redact, Popover);

Redact.prototype.determineState = function(){
  // this should be more fine-grained because
  // not all of our options will be queryStateAble
  
  // you will want to querystate for some things.
  // others you will need to use the 'cursorWithin'
  
  for (var key in this.options) {
    if (document.queryCommandState(key)){
      this.activate(key);
    } else {
      this.deactivate(key);
    }
  }
}

Redact.prototype.activate = function(key){
  dom(this.options[key]).addClass('active');
};

Redact.prototype.deactivate = function(key){
  dom(this.options[key]).removeClass('active');
};
});
require.register("component-create-element/index.js", function(exports, require, module){
module.exports = createElement
createElement.openingTag = openingTag
createElement.closingTag = closingTag
createElement.attributes = createAttributes
var selfClosingTags = createElement.selfClosingTags = {
  meta: true,
  img: true,
  link: true,
  input: true,
  source: true,
  area: true,
  base: true,
  col: true,
  br: true,
  hr: true
}

/*

  tagName [string]
  attributes [object] (optional)
  block [string || function] (optional)

*/
function createElement(tagName, attributes, block) {
  if (~['function', 'string'].indexOf(typeof attributes)) {
    block = attributes
    attributes = null
  }

  return openingTag(tagName, attributes) +
    (block ? (typeof block === 'function' ? block.call(this, '') : block) : '') +
    (block || !selfClosingTags[tagName] ? closingTag(tagName) : '')
}

function openingTag(tagName, attributes) {
  return '<' + tagName +
    (attributes ? createAttributes(attributes) : '') +
    '>'
}

function closingTag(tagName) {
  return '</' + tagName + '>'
}

/*

  attributes [object]

    [string] : [string || array of strings || object of booleans || boolean]

  result will have a leading space

*/
function createAttributes(attributes) {
  var buf = ''

  Object.keys(attributes).forEach(function (attribute) {
    var value = attributes[attribute]
    if (!value && value !== '') return;

    value = Array.isArray(value) ? validValues(value)
      : Object(value) === value ? validKeys(value)
      : value
    if (!value && value !== '') return;

    buf += ' ' + attribute
    if (value !== true) buf += '="' + value + '"';
  })

  return buf
}

function validValues(array) {
  return array.filter(Boolean).join(' ')
}

function validKeys(object) {
  return Object.keys(object).filter(function (key) {
    return object[key]
  }).join(' ')
}

});
require.register("bmcmahen-string-splice/index.js", function(exports, require, module){
module.exports = function(str, i, i2, substr){
  return str.substr(0, i) + substr + str.substr(i2);
};
});
require.register("notes/index.js", function(exports, require, module){

module.exports = function(el){
  // Ensure that we don't have multiple paragraphs selected
  // We would probably call this when showing the popover to
  // simply grey out 'Note'.
  if (contains('p')) {
    console.log('multiple paragraphs... not allowed!');
    return false;
  }

  if (contains('span')) {
    console.log('overlapping!');
    return false;
  }

  var el = document.createElement('span');
  el.setAttribute('data-id', 'bacon');
  el.id = 'somethingorother';
  wrapWith(el);
}


var selection = window.getSelection();

function wrapWith(element){
  if (selection.rangeCount) {
    var range = selection.getRangeAt(0).cloneRange();
    element.appendChild(range.extractContents());
    range.insertNode(element);
    range.selectNode(element);
   
    // Restore ranges
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

function contains(sel){
  var r = selection.getRangeAt(0);
  var dummy = document.createElement('div');
  dummy.appendChild(r.cloneContents());
  return dummy.querySelector(sel);
}

});
require.register("range/index.js", function(exports, require, module){
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
});
require.register("bmcmahen-within-selection/index.js", function(exports, require, module){
var matches = require('matches-selector');

var NODETYPE_TEXT_NODE = 3;

function isMatch(node, selector){
  return node.nodeType !== 3 && matches(node, selector);
}

module.exports = function(selector){
  var range, selection, ancestor, all;
  var nodes = [];


  // Good browsers
  if (window.getSelection) {
    
    selection = window.getSelection();
    range = selection.getRangeAt(0);
    nodes = [];

    ancestor = range.commonAncestorContainer;
    if (ancestor.nodeType === NODETYPE_TEXT_NODE) {
      return nodes;
    }

    all = ancestor.getElementsByTagName('*');

    for (var i = 0, len = all.length; i < len; i++) {
      var el = all[i];
      if (selection.containsNode(el, true)){
        if (selector) {
          if (isMatch(el, selector)) {
            nodes.push(el);
          }
        } else {
          nodes.push(el); 
        }
      }
    }

    return nodes;

  // Older IE
  } else if (document.selection){
    // Give prayers.
    // Eventually do something like this:
    // http://stackoverflow.com/a/5801903/1198166
  }
};
});
require.register("component-bus/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var Emitter = require('emitter');

/**
 * Expose the event bus.
 */

module.exports = new Emitter;
});
require.register("paragraph/index.js", function(exports, require, module){
// Dependencies
var uid = require('uid');
var type = require('type');
var dom = require('dom');
var bus = require('bus');
var selection = window.getSelection();
var events = require('events');
var selectionRange = require('selection-range');
var inherit = require('inherit');

// Local
var Range = require('range');

// Export
module.exports = Paragraph;

/**
 * Paragraph Constructor
 * 
 * @param {Element|Text} content 
 * @param {Array} notes 
 */

function Paragraph(content, name, el){
  if (!(this instanceof Paragraph)) {
    return new Paragraph(content, name, el);
  }
  if (el) {
    this.$el = dom(el);
    this.el = el;
    this.id = this.$el.name() || name || uid(4);
    return;
  }
  this.id = name || uid(4);
  this.$el = dom('<p></p>').name(this.id);
  this.el = this.$el[0];
  if (content) this.$el.append(dom(content));
  else this.empty();
  bus.emit('add paragraph');
}

inherit(Paragraph, Range);

/**
 * Remove the paragraph from the DOM
 * 
 * @return {Paragraph} 
 */

Paragraph.prototype.remove = function(){
  bus.emit('remove paragraph', this.id, this);
  bus.emit('remove paragraph:'+ this.id, this);
  this.$el.remove();
  return this;
};


/**
 * When our element is empty, we need to add
 * a placeholder to prevent weirdness.
 * xxx -> tie this into placeholder, so if we have a
 * placeholder put int placeholder text instead.
 * 
 * @return {Paragraph} 
 */

Paragraph.prototype.empty = function(){
  this.$el.html('<br> ');
  this.empty_status = true;
  return this;
};

/**
 * Determine if our paragraph is empty.
 * 
 * @return {Boolean}
 */

Paragraph.prototype.isEmpty = function(){
  return !this.$el.text().trim();
};


/**
 * Insert this paragraph after a specified element.
 * 
 * @param  {Element} p 
 * @return {Paragraph}   
 */

Paragraph.prototype.insertAfter = function(p){
  this.$el.insertAfter(p);
  return this;
};

/**
 * Mark this paragraph as an ingredient.
 * 
 * @return {Paragraph} 
 */

Paragraph.prototype.makeIngredient = function(){
  this.$el.addClass('ingredient');
  this.isIngredient = true;
  return this;
};

/**
 * Mark this paragraph as NOT an ingredient.
 * 
 * @return {Paragraph} 
 */

Paragraph.prototype.removeIngredient = function(){
  this.$el.removeClass('ingredient');
  this.isIngredient = false;
  return this;
};



});
require.register("paragraphs/index.js", function(exports, require, module){
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


});
require.register("history/index.js", function(exports, require, module){
var Emitter = require('emitter');

/**
 * Expose `History`.
 */

module.exports = History;

/**
 * A browser history imitation.
 *
 * @return {History}
 * @api public
 */

function History(){
  if (!(this instanceof History)) return new History();
  this.steps = [];
  this.i = 0;
}

Emitter(History.prototype);

/**
 * Go to `step`.
 *
 * @param {Object} step
 * @return {History}
 * @api public
 */


History.prototype.add = function(step, stay){
  this.steps.splice(this.i + 1, this.steps.length - this.i);
  this.steps.push(step);
  if (!stay) this.i = this.steps.length - 1;
  return this;
};

/**
 * Go back.
 *
 * @return {History}
 * @api public
 */

History.prototype.back = function(){
  if (this.i <= 0) return;
  this.i--;
  return this;
};

/**
 * Go forward.
 *
 * @return {History}
 * @api public
 */

History.prototype.forward = function(){
  if (this.i >= this.steps.length -1) return;
  this.i++;
  return this;
};

/**
 * Get current `step`.
 *
 * @return {Object}
 * @api public
 */

History.prototype.current = function(){
  return this.steps[this.i];
};
});
require.register("editor/index.js", function(exports, require, module){
var transit = require('transit');
var dom = require('dom');

var Editor = require('./editor');
var Title = require('./title');

transit('/', renderEditor).out(destroy);
transit('/:id', loadDocument, renderEditor).out(destroy);

function loadDocument(ctx, next){
  // we should preload docs anyway
}

function renderEditor(ctx, next){
  var title = new Title();
  var editor = new Editor();
  dom('#app')
    .empty()
    .append(title.$el)
    .append(editor.$el);
  next();
}

function destroy(ctx, next){
  console.log(destroy);
}
});
require.register("editor/editor.js", function(exports, require, module){
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



});
require.register("editor/title.js", function(exports, require, module){
// Local
var Editable = require('editable-view');
var View = require('view');

// Template
var template = require('./templates/title.html');


module.exports = Title;


/**
 * Title
 * 
 * @param {Document} doc 
 */

function Title(doc){
  View.call(this, template);
  Editable.call(this, this.$el[0]);

  this.placeholder('Title');
  this.enableEditing();
  this.bindEvents();
}

View(Title);
Editable(Title);

/**
 * Bind appropriate events.
 * 
 * @return {Title} 
 */

Title.prototype.bindEvents = function(){
  this.on('paste', this.bound('onpaste'));
  this.on('enter', this.bound('onenter'));
  this.bind('keypress', 'onkeypress');
  return this;
}

/**
 * Listen for toggle events.
 * 
 * @param  {String} name 
 * @param  {Element} el 
 * @return {Title}   
 */

Title.prototype.ontoggle = function(name, el){
  if (name === 'note'){
    notes(this.$el[0]);
    return;
  }
  this.execute(name);
};

Title.prototype.onenter = function(e){
  e.preventDefault();
};

Title.prototype.onpaste = function(e){
  // allow paste, but remove any formatting!
  e.preventDefault();
};

Title.prototype.onkeypress = function(e){
  if (this.$el.text().length > 70 && window.getSelection().isCollapsed){
    e.preventDefault();
  }
};


});
require.register("db/index.js", function(exports, require, module){
var mydb = require('mydb');
var url = '127.0.0.1:3000';
var db = module.exports = mydb(url);

// preload our docs
var docs = window.mydb_preload || [];
docs.forEach(db.preload, db);
});
require.register("boot/index.js", function(exports, require, module){
var transit = require('transit');

// Locals
require('db');
require('editor');

transit.listen('/');
transit.start();


});





























































































































require.register("editor/templates/editor.html", function(exports, require, module){
module.exports = '<div id=\'editor\'></div>';
});
require.register("editor/templates/title.html", function(exports, require, module){
module.exports = '<h1 id=\'title\'></h1>';
});

require.alias("yields-redact-popover/index.js", "wordspur/deps/redact-popover/index.js");
require.alias("yields-redact-popover/index.js", "wordspur/deps/redact-popover/index.js");
require.alias("yields-redact-popover/index.js", "redact-popover/index.js");
require.alias("yields-get-selected-text/index.js", "yields-redact-popover/deps/get-selected-text/index.js");
require.alias("yields-get-selected-text/index.js", "yields-redact-popover/deps/get-selected-text/index.js");
require.alias("yields-get-selected-text/index.js", "yields-get-selected-text/index.js");
require.alias("component-emitter/index.js", "yields-redact-popover/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-events/index.js", "yields-redact-popover/deps/events/index.js");
require.alias("component-event/index.js", "component-events/deps/event/index.js");

require.alias("component-delegate/index.js", "component-events/deps/delegate/index.js");
require.alias("component-matches-selector/index.js", "component-delegate/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("component-trim/index.js", "yields-redact-popover/deps/trim/index.js");

require.alias("component-tip/index.js", "yields-redact-popover/deps/tip/index.js");
require.alias("component-tip/template.js", "yields-redact-popover/deps/tip/template.js");
require.alias("component-emitter/index.js", "component-tip/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-query/index.js", "component-tip/deps/query/index.js");

require.alias("component-events/index.js", "component-tip/deps/events/index.js");
require.alias("component-event/index.js", "component-events/deps/event/index.js");

require.alias("component-delegate/index.js", "component-events/deps/delegate/index.js");
require.alias("component-matches-selector/index.js", "component-delegate/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("component-domify/index.js", "component-tip/deps/domify/index.js");

require.alias("component-classes/index.js", "component-tip/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-css/index.js", "component-tip/deps/css/index.js");
require.alias("component-css/lib/css.js", "component-tip/deps/css/lib/css.js");
require.alias("component-css/lib/prop.js", "component-tip/deps/css/lib/prop.js");
require.alias("component-css/lib/swap.js", "component-tip/deps/css/lib/swap.js");
require.alias("component-css/lib/style.js", "component-tip/deps/css/lib/style.js");
require.alias("component-css/lib/hooks.js", "component-tip/deps/css/lib/hooks.js");
require.alias("component-css/lib/styles.js", "component-tip/deps/css/lib/styles.js");
require.alias("component-css/lib/vendor.js", "component-tip/deps/css/lib/vendor.js");
require.alias("component-css/lib/support.js", "component-tip/deps/css/lib/support.js");
require.alias("component-css/lib/computed.js", "component-tip/deps/css/lib/computed.js");
require.alias("component-css/index.js", "component-tip/deps/css/index.js");
require.alias("visionmedia-debug/index.js", "component-css/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "component-css/deps/debug/debug.js");

require.alias("ianstormtaylor-to-camel-case/index.js", "component-css/deps/to-camel-case/index.js");
require.alias("ianstormtaylor-to-space-case/index.js", "ianstormtaylor-to-camel-case/deps/to-space-case/index.js");
require.alias("ianstormtaylor-to-no-case/index.js", "ianstormtaylor-to-space-case/deps/to-no-case/index.js");

require.alias("component-within-document/index.js", "component-css/deps/within-document/index.js");

require.alias("component-css/index.js", "component-css/index.js");
require.alias("timoxley-offset/index.js", "component-tip/deps/offset/index.js");
require.alias("timoxley-dom-support/index.js", "timoxley-offset/deps/dom-support/index.js");
require.alias("enyo-domready/index.js", "timoxley-dom-support/deps/domready/index.js");

require.alias("timoxley-assert/index.js", "timoxley-dom-support/deps/assert/index.js");
require.alias("component-inherit/index.js", "timoxley-assert/deps/inherit/index.js");

require.alias("component-within-document/index.js", "timoxley-offset/deps/within-document/index.js");

require.alias("yields-slug/index.js", "yields-redact-popover/deps/slug/index.js");

require.alias("bmcmahen-monitor-text-selection/index.js", "yields-redact-popover/deps/monitor-text-selection/index.js");
require.alias("bmcmahen-monitor-text-selection/index.js", "yields-redact-popover/deps/monitor-text-selection/index.js");
require.alias("yields-on-select/index.js", "bmcmahen-monitor-text-selection/deps/on-select/index.js");
require.alias("yields-on-select/index.js", "bmcmahen-monitor-text-selection/deps/on-select/index.js");
require.alias("yields-get-selected-text/index.js", "yields-on-select/deps/get-selected-text/index.js");
require.alias("yields-get-selected-text/index.js", "yields-on-select/deps/get-selected-text/index.js");
require.alias("yields-get-selected-text/index.js", "yields-get-selected-text/index.js");
require.alias("bmcmahen-modifier/index.js", "yields-on-select/deps/modifier/index.js");
require.alias("bmcmahen-modifier/index.js", "yields-on-select/deps/modifier/index.js");
require.alias("bmcmahen-modifier/index.js", "bmcmahen-modifier/index.js");
require.alias("component-event/index.js", "yields-on-select/deps/event/index.js");

require.alias("component-raf/index.js", "yields-on-select/deps/raf/index.js");

require.alias("yields-on-select/index.js", "yields-on-select/index.js");
require.alias("component-emitter/index.js", "bmcmahen-monitor-text-selection/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("bmcmahen-on-deselect/index.js", "bmcmahen-monitor-text-selection/deps/on-deselect/index.js");
require.alias("bmcmahen-on-deselect/index.js", "bmcmahen-monitor-text-selection/deps/on-deselect/index.js");
require.alias("component-event/index.js", "bmcmahen-on-deselect/deps/event/index.js");

require.alias("component-raf/index.js", "bmcmahen-on-deselect/deps/raf/index.js");

require.alias("bmcmahen-text-selection/index.js", "bmcmahen-on-deselect/deps/text-selection/index.js");
require.alias("bmcmahen-text-selection/index.js", "bmcmahen-on-deselect/deps/text-selection/index.js");
require.alias("bmcmahen-text-selection/index.js", "bmcmahen-text-selection/index.js");
require.alias("bmcmahen-modifier/index.js", "bmcmahen-on-deselect/deps/modifier/index.js");
require.alias("bmcmahen-modifier/index.js", "bmcmahen-on-deselect/deps/modifier/index.js");
require.alias("bmcmahen-modifier/index.js", "bmcmahen-modifier/index.js");
require.alias("bmcmahen-on-deselect/index.js", "bmcmahen-on-deselect/index.js");
require.alias("bmcmahen-monitor-text-selection/index.js", "bmcmahen-monitor-text-selection/index.js");
require.alias("yields-redact-popover/index.js", "yields-redact-popover/index.js");
require.alias("boot/index.js", "wordspur/deps/boot/index.js");
require.alias("boot/index.js", "wordspur/deps/boot/index.js");
require.alias("boot/index.js", "boot/index.js");
require.alias("bmcmahen-mydb-client/index.js", "boot/deps/mydb/index.js");
require.alias("bmcmahen-mydb-client/document.js", "boot/deps/mydb/document.js");
require.alias("learnboost-engine.io-client/lib/index.js", "bmcmahen-mydb-client/deps/engine.io/lib/index.js");
require.alias("learnboost-engine.io-client/lib/socket.js", "bmcmahen-mydb-client/deps/engine.io/lib/socket.js");
require.alias("learnboost-engine.io-client/lib/transport.js", "bmcmahen-mydb-client/deps/engine.io/lib/transport.js");
require.alias("learnboost-engine.io-client/lib/emitter.js", "bmcmahen-mydb-client/deps/engine.io/lib/emitter.js");
require.alias("learnboost-engine.io-client/lib/util.js", "bmcmahen-mydb-client/deps/engine.io/lib/util.js");
require.alias("learnboost-engine.io-client/lib/transports/index.js", "bmcmahen-mydb-client/deps/engine.io/lib/transports/index.js");
require.alias("learnboost-engine.io-client/lib/transports/polling.js", "bmcmahen-mydb-client/deps/engine.io/lib/transports/polling.js");
require.alias("learnboost-engine.io-client/lib/transports/polling-xhr.js", "bmcmahen-mydb-client/deps/engine.io/lib/transports/polling-xhr.js");
require.alias("learnboost-engine.io-client/lib/transports/polling-jsonp.js", "bmcmahen-mydb-client/deps/engine.io/lib/transports/polling-jsonp.js");
require.alias("learnboost-engine.io-client/lib/transports/websocket.js", "bmcmahen-mydb-client/deps/engine.io/lib/transports/websocket.js");
require.alias("learnboost-engine.io-client/lib/transports/flashsocket.js", "bmcmahen-mydb-client/deps/engine.io/lib/transports/flashsocket.js");
require.alias("learnboost-engine.io-client/lib/index.js", "bmcmahen-mydb-client/deps/engine.io/index.js");
require.alias("component-emitter/index.js", "learnboost-engine.io-client/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-indexof/index.js", "learnboost-engine.io-client/deps/indexof/index.js");

require.alias("component-global/index.js", "learnboost-engine.io-client/deps/global/index.js");

require.alias("component-has-cors/index.js", "learnboost-engine.io-client/deps/has-cors/index.js");
require.alias("component-has-cors/index.js", "learnboost-engine.io-client/deps/has-cors/index.js");
require.alias("component-global/index.js", "component-has-cors/deps/global/index.js");

require.alias("component-has-cors/index.js", "component-has-cors/index.js");
require.alias("component-ws/index.js", "learnboost-engine.io-client/deps/ws/index.js");
require.alias("component-ws/index.js", "learnboost-engine.io-client/deps/ws/index.js");
require.alias("component-global/index.js", "component-ws/deps/global/index.js");

require.alias("component-ws/index.js", "component-ws/index.js");
require.alias("LearnBoost-engine.io-protocol/lib/index.js", "learnboost-engine.io-client/deps/engine.io-parser/lib/index.js");
require.alias("LearnBoost-engine.io-protocol/lib/keys.js", "learnboost-engine.io-client/deps/engine.io-parser/lib/keys.js");
require.alias("LearnBoost-engine.io-protocol/lib/index.js", "learnboost-engine.io-client/deps/engine.io-parser/index.js");
require.alias("LearnBoost-engine.io-protocol/lib/index.js", "LearnBoost-engine.io-protocol/index.js");
require.alias("visionmedia-debug/index.js", "learnboost-engine.io-client/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "learnboost-engine.io-client/deps/debug/debug.js");

require.alias("learnboost-engine.io-client/lib/index.js", "learnboost-engine.io-client/index.js");
require.alias("cloudup-mongo-query/index.js", "bmcmahen-mydb-client/deps/mongo-query/index.js");
require.alias("cloudup-mongo-query/mods.js", "bmcmahen-mydb-client/deps/mongo-query/mods.js");
require.alias("cloudup-mongo-query/filter.js", "bmcmahen-mydb-client/deps/mongo-query/filter.js");
require.alias("cloudup-mongo-query/ops.js", "bmcmahen-mydb-client/deps/mongo-query/ops.js");
require.alias("component-type/index.js", "cloudup-mongo-query/deps/type/index.js");

require.alias("component-object/index.js", "cloudup-mongo-query/deps/object/index.js");

require.alias("visionmedia-debug/index.js", "cloudup-mongo-query/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "cloudup-mongo-query/deps/debug/debug.js");

require.alias("cloudup-dot/index.js", "cloudup-mongo-query/deps/dot/index.js");
require.alias("component-type/index.js", "cloudup-dot/deps/type/index.js");

require.alias("cloudup-mongo-eql/index.js", "cloudup-mongo-query/deps/mongo-eql/index.js");
require.alias("cloudup-mongo-eql/index.js", "cloudup-mongo-query/deps/mongo-eql/index.js");
require.alias("visionmedia-debug/index.js", "cloudup-mongo-eql/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "cloudup-mongo-eql/deps/debug/debug.js");

require.alias("component-type/index.js", "cloudup-mongo-eql/deps/type/index.js");

require.alias("cloudup-mongo-eql/index.js", "cloudup-mongo-eql/index.js");
require.alias("cloudup-dot/index.js", "bmcmahen-mydb-client/deps/dot/index.js");
require.alias("component-type/index.js", "cloudup-dot/deps/type/index.js");

require.alias("component-emitter/index.js", "bmcmahen-mydb-client/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-type/index.js", "bmcmahen-mydb-client/deps/type/index.js");

require.alias("component-clone/index.js", "bmcmahen-mydb-client/deps/clone/index.js");
require.alias("component-type/index.js", "component-clone/deps/type/index.js");

require.alias("component-json/index.js", "bmcmahen-mydb-client/deps/json/index.js");

require.alias("visionmedia-superagent/lib/client.js", "bmcmahen-mydb-client/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "bmcmahen-mydb-client/deps/superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("RedVentures-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");
require.alias("visionmedia-debug/index.js", "bmcmahen-mydb-client/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "bmcmahen-mydb-client/deps/debug/debug.js");

require.alias("bmcmahen-transit/index.js", "boot/deps/transit/index.js");
require.alias("bmcmahen-transit/lib/index.js", "boot/deps/transit/lib/index.js");
require.alias("bmcmahen-transit/lib/html5.js", "boot/deps/transit/lib/html5.js");
require.alias("bmcmahen-transit/lib/hash.js", "boot/deps/transit/lib/hash.js");
require.alias("bmcmahen-transit/lib/conversion.js", "boot/deps/transit/lib/conversion.js");
require.alias("bmcmahen-transit/lib/context.js", "boot/deps/transit/lib/context.js");
require.alias("bmcmahen-transit/lib/route.js", "boot/deps/transit/lib/route.js");
require.alias("bmcmahen-transit/index.js", "boot/deps/transit/index.js");
require.alias("component-emitter/index.js", "bmcmahen-transit/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-link-delegate/index.js", "bmcmahen-transit/deps/link-delegate/index.js");
require.alias("component-link-delegate/index.js", "bmcmahen-transit/deps/link-delegate/index.js");
require.alias("component-delegate/index.js", "component-link-delegate/deps/delegate/index.js");
require.alias("component-matches-selector/index.js", "component-delegate/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("component-url/index.js", "component-link-delegate/deps/url/index.js");

require.alias("component-link-delegate/index.js", "component-link-delegate/index.js");
require.alias("component-path-to-regexp/index.js", "bmcmahen-transit/deps/path-to-regexp/index.js");

require.alias("component-querystring/index.js", "bmcmahen-transit/deps/querystring/index.js");
require.alias("component-trim/index.js", "component-querystring/deps/trim/index.js");

require.alias("component-url/index.js", "bmcmahen-transit/deps/url/index.js");

require.alias("yields-stop/index.js", "bmcmahen-transit/deps/stop/index.js");

require.alias("yields-prevent/index.js", "bmcmahen-transit/deps/prevent/index.js");

require.alias("bmcmahen-transit/index.js", "bmcmahen-transit/index.js");
require.alias("editor/index.js", "boot/deps/editor/index.js");
require.alias("editor/editor.js", "boot/deps/editor/editor.js");
require.alias("editor/title.js", "boot/deps/editor/title.js");
require.alias("editor/index.js", "boot/deps/editor/index.js");

require.alias("yields-k/lib/index.js", "editor/deps/k/lib/index.js");
require.alias("yields-k/lib/proto.js", "editor/deps/k/lib/proto.js");
require.alias("yields-k/lib/index.js", "editor/deps/k/index.js");
require.alias("yields-k-sequence/index.js", "yields-k/deps/k-sequence/index.js");
require.alias("yields-k-sequence/index.js", "yields-k/deps/k-sequence/index.js");
require.alias("yields-keycode/index.js", "yields-k-sequence/deps/keycode/index.js");

require.alias("yields-k-sequence/index.js", "yields-k-sequence/index.js");
require.alias("yields-keycode/index.js", "yields-k/deps/keycode/index.js");

require.alias("component-event/index.js", "yields-k/deps/event/index.js");

require.alias("component-bind/index.js", "yields-k/deps/bind/index.js");

require.alias("component-os/index.js", "yields-k/deps/os/index.js");

require.alias("yields-k/lib/index.js", "yields-k/index.js");
require.alias("cristiandouce-tags-free/index.js", "editor/deps/tags-free/index.js");

require.alias("bmcmahen-transit/index.js", "editor/deps/transit/index.js");
require.alias("bmcmahen-transit/lib/index.js", "editor/deps/transit/lib/index.js");
require.alias("bmcmahen-transit/lib/html5.js", "editor/deps/transit/lib/html5.js");
require.alias("bmcmahen-transit/lib/hash.js", "editor/deps/transit/lib/hash.js");
require.alias("bmcmahen-transit/lib/conversion.js", "editor/deps/transit/lib/conversion.js");
require.alias("bmcmahen-transit/lib/context.js", "editor/deps/transit/lib/context.js");
require.alias("bmcmahen-transit/lib/route.js", "editor/deps/transit/lib/route.js");
require.alias("bmcmahen-transit/index.js", "editor/deps/transit/index.js");
require.alias("component-emitter/index.js", "bmcmahen-transit/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-link-delegate/index.js", "bmcmahen-transit/deps/link-delegate/index.js");
require.alias("component-link-delegate/index.js", "bmcmahen-transit/deps/link-delegate/index.js");
require.alias("component-delegate/index.js", "component-link-delegate/deps/delegate/index.js");
require.alias("component-matches-selector/index.js", "component-delegate/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("component-url/index.js", "component-link-delegate/deps/url/index.js");

require.alias("component-link-delegate/index.js", "component-link-delegate/index.js");
require.alias("component-path-to-regexp/index.js", "bmcmahen-transit/deps/path-to-regexp/index.js");

require.alias("component-querystring/index.js", "bmcmahen-transit/deps/querystring/index.js");
require.alias("component-trim/index.js", "component-querystring/deps/trim/index.js");

require.alias("component-url/index.js", "bmcmahen-transit/deps/url/index.js");

require.alias("yields-stop/index.js", "bmcmahen-transit/deps/stop/index.js");

require.alias("yields-prevent/index.js", "bmcmahen-transit/deps/prevent/index.js");

require.alias("bmcmahen-transit/index.js", "bmcmahen-transit/index.js");
require.alias("component-dom/index.js", "editor/deps/dom/index.js");
require.alias("component-dom/lib/traverse.js", "editor/deps/dom/lib/traverse.js");
require.alias("component-dom/lib/manipulate.js", "editor/deps/dom/lib/manipulate.js");
require.alias("component-dom/lib/classes.js", "editor/deps/dom/lib/classes.js");
require.alias("component-dom/lib/attributes.js", "editor/deps/dom/lib/attributes.js");
require.alias("component-dom/lib/events.js", "editor/deps/dom/lib/events.js");
require.alias("component-event/index.js", "component-dom/deps/event/index.js");

require.alias("component-delegate/index.js", "component-dom/deps/delegate/index.js");
require.alias("component-matches-selector/index.js", "component-delegate/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("component-domify/index.js", "component-dom/deps/domify/index.js");

require.alias("component-classes/index.js", "component-dom/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-css/index.js", "component-dom/deps/css/index.js");
require.alias("component-css/lib/css.js", "component-dom/deps/css/lib/css.js");
require.alias("component-css/lib/prop.js", "component-dom/deps/css/lib/prop.js");
require.alias("component-css/lib/swap.js", "component-dom/deps/css/lib/swap.js");
require.alias("component-css/lib/style.js", "component-dom/deps/css/lib/style.js");
require.alias("component-css/lib/hooks.js", "component-dom/deps/css/lib/hooks.js");
require.alias("component-css/lib/styles.js", "component-dom/deps/css/lib/styles.js");
require.alias("component-css/lib/vendor.js", "component-dom/deps/css/lib/vendor.js");
require.alias("component-css/lib/support.js", "component-dom/deps/css/lib/support.js");
require.alias("component-css/lib/computed.js", "component-dom/deps/css/lib/computed.js");
require.alias("component-css/index.js", "component-dom/deps/css/index.js");
require.alias("visionmedia-debug/index.js", "component-css/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "component-css/deps/debug/debug.js");

require.alias("ianstormtaylor-to-camel-case/index.js", "component-css/deps/to-camel-case/index.js");
require.alias("ianstormtaylor-to-space-case/index.js", "ianstormtaylor-to-camel-case/deps/to-space-case/index.js");
require.alias("ianstormtaylor-to-no-case/index.js", "ianstormtaylor-to-space-case/deps/to-no-case/index.js");

require.alias("component-within-document/index.js", "component-css/deps/within-document/index.js");

require.alias("component-css/index.js", "component-css/index.js");
require.alias("component-value/index.js", "component-dom/deps/value/index.js");
require.alias("component-value/index.js", "component-dom/deps/value/index.js");
require.alias("component-type/index.js", "component-value/deps/type/index.js");

require.alias("component-value/index.js", "component-value/index.js");
require.alias("component-query/index.js", "component-dom/deps/query/index.js");

require.alias("component-matches-selector/index.js", "component-dom/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("yields-traverse/index.js", "component-dom/deps/traverse/index.js");
require.alias("yields-traverse/index.js", "component-dom/deps/traverse/index.js");
require.alias("component-matches-selector/index.js", "yields-traverse/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("yields-traverse/index.js", "yields-traverse/index.js");
require.alias("component-trim/index.js", "component-dom/deps/trim/index.js");

require.alias("yields-isArray/index.js", "component-dom/deps/isArray/index.js");

require.alias("component-to-function/index.js", "component-dom/deps/to-function/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("bmcmahen-view/index.js", "editor/deps/view/index.js");
require.alias("bmcmahen-view/index.js", "editor/deps/view/index.js");
require.alias("component-dom/index.js", "bmcmahen-view/deps/dom/index.js");
require.alias("component-dom/lib/traverse.js", "bmcmahen-view/deps/dom/lib/traverse.js");
require.alias("component-dom/lib/manipulate.js", "bmcmahen-view/deps/dom/lib/manipulate.js");
require.alias("component-dom/lib/classes.js", "bmcmahen-view/deps/dom/lib/classes.js");
require.alias("component-dom/lib/attributes.js", "bmcmahen-view/deps/dom/lib/attributes.js");
require.alias("component-dom/lib/events.js", "bmcmahen-view/deps/dom/lib/events.js");
require.alias("component-event/index.js", "component-dom/deps/event/index.js");

require.alias("component-delegate/index.js", "component-dom/deps/delegate/index.js");
require.alias("component-matches-selector/index.js", "component-delegate/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("component-domify/index.js", "component-dom/deps/domify/index.js");

require.alias("component-classes/index.js", "component-dom/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-css/index.js", "component-dom/deps/css/index.js");
require.alias("component-css/lib/css.js", "component-dom/deps/css/lib/css.js");
require.alias("component-css/lib/prop.js", "component-dom/deps/css/lib/prop.js");
require.alias("component-css/lib/swap.js", "component-dom/deps/css/lib/swap.js");
require.alias("component-css/lib/style.js", "component-dom/deps/css/lib/style.js");
require.alias("component-css/lib/hooks.js", "component-dom/deps/css/lib/hooks.js");
require.alias("component-css/lib/styles.js", "component-dom/deps/css/lib/styles.js");
require.alias("component-css/lib/vendor.js", "component-dom/deps/css/lib/vendor.js");
require.alias("component-css/lib/support.js", "component-dom/deps/css/lib/support.js");
require.alias("component-css/lib/computed.js", "component-dom/deps/css/lib/computed.js");
require.alias("component-css/index.js", "component-dom/deps/css/index.js");
require.alias("visionmedia-debug/index.js", "component-css/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "component-css/deps/debug/debug.js");

require.alias("ianstormtaylor-to-camel-case/index.js", "component-css/deps/to-camel-case/index.js");
require.alias("ianstormtaylor-to-space-case/index.js", "ianstormtaylor-to-camel-case/deps/to-space-case/index.js");
require.alias("ianstormtaylor-to-no-case/index.js", "ianstormtaylor-to-space-case/deps/to-no-case/index.js");

require.alias("component-within-document/index.js", "component-css/deps/within-document/index.js");

require.alias("component-css/index.js", "component-css/index.js");
require.alias("component-value/index.js", "component-dom/deps/value/index.js");
require.alias("component-value/index.js", "component-dom/deps/value/index.js");
require.alias("component-type/index.js", "component-value/deps/type/index.js");

require.alias("component-value/index.js", "component-value/index.js");
require.alias("component-query/index.js", "component-dom/deps/query/index.js");

require.alias("component-matches-selector/index.js", "component-dom/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("yields-traverse/index.js", "component-dom/deps/traverse/index.js");
require.alias("yields-traverse/index.js", "component-dom/deps/traverse/index.js");
require.alias("component-matches-selector/index.js", "yields-traverse/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("yields-traverse/index.js", "yields-traverse/index.js");
require.alias("component-trim/index.js", "component-dom/deps/trim/index.js");

require.alias("yields-isArray/index.js", "component-dom/deps/isArray/index.js");

require.alias("component-to-function/index.js", "component-dom/deps/to-function/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("component-emitter/index.js", "bmcmahen-view/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("anthonyshort-emitter-manager/index.js", "bmcmahen-view/deps/emitter-manager/index.js");
require.alias("anthonyshort-map/index.js", "anthonyshort-emitter-manager/deps/map/index.js");

require.alias("component-inherit/index.js", "bmcmahen-view/deps/inherit/index.js");

require.alias("component-reactive/lib/index.js", "bmcmahen-view/deps/reactive/lib/index.js");
require.alias("component-reactive/lib/utils.js", "bmcmahen-view/deps/reactive/lib/utils.js");
require.alias("component-reactive/lib/text-binding.js", "bmcmahen-view/deps/reactive/lib/text-binding.js");
require.alias("component-reactive/lib/attr-binding.js", "bmcmahen-view/deps/reactive/lib/attr-binding.js");
require.alias("component-reactive/lib/binding.js", "bmcmahen-view/deps/reactive/lib/binding.js");
require.alias("component-reactive/lib/bindings.js", "bmcmahen-view/deps/reactive/lib/bindings.js");
require.alias("component-reactive/lib/adapter.js", "bmcmahen-view/deps/reactive/lib/adapter.js");
require.alias("component-reactive/lib/index.js", "bmcmahen-view/deps/reactive/index.js");
require.alias("component-format-parser/index.js", "component-reactive/deps/format-parser/index.js");

require.alias("component-props/index.js", "component-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("visionmedia-debug/index.js", "component-reactive/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "component-reactive/deps/debug/debug.js");

require.alias("component-event/index.js", "component-reactive/deps/event/index.js");

require.alias("component-classes/index.js", "component-reactive/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-query/index.js", "component-reactive/deps/query/index.js");

require.alias("yields-carry/index.js", "component-reactive/deps/carry/index.js");
require.alias("yields-carry/index.js", "component-reactive/deps/carry/index.js");
require.alias("yields-merge-attrs/index.js", "yields-carry/deps/merge-attrs/index.js");
require.alias("yields-merge-attrs/index.js", "yields-carry/deps/merge-attrs/index.js");
require.alias("yields-merge-attrs/index.js", "yields-merge-attrs/index.js");
require.alias("component-classes/index.js", "yields-carry/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("yields-uniq/index.js", "yields-carry/deps/uniq/index.js");
require.alias("component-indexof/index.js", "yields-uniq/deps/indexof/index.js");

require.alias("yields-carry/index.js", "yields-carry/index.js");
require.alias("component-reactive/lib/index.js", "component-reactive/index.js");
require.alias("bmcmahen-view/index.js", "bmcmahen-view/index.js");

require.alias("component-keyname/index.js", "editor/deps/keyname/index.js");

require.alias("component-emitter/index.js", "editor/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("bmcmahen-selection-range/index.js", "editor/deps/selection-range/index.js");
require.alias("bmcmahen-selection-range/index.js", "editor/deps/selection-range/index.js");
require.alias("bmcmahen-selection-range/index.js", "bmcmahen-selection-range/index.js");
require.alias("editable-view/index.js", "editor/deps/editable-view/index.js");
require.alias("editable-view/index.js", "editor/deps/editable-view/index.js");
require.alias("component-emitter/index.js", "editable-view/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("bmcmahen-auto-save/index.js", "editable-view/deps/auto-save/index.js");
require.alias("bmcmahen-auto-save/index.js", "editable-view/deps/auto-save/index.js");
require.alias("bmcmahen-auto-save/index.js", "bmcmahen-auto-save/index.js");
require.alias("bmcmahen-selection-range/index.js", "editable-view/deps/selection-range/index.js");
require.alias("bmcmahen-selection-range/index.js", "editable-view/deps/selection-range/index.js");
require.alias("bmcmahen-selection-range/index.js", "bmcmahen-selection-range/index.js");
require.alias("bmcmahen-is-key/index.js", "editable-view/deps/is-key/index.js");
require.alias("bmcmahen-is-key/index.js", "editable-view/deps/is-key/index.js");
require.alias("yields-keycode/index.js", "bmcmahen-is-key/deps/keycode/index.js");

require.alias("bmcmahen-is-key/index.js", "bmcmahen-is-key/index.js");
require.alias("bmcmahen-view/index.js", "editable-view/deps/view/index.js");
require.alias("bmcmahen-view/index.js", "editable-view/deps/view/index.js");
require.alias("component-dom/index.js", "bmcmahen-view/deps/dom/index.js");
require.alias("component-dom/lib/traverse.js", "bmcmahen-view/deps/dom/lib/traverse.js");
require.alias("component-dom/lib/manipulate.js", "bmcmahen-view/deps/dom/lib/manipulate.js");
require.alias("component-dom/lib/classes.js", "bmcmahen-view/deps/dom/lib/classes.js");
require.alias("component-dom/lib/attributes.js", "bmcmahen-view/deps/dom/lib/attributes.js");
require.alias("component-dom/lib/events.js", "bmcmahen-view/deps/dom/lib/events.js");
require.alias("component-event/index.js", "component-dom/deps/event/index.js");

require.alias("component-delegate/index.js", "component-dom/deps/delegate/index.js");
require.alias("component-matches-selector/index.js", "component-delegate/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("component-domify/index.js", "component-dom/deps/domify/index.js");

require.alias("component-classes/index.js", "component-dom/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-css/index.js", "component-dom/deps/css/index.js");
require.alias("component-css/lib/css.js", "component-dom/deps/css/lib/css.js");
require.alias("component-css/lib/prop.js", "component-dom/deps/css/lib/prop.js");
require.alias("component-css/lib/swap.js", "component-dom/deps/css/lib/swap.js");
require.alias("component-css/lib/style.js", "component-dom/deps/css/lib/style.js");
require.alias("component-css/lib/hooks.js", "component-dom/deps/css/lib/hooks.js");
require.alias("component-css/lib/styles.js", "component-dom/deps/css/lib/styles.js");
require.alias("component-css/lib/vendor.js", "component-dom/deps/css/lib/vendor.js");
require.alias("component-css/lib/support.js", "component-dom/deps/css/lib/support.js");
require.alias("component-css/lib/computed.js", "component-dom/deps/css/lib/computed.js");
require.alias("component-css/index.js", "component-dom/deps/css/index.js");
require.alias("visionmedia-debug/index.js", "component-css/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "component-css/deps/debug/debug.js");

require.alias("ianstormtaylor-to-camel-case/index.js", "component-css/deps/to-camel-case/index.js");
require.alias("ianstormtaylor-to-space-case/index.js", "ianstormtaylor-to-camel-case/deps/to-space-case/index.js");
require.alias("ianstormtaylor-to-no-case/index.js", "ianstormtaylor-to-space-case/deps/to-no-case/index.js");

require.alias("component-within-document/index.js", "component-css/deps/within-document/index.js");

require.alias("component-css/index.js", "component-css/index.js");
require.alias("component-value/index.js", "component-dom/deps/value/index.js");
require.alias("component-value/index.js", "component-dom/deps/value/index.js");
require.alias("component-type/index.js", "component-value/deps/type/index.js");

require.alias("component-value/index.js", "component-value/index.js");
require.alias("component-query/index.js", "component-dom/deps/query/index.js");

require.alias("component-matches-selector/index.js", "component-dom/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("yields-traverse/index.js", "component-dom/deps/traverse/index.js");
require.alias("yields-traverse/index.js", "component-dom/deps/traverse/index.js");
require.alias("component-matches-selector/index.js", "yields-traverse/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("yields-traverse/index.js", "yields-traverse/index.js");
require.alias("component-trim/index.js", "component-dom/deps/trim/index.js");

require.alias("yields-isArray/index.js", "component-dom/deps/isArray/index.js");

require.alias("component-to-function/index.js", "component-dom/deps/to-function/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("component-emitter/index.js", "bmcmahen-view/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("anthonyshort-emitter-manager/index.js", "bmcmahen-view/deps/emitter-manager/index.js");
require.alias("anthonyshort-map/index.js", "anthonyshort-emitter-manager/deps/map/index.js");

require.alias("component-inherit/index.js", "bmcmahen-view/deps/inherit/index.js");

require.alias("component-reactive/lib/index.js", "bmcmahen-view/deps/reactive/lib/index.js");
require.alias("component-reactive/lib/utils.js", "bmcmahen-view/deps/reactive/lib/utils.js");
require.alias("component-reactive/lib/text-binding.js", "bmcmahen-view/deps/reactive/lib/text-binding.js");
require.alias("component-reactive/lib/attr-binding.js", "bmcmahen-view/deps/reactive/lib/attr-binding.js");
require.alias("component-reactive/lib/binding.js", "bmcmahen-view/deps/reactive/lib/binding.js");
require.alias("component-reactive/lib/bindings.js", "bmcmahen-view/deps/reactive/lib/bindings.js");
require.alias("component-reactive/lib/adapter.js", "bmcmahen-view/deps/reactive/lib/adapter.js");
require.alias("component-reactive/lib/index.js", "bmcmahen-view/deps/reactive/index.js");
require.alias("component-format-parser/index.js", "component-reactive/deps/format-parser/index.js");

require.alias("component-props/index.js", "component-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("visionmedia-debug/index.js", "component-reactive/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "component-reactive/deps/debug/debug.js");

require.alias("component-event/index.js", "component-reactive/deps/event/index.js");

require.alias("component-classes/index.js", "component-reactive/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-query/index.js", "component-reactive/deps/query/index.js");

require.alias("yields-carry/index.js", "component-reactive/deps/carry/index.js");
require.alias("yields-carry/index.js", "component-reactive/deps/carry/index.js");
require.alias("yields-merge-attrs/index.js", "yields-carry/deps/merge-attrs/index.js");
require.alias("yields-merge-attrs/index.js", "yields-carry/deps/merge-attrs/index.js");
require.alias("yields-merge-attrs/index.js", "yields-merge-attrs/index.js");
require.alias("component-classes/index.js", "yields-carry/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("yields-uniq/index.js", "yields-carry/deps/uniq/index.js");
require.alias("component-indexof/index.js", "yields-uniq/deps/indexof/index.js");

require.alias("yields-carry/index.js", "yields-carry/index.js");
require.alias("component-reactive/lib/index.js", "component-reactive/index.js");
require.alias("bmcmahen-view/index.js", "bmcmahen-view/index.js");
require.alias("component-inherit/index.js", "editable-view/deps/inherit/index.js");

require.alias("bmcmahen-cursor-within/index.js", "editable-view/deps/cursor-within/index.js");
require.alias("bmcmahen-cursor-within/index.js", "editable-view/deps/cursor-within/index.js");
require.alias("discore-closest/index.js", "bmcmahen-cursor-within/deps/closest/index.js");
require.alias("discore-closest/index.js", "bmcmahen-cursor-within/deps/closest/index.js");
require.alias("component-matches-selector/index.js", "discore-closest/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("discore-closest/index.js", "discore-closest/index.js");
require.alias("bmcmahen-cursor-within/index.js", "bmcmahen-cursor-within/index.js");
require.alias("component-dom/index.js", "editable-view/deps/dom/index.js");
require.alias("component-dom/lib/traverse.js", "editable-view/deps/dom/lib/traverse.js");
require.alias("component-dom/lib/manipulate.js", "editable-view/deps/dom/lib/manipulate.js");
require.alias("component-dom/lib/classes.js", "editable-view/deps/dom/lib/classes.js");
require.alias("component-dom/lib/attributes.js", "editable-view/deps/dom/lib/attributes.js");
require.alias("component-dom/lib/events.js", "editable-view/deps/dom/lib/events.js");
require.alias("component-event/index.js", "component-dom/deps/event/index.js");

require.alias("component-delegate/index.js", "component-dom/deps/delegate/index.js");
require.alias("component-matches-selector/index.js", "component-delegate/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("component-domify/index.js", "component-dom/deps/domify/index.js");

require.alias("component-classes/index.js", "component-dom/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-css/index.js", "component-dom/deps/css/index.js");
require.alias("component-css/lib/css.js", "component-dom/deps/css/lib/css.js");
require.alias("component-css/lib/prop.js", "component-dom/deps/css/lib/prop.js");
require.alias("component-css/lib/swap.js", "component-dom/deps/css/lib/swap.js");
require.alias("component-css/lib/style.js", "component-dom/deps/css/lib/style.js");
require.alias("component-css/lib/hooks.js", "component-dom/deps/css/lib/hooks.js");
require.alias("component-css/lib/styles.js", "component-dom/deps/css/lib/styles.js");
require.alias("component-css/lib/vendor.js", "component-dom/deps/css/lib/vendor.js");
require.alias("component-css/lib/support.js", "component-dom/deps/css/lib/support.js");
require.alias("component-css/lib/computed.js", "component-dom/deps/css/lib/computed.js");
require.alias("component-css/index.js", "component-dom/deps/css/index.js");
require.alias("visionmedia-debug/index.js", "component-css/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "component-css/deps/debug/debug.js");

require.alias("ianstormtaylor-to-camel-case/index.js", "component-css/deps/to-camel-case/index.js");
require.alias("ianstormtaylor-to-space-case/index.js", "ianstormtaylor-to-camel-case/deps/to-space-case/index.js");
require.alias("ianstormtaylor-to-no-case/index.js", "ianstormtaylor-to-space-case/deps/to-no-case/index.js");

require.alias("component-within-document/index.js", "component-css/deps/within-document/index.js");

require.alias("component-css/index.js", "component-css/index.js");
require.alias("component-value/index.js", "component-dom/deps/value/index.js");
require.alias("component-value/index.js", "component-dom/deps/value/index.js");
require.alias("component-type/index.js", "component-value/deps/type/index.js");

require.alias("component-value/index.js", "component-value/index.js");
require.alias("component-query/index.js", "component-dom/deps/query/index.js");

require.alias("component-matches-selector/index.js", "component-dom/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("yields-traverse/index.js", "component-dom/deps/traverse/index.js");
require.alias("yields-traverse/index.js", "component-dom/deps/traverse/index.js");
require.alias("component-matches-selector/index.js", "yields-traverse/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("yields-traverse/index.js", "yields-traverse/index.js");
require.alias("component-trim/index.js", "component-dom/deps/trim/index.js");

require.alias("yields-isArray/index.js", "component-dom/deps/isArray/index.js");

require.alias("component-to-function/index.js", "component-dom/deps/to-function/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("matthewmueller-uid/index.js", "editable-view/deps/uid/index.js");

require.alias("editable-placeholder/index.js", "editable-view/deps/editable-placeholder/index.js");
require.alias("editable-placeholder/index.js", "editable-view/deps/editable-placeholder/index.js");
require.alias("component-classes/index.js", "editable-placeholder/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-events/index.js", "editable-placeholder/deps/events/index.js");
require.alias("component-event/index.js", "component-events/deps/event/index.js");

require.alias("component-delegate/index.js", "component-events/deps/delegate/index.js");
require.alias("component-matches-selector/index.js", "component-delegate/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("component-raf/index.js", "editable-placeholder/deps/raf/index.js");

require.alias("bmcmahen-is-key/index.js", "editable-placeholder/deps/is-key/index.js");
require.alias("bmcmahen-is-key/index.js", "editable-placeholder/deps/is-key/index.js");
require.alias("yields-keycode/index.js", "bmcmahen-is-key/deps/keycode/index.js");

require.alias("bmcmahen-is-key/index.js", "bmcmahen-is-key/index.js");
require.alias("editable-placeholder/index.js", "editable-placeholder/index.js");
require.alias("editable-view/index.js", "editable-view/index.js");
require.alias("redact/index.js", "editor/deps/redact/index.js");
require.alias("redact/index.js", "editor/deps/redact/index.js");
require.alias("yields-redact-popover/index.js", "redact/deps/redact-popover/index.js");
require.alias("yields-redact-popover/index.js", "redact/deps/redact-popover/index.js");
require.alias("yields-get-selected-text/index.js", "yields-redact-popover/deps/get-selected-text/index.js");
require.alias("yields-get-selected-text/index.js", "yields-redact-popover/deps/get-selected-text/index.js");
require.alias("yields-get-selected-text/index.js", "yields-get-selected-text/index.js");
require.alias("component-emitter/index.js", "yields-redact-popover/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-events/index.js", "yields-redact-popover/deps/events/index.js");
require.alias("component-event/index.js", "component-events/deps/event/index.js");

require.alias("component-delegate/index.js", "component-events/deps/delegate/index.js");
require.alias("component-matches-selector/index.js", "component-delegate/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("component-trim/index.js", "yields-redact-popover/deps/trim/index.js");

require.alias("component-tip/index.js", "yields-redact-popover/deps/tip/index.js");
require.alias("component-tip/template.js", "yields-redact-popover/deps/tip/template.js");
require.alias("component-emitter/index.js", "component-tip/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-query/index.js", "component-tip/deps/query/index.js");

require.alias("component-events/index.js", "component-tip/deps/events/index.js");
require.alias("component-event/index.js", "component-events/deps/event/index.js");

require.alias("component-delegate/index.js", "component-events/deps/delegate/index.js");
require.alias("component-matches-selector/index.js", "component-delegate/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("component-domify/index.js", "component-tip/deps/domify/index.js");

require.alias("component-classes/index.js", "component-tip/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-css/index.js", "component-tip/deps/css/index.js");
require.alias("component-css/lib/css.js", "component-tip/deps/css/lib/css.js");
require.alias("component-css/lib/prop.js", "component-tip/deps/css/lib/prop.js");
require.alias("component-css/lib/swap.js", "component-tip/deps/css/lib/swap.js");
require.alias("component-css/lib/style.js", "component-tip/deps/css/lib/style.js");
require.alias("component-css/lib/hooks.js", "component-tip/deps/css/lib/hooks.js");
require.alias("component-css/lib/styles.js", "component-tip/deps/css/lib/styles.js");
require.alias("component-css/lib/vendor.js", "component-tip/deps/css/lib/vendor.js");
require.alias("component-css/lib/support.js", "component-tip/deps/css/lib/support.js");
require.alias("component-css/lib/computed.js", "component-tip/deps/css/lib/computed.js");
require.alias("component-css/index.js", "component-tip/deps/css/index.js");
require.alias("visionmedia-debug/index.js", "component-css/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "component-css/deps/debug/debug.js");

require.alias("ianstormtaylor-to-camel-case/index.js", "component-css/deps/to-camel-case/index.js");
require.alias("ianstormtaylor-to-space-case/index.js", "ianstormtaylor-to-camel-case/deps/to-space-case/index.js");
require.alias("ianstormtaylor-to-no-case/index.js", "ianstormtaylor-to-space-case/deps/to-no-case/index.js");

require.alias("component-within-document/index.js", "component-css/deps/within-document/index.js");

require.alias("component-css/index.js", "component-css/index.js");
require.alias("timoxley-offset/index.js", "component-tip/deps/offset/index.js");
require.alias("timoxley-dom-support/index.js", "timoxley-offset/deps/dom-support/index.js");
require.alias("enyo-domready/index.js", "timoxley-dom-support/deps/domready/index.js");

require.alias("timoxley-assert/index.js", "timoxley-dom-support/deps/assert/index.js");
require.alias("component-inherit/index.js", "timoxley-assert/deps/inherit/index.js");

require.alias("component-within-document/index.js", "timoxley-offset/deps/within-document/index.js");

require.alias("yields-slug/index.js", "yields-redact-popover/deps/slug/index.js");

require.alias("bmcmahen-monitor-text-selection/index.js", "yields-redact-popover/deps/monitor-text-selection/index.js");
require.alias("bmcmahen-monitor-text-selection/index.js", "yields-redact-popover/deps/monitor-text-selection/index.js");
require.alias("yields-on-select/index.js", "bmcmahen-monitor-text-selection/deps/on-select/index.js");
require.alias("yields-on-select/index.js", "bmcmahen-monitor-text-selection/deps/on-select/index.js");
require.alias("yields-get-selected-text/index.js", "yields-on-select/deps/get-selected-text/index.js");
require.alias("yields-get-selected-text/index.js", "yields-on-select/deps/get-selected-text/index.js");
require.alias("yields-get-selected-text/index.js", "yields-get-selected-text/index.js");
require.alias("bmcmahen-modifier/index.js", "yields-on-select/deps/modifier/index.js");
require.alias("bmcmahen-modifier/index.js", "yields-on-select/deps/modifier/index.js");
require.alias("bmcmahen-modifier/index.js", "bmcmahen-modifier/index.js");
require.alias("component-event/index.js", "yields-on-select/deps/event/index.js");

require.alias("component-raf/index.js", "yields-on-select/deps/raf/index.js");

require.alias("yields-on-select/index.js", "yields-on-select/index.js");
require.alias("component-emitter/index.js", "bmcmahen-monitor-text-selection/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("bmcmahen-on-deselect/index.js", "bmcmahen-monitor-text-selection/deps/on-deselect/index.js");
require.alias("bmcmahen-on-deselect/index.js", "bmcmahen-monitor-text-selection/deps/on-deselect/index.js");
require.alias("component-event/index.js", "bmcmahen-on-deselect/deps/event/index.js");

require.alias("component-raf/index.js", "bmcmahen-on-deselect/deps/raf/index.js");

require.alias("bmcmahen-text-selection/index.js", "bmcmahen-on-deselect/deps/text-selection/index.js");
require.alias("bmcmahen-text-selection/index.js", "bmcmahen-on-deselect/deps/text-selection/index.js");
require.alias("bmcmahen-text-selection/index.js", "bmcmahen-text-selection/index.js");
require.alias("bmcmahen-modifier/index.js", "bmcmahen-on-deselect/deps/modifier/index.js");
require.alias("bmcmahen-modifier/index.js", "bmcmahen-on-deselect/deps/modifier/index.js");
require.alias("bmcmahen-modifier/index.js", "bmcmahen-modifier/index.js");
require.alias("bmcmahen-on-deselect/index.js", "bmcmahen-on-deselect/index.js");
require.alias("bmcmahen-monitor-text-selection/index.js", "bmcmahen-monitor-text-selection/index.js");
require.alias("yields-redact-popover/index.js", "yields-redact-popover/index.js");
require.alias("component-inherit/index.js", "redact/deps/inherit/index.js");

require.alias("component-dom/index.js", "redact/deps/dom/index.js");
require.alias("component-dom/lib/traverse.js", "redact/deps/dom/lib/traverse.js");
require.alias("component-dom/lib/manipulate.js", "redact/deps/dom/lib/manipulate.js");
require.alias("component-dom/lib/classes.js", "redact/deps/dom/lib/classes.js");
require.alias("component-dom/lib/attributes.js", "redact/deps/dom/lib/attributes.js");
require.alias("component-dom/lib/events.js", "redact/deps/dom/lib/events.js");
require.alias("component-event/index.js", "component-dom/deps/event/index.js");

require.alias("component-delegate/index.js", "component-dom/deps/delegate/index.js");
require.alias("component-matches-selector/index.js", "component-delegate/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("component-domify/index.js", "component-dom/deps/domify/index.js");

require.alias("component-classes/index.js", "component-dom/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-css/index.js", "component-dom/deps/css/index.js");
require.alias("component-css/lib/css.js", "component-dom/deps/css/lib/css.js");
require.alias("component-css/lib/prop.js", "component-dom/deps/css/lib/prop.js");
require.alias("component-css/lib/swap.js", "component-dom/deps/css/lib/swap.js");
require.alias("component-css/lib/style.js", "component-dom/deps/css/lib/style.js");
require.alias("component-css/lib/hooks.js", "component-dom/deps/css/lib/hooks.js");
require.alias("component-css/lib/styles.js", "component-dom/deps/css/lib/styles.js");
require.alias("component-css/lib/vendor.js", "component-dom/deps/css/lib/vendor.js");
require.alias("component-css/lib/support.js", "component-dom/deps/css/lib/support.js");
require.alias("component-css/lib/computed.js", "component-dom/deps/css/lib/computed.js");
require.alias("component-css/index.js", "component-dom/deps/css/index.js");
require.alias("visionmedia-debug/index.js", "component-css/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "component-css/deps/debug/debug.js");

require.alias("ianstormtaylor-to-camel-case/index.js", "component-css/deps/to-camel-case/index.js");
require.alias("ianstormtaylor-to-space-case/index.js", "ianstormtaylor-to-camel-case/deps/to-space-case/index.js");
require.alias("ianstormtaylor-to-no-case/index.js", "ianstormtaylor-to-space-case/deps/to-no-case/index.js");

require.alias("component-within-document/index.js", "component-css/deps/within-document/index.js");

require.alias("component-css/index.js", "component-css/index.js");
require.alias("component-value/index.js", "component-dom/deps/value/index.js");
require.alias("component-value/index.js", "component-dom/deps/value/index.js");
require.alias("component-type/index.js", "component-value/deps/type/index.js");

require.alias("component-value/index.js", "component-value/index.js");
require.alias("component-query/index.js", "component-dom/deps/query/index.js");

require.alias("component-matches-selector/index.js", "component-dom/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("yields-traverse/index.js", "component-dom/deps/traverse/index.js");
require.alias("yields-traverse/index.js", "component-dom/deps/traverse/index.js");
require.alias("component-matches-selector/index.js", "yields-traverse/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("yields-traverse/index.js", "yields-traverse/index.js");
require.alias("component-trim/index.js", "component-dom/deps/trim/index.js");

require.alias("yields-isArray/index.js", "component-dom/deps/isArray/index.js");

require.alias("component-to-function/index.js", "component-dom/deps/to-function/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("redact/index.js", "redact/index.js");
require.alias("notes/index.js", "editor/deps/notes/index.js");
require.alias("notes/index.js", "editor/deps/notes/index.js");
require.alias("cristiandouce-tags-free/index.js", "notes/deps/tags-free/index.js");

require.alias("component-create-element/index.js", "notes/deps/create-element/index.js");
require.alias("component-create-element/index.js", "notes/deps/create-element/index.js");
require.alias("component-create-element/index.js", "component-create-element/index.js");
require.alias("bmcmahen-selection-range/index.js", "notes/deps/selection-range/index.js");
require.alias("bmcmahen-selection-range/index.js", "notes/deps/selection-range/index.js");
require.alias("bmcmahen-selection-range/index.js", "bmcmahen-selection-range/index.js");
require.alias("bmcmahen-string-splice/index.js", "notes/deps/string-splice/index.js");
require.alias("bmcmahen-string-splice/index.js", "notes/deps/string-splice/index.js");
require.alias("bmcmahen-string-splice/index.js", "bmcmahen-string-splice/index.js");
require.alias("notes/index.js", "notes/index.js");
require.alias("range/index.js", "editor/deps/range/index.js");
require.alias("range/index.js", "editor/deps/range/index.js");
require.alias("component-inherit/index.js", "range/deps/inherit/index.js");

require.alias("bmcmahen-selection-range/index.js", "range/deps/selection-range/index.js");
require.alias("bmcmahen-selection-range/index.js", "range/deps/selection-range/index.js");
require.alias("bmcmahen-selection-range/index.js", "bmcmahen-selection-range/index.js");
require.alias("range/index.js", "range/index.js");
require.alias("paragraphs/index.js", "editor/deps/paragraphs/index.js");
require.alias("paragraphs/index.js", "editor/deps/paragraphs/index.js");
require.alias("bmcmahen-within-selection/index.js", "paragraphs/deps/within-selection/index.js");
require.alias("bmcmahen-within-selection/index.js", "paragraphs/deps/within-selection/index.js");
require.alias("component-matches-selector/index.js", "bmcmahen-within-selection/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("bmcmahen-within-selection/index.js", "bmcmahen-within-selection/index.js");
require.alias("bmcmahen-cursor-within/index.js", "paragraphs/deps/cursor-within/index.js");
require.alias("bmcmahen-cursor-within/index.js", "paragraphs/deps/cursor-within/index.js");
require.alias("discore-closest/index.js", "bmcmahen-cursor-within/deps/closest/index.js");
require.alias("discore-closest/index.js", "bmcmahen-cursor-within/deps/closest/index.js");
require.alias("component-matches-selector/index.js", "discore-closest/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("discore-closest/index.js", "discore-closest/index.js");
require.alias("bmcmahen-cursor-within/index.js", "bmcmahen-cursor-within/index.js");
require.alias("component-emitter/index.js", "paragraphs/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("bmcmahen-selection-range/index.js", "paragraphs/deps/selection-range/index.js");
require.alias("bmcmahen-selection-range/index.js", "paragraphs/deps/selection-range/index.js");
require.alias("bmcmahen-selection-range/index.js", "bmcmahen-selection-range/index.js");
require.alias("component-dom/index.js", "paragraphs/deps/dom/index.js");
require.alias("component-dom/lib/traverse.js", "paragraphs/deps/dom/lib/traverse.js");
require.alias("component-dom/lib/manipulate.js", "paragraphs/deps/dom/lib/manipulate.js");
require.alias("component-dom/lib/classes.js", "paragraphs/deps/dom/lib/classes.js");
require.alias("component-dom/lib/attributes.js", "paragraphs/deps/dom/lib/attributes.js");
require.alias("component-dom/lib/events.js", "paragraphs/deps/dom/lib/events.js");
require.alias("component-event/index.js", "component-dom/deps/event/index.js");

require.alias("component-delegate/index.js", "component-dom/deps/delegate/index.js");
require.alias("component-matches-selector/index.js", "component-delegate/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("component-domify/index.js", "component-dom/deps/domify/index.js");

require.alias("component-classes/index.js", "component-dom/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-css/index.js", "component-dom/deps/css/index.js");
require.alias("component-css/lib/css.js", "component-dom/deps/css/lib/css.js");
require.alias("component-css/lib/prop.js", "component-dom/deps/css/lib/prop.js");
require.alias("component-css/lib/swap.js", "component-dom/deps/css/lib/swap.js");
require.alias("component-css/lib/style.js", "component-dom/deps/css/lib/style.js");
require.alias("component-css/lib/hooks.js", "component-dom/deps/css/lib/hooks.js");
require.alias("component-css/lib/styles.js", "component-dom/deps/css/lib/styles.js");
require.alias("component-css/lib/vendor.js", "component-dom/deps/css/lib/vendor.js");
require.alias("component-css/lib/support.js", "component-dom/deps/css/lib/support.js");
require.alias("component-css/lib/computed.js", "component-dom/deps/css/lib/computed.js");
require.alias("component-css/index.js", "component-dom/deps/css/index.js");
require.alias("visionmedia-debug/index.js", "component-css/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "component-css/deps/debug/debug.js");

require.alias("ianstormtaylor-to-camel-case/index.js", "component-css/deps/to-camel-case/index.js");
require.alias("ianstormtaylor-to-space-case/index.js", "ianstormtaylor-to-camel-case/deps/to-space-case/index.js");
require.alias("ianstormtaylor-to-no-case/index.js", "ianstormtaylor-to-space-case/deps/to-no-case/index.js");

require.alias("component-within-document/index.js", "component-css/deps/within-document/index.js");

require.alias("component-css/index.js", "component-css/index.js");
require.alias("component-value/index.js", "component-dom/deps/value/index.js");
require.alias("component-value/index.js", "component-dom/deps/value/index.js");
require.alias("component-type/index.js", "component-value/deps/type/index.js");

require.alias("component-value/index.js", "component-value/index.js");
require.alias("component-query/index.js", "component-dom/deps/query/index.js");

require.alias("component-matches-selector/index.js", "component-dom/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("yields-traverse/index.js", "component-dom/deps/traverse/index.js");
require.alias("yields-traverse/index.js", "component-dom/deps/traverse/index.js");
require.alias("component-matches-selector/index.js", "yields-traverse/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("yields-traverse/index.js", "yields-traverse/index.js");
require.alias("component-trim/index.js", "component-dom/deps/trim/index.js");

require.alias("yields-isArray/index.js", "component-dom/deps/isArray/index.js");

require.alias("component-to-function/index.js", "component-dom/deps/to-function/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("paragraph/index.js", "paragraphs/deps/paragraph/index.js");
require.alias("paragraph/index.js", "paragraphs/deps/paragraph/index.js");
require.alias("component-emitter/index.js", "paragraph/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-bus/index.js", "paragraph/deps/bus/index.js");
require.alias("component-emitter/index.js", "component-bus/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-dom/index.js", "paragraph/deps/dom/index.js");
require.alias("component-dom/lib/traverse.js", "paragraph/deps/dom/lib/traverse.js");
require.alias("component-dom/lib/manipulate.js", "paragraph/deps/dom/lib/manipulate.js");
require.alias("component-dom/lib/classes.js", "paragraph/deps/dom/lib/classes.js");
require.alias("component-dom/lib/attributes.js", "paragraph/deps/dom/lib/attributes.js");
require.alias("component-dom/lib/events.js", "paragraph/deps/dom/lib/events.js");
require.alias("component-event/index.js", "component-dom/deps/event/index.js");

require.alias("component-delegate/index.js", "component-dom/deps/delegate/index.js");
require.alias("component-matches-selector/index.js", "component-delegate/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("component-domify/index.js", "component-dom/deps/domify/index.js");

require.alias("component-classes/index.js", "component-dom/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-css/index.js", "component-dom/deps/css/index.js");
require.alias("component-css/lib/css.js", "component-dom/deps/css/lib/css.js");
require.alias("component-css/lib/prop.js", "component-dom/deps/css/lib/prop.js");
require.alias("component-css/lib/swap.js", "component-dom/deps/css/lib/swap.js");
require.alias("component-css/lib/style.js", "component-dom/deps/css/lib/style.js");
require.alias("component-css/lib/hooks.js", "component-dom/deps/css/lib/hooks.js");
require.alias("component-css/lib/styles.js", "component-dom/deps/css/lib/styles.js");
require.alias("component-css/lib/vendor.js", "component-dom/deps/css/lib/vendor.js");
require.alias("component-css/lib/support.js", "component-dom/deps/css/lib/support.js");
require.alias("component-css/lib/computed.js", "component-dom/deps/css/lib/computed.js");
require.alias("component-css/index.js", "component-dom/deps/css/index.js");
require.alias("visionmedia-debug/index.js", "component-css/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "component-css/deps/debug/debug.js");

require.alias("ianstormtaylor-to-camel-case/index.js", "component-css/deps/to-camel-case/index.js");
require.alias("ianstormtaylor-to-space-case/index.js", "ianstormtaylor-to-camel-case/deps/to-space-case/index.js");
require.alias("ianstormtaylor-to-no-case/index.js", "ianstormtaylor-to-space-case/deps/to-no-case/index.js");

require.alias("component-within-document/index.js", "component-css/deps/within-document/index.js");

require.alias("component-css/index.js", "component-css/index.js");
require.alias("component-value/index.js", "component-dom/deps/value/index.js");
require.alias("component-value/index.js", "component-dom/deps/value/index.js");
require.alias("component-type/index.js", "component-value/deps/type/index.js");

require.alias("component-value/index.js", "component-value/index.js");
require.alias("component-query/index.js", "component-dom/deps/query/index.js");

require.alias("component-matches-selector/index.js", "component-dom/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("yields-traverse/index.js", "component-dom/deps/traverse/index.js");
require.alias("yields-traverse/index.js", "component-dom/deps/traverse/index.js");
require.alias("component-matches-selector/index.js", "yields-traverse/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("yields-traverse/index.js", "yields-traverse/index.js");
require.alias("component-trim/index.js", "component-dom/deps/trim/index.js");

require.alias("yields-isArray/index.js", "component-dom/deps/isArray/index.js");

require.alias("component-to-function/index.js", "component-dom/deps/to-function/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("component-type/index.js", "paragraph/deps/type/index.js");

require.alias("matthewmueller-uid/index.js", "paragraph/deps/uid/index.js");

require.alias("component-events/index.js", "paragraph/deps/events/index.js");
require.alias("component-event/index.js", "component-events/deps/event/index.js");

require.alias("component-delegate/index.js", "component-events/deps/delegate/index.js");
require.alias("component-matches-selector/index.js", "component-delegate/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("bmcmahen-selection-range/index.js", "paragraph/deps/selection-range/index.js");
require.alias("bmcmahen-selection-range/index.js", "paragraph/deps/selection-range/index.js");
require.alias("bmcmahen-selection-range/index.js", "bmcmahen-selection-range/index.js");
require.alias("component-inherit/index.js", "paragraph/deps/inherit/index.js");

require.alias("component-domify/index.js", "paragraph/deps/domify/index.js");

require.alias("range/index.js", "paragraph/deps/range/index.js");
require.alias("range/index.js", "paragraph/deps/range/index.js");
require.alias("component-inherit/index.js", "range/deps/inherit/index.js");

require.alias("bmcmahen-selection-range/index.js", "range/deps/selection-range/index.js");
require.alias("bmcmahen-selection-range/index.js", "range/deps/selection-range/index.js");
require.alias("bmcmahen-selection-range/index.js", "bmcmahen-selection-range/index.js");
require.alias("range/index.js", "range/index.js");
require.alias("paragraph/index.js", "paragraph/index.js");
require.alias("paragraphs/index.js", "paragraphs/index.js");
require.alias("history/index.js", "editor/deps/history/index.js");
require.alias("history/index.js", "editor/deps/history/index.js");
require.alias("component-emitter/index.js", "history/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("history/index.js", "history/index.js");
require.alias("editor/index.js", "editor/index.js");
require.alias("db/index.js", "boot/deps/db/index.js");
require.alias("db/index.js", "boot/deps/db/index.js");
require.alias("bmcmahen-mydb-client/index.js", "db/deps/mydb/index.js");
require.alias("bmcmahen-mydb-client/document.js", "db/deps/mydb/document.js");
require.alias("learnboost-engine.io-client/lib/index.js", "bmcmahen-mydb-client/deps/engine.io/lib/index.js");
require.alias("learnboost-engine.io-client/lib/socket.js", "bmcmahen-mydb-client/deps/engine.io/lib/socket.js");
require.alias("learnboost-engine.io-client/lib/transport.js", "bmcmahen-mydb-client/deps/engine.io/lib/transport.js");
require.alias("learnboost-engine.io-client/lib/emitter.js", "bmcmahen-mydb-client/deps/engine.io/lib/emitter.js");
require.alias("learnboost-engine.io-client/lib/util.js", "bmcmahen-mydb-client/deps/engine.io/lib/util.js");
require.alias("learnboost-engine.io-client/lib/transports/index.js", "bmcmahen-mydb-client/deps/engine.io/lib/transports/index.js");
require.alias("learnboost-engine.io-client/lib/transports/polling.js", "bmcmahen-mydb-client/deps/engine.io/lib/transports/polling.js");
require.alias("learnboost-engine.io-client/lib/transports/polling-xhr.js", "bmcmahen-mydb-client/deps/engine.io/lib/transports/polling-xhr.js");
require.alias("learnboost-engine.io-client/lib/transports/polling-jsonp.js", "bmcmahen-mydb-client/deps/engine.io/lib/transports/polling-jsonp.js");
require.alias("learnboost-engine.io-client/lib/transports/websocket.js", "bmcmahen-mydb-client/deps/engine.io/lib/transports/websocket.js");
require.alias("learnboost-engine.io-client/lib/transports/flashsocket.js", "bmcmahen-mydb-client/deps/engine.io/lib/transports/flashsocket.js");
require.alias("learnboost-engine.io-client/lib/index.js", "bmcmahen-mydb-client/deps/engine.io/index.js");
require.alias("component-emitter/index.js", "learnboost-engine.io-client/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-indexof/index.js", "learnboost-engine.io-client/deps/indexof/index.js");

require.alias("component-global/index.js", "learnboost-engine.io-client/deps/global/index.js");

require.alias("component-has-cors/index.js", "learnboost-engine.io-client/deps/has-cors/index.js");
require.alias("component-has-cors/index.js", "learnboost-engine.io-client/deps/has-cors/index.js");
require.alias("component-global/index.js", "component-has-cors/deps/global/index.js");

require.alias("component-has-cors/index.js", "component-has-cors/index.js");
require.alias("component-ws/index.js", "learnboost-engine.io-client/deps/ws/index.js");
require.alias("component-ws/index.js", "learnboost-engine.io-client/deps/ws/index.js");
require.alias("component-global/index.js", "component-ws/deps/global/index.js");

require.alias("component-ws/index.js", "component-ws/index.js");
require.alias("LearnBoost-engine.io-protocol/lib/index.js", "learnboost-engine.io-client/deps/engine.io-parser/lib/index.js");
require.alias("LearnBoost-engine.io-protocol/lib/keys.js", "learnboost-engine.io-client/deps/engine.io-parser/lib/keys.js");
require.alias("LearnBoost-engine.io-protocol/lib/index.js", "learnboost-engine.io-client/deps/engine.io-parser/index.js");
require.alias("LearnBoost-engine.io-protocol/lib/index.js", "LearnBoost-engine.io-protocol/index.js");
require.alias("visionmedia-debug/index.js", "learnboost-engine.io-client/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "learnboost-engine.io-client/deps/debug/debug.js");

require.alias("learnboost-engine.io-client/lib/index.js", "learnboost-engine.io-client/index.js");
require.alias("cloudup-mongo-query/index.js", "bmcmahen-mydb-client/deps/mongo-query/index.js");
require.alias("cloudup-mongo-query/mods.js", "bmcmahen-mydb-client/deps/mongo-query/mods.js");
require.alias("cloudup-mongo-query/filter.js", "bmcmahen-mydb-client/deps/mongo-query/filter.js");
require.alias("cloudup-mongo-query/ops.js", "bmcmahen-mydb-client/deps/mongo-query/ops.js");
require.alias("component-type/index.js", "cloudup-mongo-query/deps/type/index.js");

require.alias("component-object/index.js", "cloudup-mongo-query/deps/object/index.js");

require.alias("visionmedia-debug/index.js", "cloudup-mongo-query/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "cloudup-mongo-query/deps/debug/debug.js");

require.alias("cloudup-dot/index.js", "cloudup-mongo-query/deps/dot/index.js");
require.alias("component-type/index.js", "cloudup-dot/deps/type/index.js");

require.alias("cloudup-mongo-eql/index.js", "cloudup-mongo-query/deps/mongo-eql/index.js");
require.alias("cloudup-mongo-eql/index.js", "cloudup-mongo-query/deps/mongo-eql/index.js");
require.alias("visionmedia-debug/index.js", "cloudup-mongo-eql/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "cloudup-mongo-eql/deps/debug/debug.js");

require.alias("component-type/index.js", "cloudup-mongo-eql/deps/type/index.js");

require.alias("cloudup-mongo-eql/index.js", "cloudup-mongo-eql/index.js");
require.alias("cloudup-dot/index.js", "bmcmahen-mydb-client/deps/dot/index.js");
require.alias("component-type/index.js", "cloudup-dot/deps/type/index.js");

require.alias("component-emitter/index.js", "bmcmahen-mydb-client/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-type/index.js", "bmcmahen-mydb-client/deps/type/index.js");

require.alias("component-clone/index.js", "bmcmahen-mydb-client/deps/clone/index.js");
require.alias("component-type/index.js", "component-clone/deps/type/index.js");

require.alias("component-json/index.js", "bmcmahen-mydb-client/deps/json/index.js");

require.alias("visionmedia-superagent/lib/client.js", "bmcmahen-mydb-client/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "bmcmahen-mydb-client/deps/superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("RedVentures-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");
require.alias("visionmedia-debug/index.js", "bmcmahen-mydb-client/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "bmcmahen-mydb-client/deps/debug/debug.js");

require.alias("db/index.js", "db/index.js");
require.alias("boot/index.js", "boot/index.js");