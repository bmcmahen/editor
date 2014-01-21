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