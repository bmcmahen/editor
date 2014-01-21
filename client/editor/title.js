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

