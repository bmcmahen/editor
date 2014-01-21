/**
 * Module dependendencies
 */

var proto = require('./proto');
var statics = require('./static');
var clone = require('./utils/clone');

try {
  var Emitter = require('emitter');
} catch(e) {
  var Emitter = require('emitter-component');
}

/**
 * Expose `createModel`.
 */

module.exports = createModel;


/**
 * Create a new model constructor with the given `name`.
 *
 * @param {String} name
 * @return {Function}
 * @api public
 */

function createModel(name) {
  if ('string' !== typeof name) { throw new TypeError('model name required'); }

  /**
   * Initialize a new model with the given `attrs`.
   *
   * @param {Object} attrs
   * @api public
   */

  function Model(attrs) {
    if (!(this instanceof Model)) {
      return new Model(attrs);
    }
    if(Array.isArray(attrs)) {
      var result = [];
      for(var i = 0; i < attrs.length; ++i) {
        result.push(new Model(attrs[i]));
      }
      return result;
    }

    attrs = (attrs) ? clone(attrs) : {};
    this.attrs = {};
    this._callbacks = {};
    this.dirty = {};
    this.errors = [];

    Model.emit('initializing', this, attrs);

    // Set the default values
    for (var attr in Model._defaults) {
      if (Model.attrs[attr]) {
        this.attrs[attr] = clone(Model._defaults[attr]);
      }
    }

    // Only add attributes that are in the model schema
    for (var attr in attrs) {
      if (Model.attrs[attr]) {
        this.attrs[attr] = attrs[attr];
      }
    }
    Model.emit('initialize', this);
  }

  // mixin `Emitter`

  Emitter(Model);

  // Statics

  Model.modelName = name;
  Model.base = '/' + name.toLowerCase();
  Model.attrs = {};
  Model.validators = [];

  Model._defaults = {};

  for (var key in statics) { Model[key] = statics[key]; }

  // Prototype

  Model.prototype = {};
  Model.prototype.model = Model;
  for (var key in proto) { Model.prototype[key] = proto[key]; }

  return Model;
}
