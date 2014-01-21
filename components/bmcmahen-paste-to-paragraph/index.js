
/**
 * Return an html formatted, plain-text representation
 * of the clipboard data. 
 *
 * Credits: https://github.com/daviferreira/medium-editor
 * 
 * @param  {Event} e 
 * @return {String}  
 */

module.exports = function(e){
  if (e.clipboardData && e.clipboardData.getData){
    e.preventDefault();
    var buf = [];
    var paragraphs = e.clipboardData.getData('text/plain').split(/[\r\n]/g);
    for (var p = 0, len = paragraphs.length; p < len; p++){
      if (paragraphs[p] !== ''){
        buf.push('<p>' + paragraphs[p] + '</p>');
      }
    }
    return buf.join('\n');
  }
};