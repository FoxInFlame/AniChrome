function xml2json(dom) {
  var nodes = dom.childNodes;
  var object = {};
  
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    
    if (node.nodeName === 'myanimelist') {
      object[node.nodeName] = {};
    } else {
      object[node.nodeName] = [];
    }
    
    var childNodes = node.childNodes;
    
    for (var _i = 0; _i < childNodes.length; _i++) {
      var entryNode = childNodes[_i];
      var entryObject = {};
      
      // Skip empty text nodes.
      if (entryNode.nodeName === '#text') continue;
      
      var items = entryNode.childNodes;
      
      for (var _i2 = 0; _i2 < items.length; _i2++) {
        var item = items[_i2];
        
        if (item.nodeName === '#text') continue;
        
        var value = item.innerHTML;
        
        if (item.nodeName === 'id' || item.nodeName === 'episodes') {
          value = parseInt(value, 10);
        }
        
        entryObject[item.nodeName] = value;
      }
      
      if (node.nodeName === 'myanimelist') {
        if (entryNode.nodeName === 'anime' || entryNode.nodeName === 'manga') {
          if (!object[node.nodeName][entryNode.nodeName]) {
            object[node.nodeName][entryNode.nodeName] = [];
          }
          object[node.nodeName][entryNode.nodeName].push(entryObject);
        } else {
          object[node.nodeName][entryNode.nodeName] = entryObject;
        }
      } else {
        object[node.nodeName].push(entryObject);
      }
    }
  }
  
  return object;
}
