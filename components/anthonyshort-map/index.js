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