var diff = require("mongo-diff");
var debug = require("debug")("cloudup:mydb-autoreload");

module.exports = Autoreload;

function Autoreload(db) {
  if (!(this instanceof Autoreload)) return new Autoreload(db);
  this.db = db;
  this.docs = [];
  this.getDoc = db.get;
  db.get = this.get.bind(this);
  db.on("disconnect", this.ondisconnect.bind(this));
}

Autoreload.prototype.ondisconnect = function() {
  debug("disconnect - will reload upon reconnect");
  this.db.once("connect", this.onreconnect.bind(this));
};

Autoreload.prototype.onreconnect = function() {
  this.docs.forEach(this.reload, this);
};

Autoreload.prototype.reload = function(doc) {
  var url = doc.$url();
  if (!url) return debug("skipping (%s)", doc.$readyState());
  debug("reloading %s", url);
  var old = doc.$clone();
  var self = this;
  doc.load(url, doc.onreload || onreload);
  function onreload(err) {
      if (err) return debug("doc %s failed to reload", url);
      return self.onreload(doc, old);
  }
};

Autoreload.prototype.onreload = function(doc, old) {
  for (var i in doc) {
      if ("_callbacks" == i) continue;
      if ("$" == i.charAt(0)) continue;
      if (!doc.hasOwnProperty(i)) continue;
      if ("function" == typeof doc[i]) continue;
      var log = diff(old[i], doc[i]);
      if (!log.length) continue;
      for (var ii = 0, l = log.length; ii < l; ii++) {
          doc.emit(i + "$" + log[ii][0], log[ii][1]);
          doc.emit(i, doc[i]);
      }
  }
};

Autoreload.prototype.get = function(url, fn) {
  var doc = this.getDoc.call(this.db, url, fn);
  this.docs.push(doc);
  return doc;
};