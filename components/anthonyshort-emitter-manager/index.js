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