var transit = require('transit');
var dom = require('dom');

var Editor = require('./editor');
var Title = require('./title');

transit('/', renderEditor).out(destroy);
transit('/:id', loadDocument, renderEditor).out(destroy);

function loadDocument(ctx, next){
  // we should preload docs anyway
}

function renderEditor(ctx, next){
  var title = new Title();
  var editor = new Editor();
  dom('#app')
    .empty()
    .append(title.$el)
    .append(editor.$el);
  next();
}

function destroy(ctx, next){
  console.log(destroy);
}