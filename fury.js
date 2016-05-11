var ƒ = {
    parseParams : parseParams,
    fetchEvents : fetchEvents,
    attach : attach,
    fetchExecs : fetchExecs,
    render : render,
    parseFormat : parseFormat,
    ul : ul,
    el : el,
    append : append,
    createElement : createFuryEl
}


function parseParams(functionArguments){
  return functionArguments.split(',');
}


function fetchEvents(item){
  if (item.getAttribute('click') && item.getAttribute('evented') !== "true"){
    item.setAttribute('evented',true)
    let functionCall = /(.*)\((.*)\)/.exec(item.getAttribute('click').trim());
    let functionArguments = parseParams(functionCall[2]);
    attach(item)('click',this[functionCall[1]],functionArguments)
  }
}

function attach(el){
  return function event(event,virtualHandlr, args){
    el.addEventListener(event,function(){
      virtualHandlr.apply(this, args)
      fetchExecs(document)
    }.bind(this),false)
  }
}

function fetchExecs(el){
  el = el || document;
  [].forEach.call(el.querySelectorAll('[*],[data-fury]'),render);
}


function render(item){
    fetchEvents(item);
    let functionCall = item.getAttribute('exec') || item.textContent.trim();
    item.setAttribute('exec',functionCall)


    functionCall = /(.*)\((.*)\)/.exec(functionCall)
    if (functionCall){

      let functionArguments = functionCall[2];

      console.log(functionArguments);

      functionArguments = parseParams(functionArguments);

      result = this[functionCall[1].trim()].apply(this,functionArguments)

      item.textContent = '';
      parseFormat(item,result)

    }
    return fetchExecs(item)
}



  function parseFormat(item,result){
    if (typeof result === 'string'){
      return item.textContent = result;
    }

    if (typeof result === 'function'){
      return parseFormat(item,result())
    }

    if (result.nodeName){
      return item.appendChild(result);
    }


    if (Array.isArray(result)){
      return result.map(function(i){
        return parseFormat(item,i)
      })
    }
  }


document.addEventListener("DOMContentLoaded", function(event) {
  fetchExecs()
});



function ul(content,attrs){

  let ul =  document.createElement('ul')

  content.forEach(function(i){
    ul.appendChild(i)
  })

  return ul
}



function el(a){
  return function(attrs,content){

    if (!content && (Array.isArray(attrs) || attrs.nodeName || typeof attrs === 'string' || typeof attrs === 'function' )){
      content = attrs
      attrs = false
    }

    let li = document.createElement(a);
    if (content)
    append(li,content);
    if (attrs)
    Object.keys(attrs).forEach(function(key){
      li.setAttribute(key,attrs[key]);
    })
    return li
  }
}


function append(node,content){
  if (Array.isArray(content)){
    return content.forEach(content=>append(node,content))
  }
  if (content.nodeName){
   return node.appendChild(content)
  }
  if (typeof content === 'string'){
    return node.textContent = content
  }
  if (typeof content === 'function'){
    return append(node,content())
  }
}


function createFuryEl(nodeName,content){
  el = el(nodeName)(content);
  el.setAttribute('data-fury',true);
  if (content)
    el.textContent = content
  return el
}
