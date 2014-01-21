module.exports = function(e){
 return e.shiftKey
  || e.altKey
  || e.ctrlKey
  || e.metaKey;
};