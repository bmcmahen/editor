
module.exports = function(el){
  // Ensure that we don't have multiple paragraphs selected
  // We would probably call this when showing the popover to
  // simply grey out 'Note'.
  if (contains('p')) {
    console.log('multiple paragraphs... not allowed!');
    return false;
  }

  if (contains('span')) {
    console.log('overlapping!');
    return false;
  }

  var el = document.createElement('span');
  el.setAttribute('data-id', 'bacon');
  el.id = 'somethingorother';
  wrapWith(el);
}


var selection = window.getSelection();

function wrapWith(element){
  if (selection.rangeCount) {
    var range = selection.getRangeAt(0).cloneRange();
    element.appendChild(range.extractContents());
    range.insertNode(element);
    range.selectNode(element);
   
    // Restore ranges
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

function contains(sel){
  var r = selection.getRangeAt(0);
  var dummy = document.createElement('div');
  dummy.appendChild(r.cloneContents());
  return dummy.querySelector(sel);
}
