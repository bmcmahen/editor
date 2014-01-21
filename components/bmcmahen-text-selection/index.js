var selection = window.getSelection();

module.exports = function(){
  return selection.toString();
};