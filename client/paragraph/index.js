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


