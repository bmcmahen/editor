var matches = require('matches-selector');
var Emitter = require('emitter');
var MutationObserve = require('mutation-property');

/**
 * Return those nodes that match a specific query
 * @param  {String} query 
 * @param  {Array} nodes 
 * @return {Array}  
 */

function nodesMatching(query, nodes){
  if (!query) return nodes;
  var matching = [];
  for (var i = 0, len = nodes.length; i < len; i++){
    var n = nodes[i];
    if (n.nodeType != 3 && matches(n, query)) {
      matching.push(n);
    }
  }
  return matching.length ? matching : false;
}

/**
 * MutatationObserver wrapper
 * @param {Element} el       
 * @param {Object} options  
 * @param {String} selector 
 */

function Mutant(el, selector, options){
  var observer = {};
  options = options || { childList : true };
  
  Emitter(observer);

  var observe = new MutationObserve(function(mutations){
    mutations.forEach(function(mutation){
      var matching;

      // added
      if (mutation.addedNodes.length){
        if (matching = nodesMatching(selector, mutation.addedNodes)){
          observer.emit('added', matching);
        }
      }

      // removed
      if (mutation.removedNodes.length){
        if (matching = nodesMatching(selector, mutation.removedNodes)){
          observer.emit('removed', matching);
        }
      }
    });
  });

  observe.observe(el, options);
  observe.disconnect = function(){
    observe.disconnect();
  };
  observer.observer = observe;
  return observer;
}

module.exports = Mutant;
