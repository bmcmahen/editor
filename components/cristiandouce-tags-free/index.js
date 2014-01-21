/**
 * Tags free regular expression
 */
var re = /<(.*?)>/g;

module.exports = function (html) {
  if('string' !== typeof html) return html;
  return html.replace(re, '');
}