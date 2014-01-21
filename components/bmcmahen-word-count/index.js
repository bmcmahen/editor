// thanks to countable: https://github.com/RadLikeWhoa/Countable/blob/master/Countable.js
module.exports = function(string){
  return (string.replace(/['";:,.?¿\-!¡]+/g, '').match(/\S+/g) || []).length;
}