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