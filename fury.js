var FUU = {
    parseParams : parseParams,
    fetchExecs : fetchExecs,
    render : render,
    parseFormat : parseFormat,
    el : el,
    append : append
}

function parseParams(functionArguments){
  return functionArguments.split(',').map(a=>eval(a));
}

function fetchExecs(el){
  el = el || document;
  [].forEach.call(el.querySelectorAll('[*],[data-fury]'),render);
}

function render(item){
    let functionCall = item.getAttribute('exec') || item.textContent.trim();
    item.setAttribute('exec',functionCall)


    functionCall = /(.*)\((.*)\)/.exec(functionCall)
    if (functionCall){

      let functionArguments = functionCall[2];

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

    if (result.then){
      return result.then(result=>{
        parseFormat(item,result);
        return fetchExecs(item);
      });
    }

  }



function el(a){
  return function currentElement(attrs,content){

    if (!content && (Array.isArray(attrs) || attrs.nodeName || typeof attrs === 'string' || typeof attrs === 'function' )){
      content = attrs
      attrs = false
    }

    let el = document.createElement(a);

    if (content){

      append(el,content);
    }
    if (attrs){
      Object.keys(attrs).forEach(function(key){
        if (key === 'click' && typeof attrs[key] === 'function'){
            return el.addEventListener('click',(e)=>{
              attrs[key](e);
              refresh(el,content,attrs)
            })
        }

        if (typeof attrs[key] === 'function'){
            return el.setAttribute(key,attrs[key]());
        }
        return el.setAttribute(key,attrs[key]);
      })
    }

    return el
  }
}

function refresh(el,content,attrs){
  if (!content && (Array.isArray(attrs) || attrs.nodeName || typeof attrs === 'string' || typeof attrs === 'function' )){
    content = attrs
    attrs = false
  }
  if (content){
    append(el,content);
  }
  if (attrs){
    Object.keys(attrs).forEach(function(key){
      if (key === 'click'){
        return false
      }
      if (typeof attrs[key] === 'function'){
          return el.setAttribute(key,attrs[key]());
      }
      return el.setAttribute(key,attrs[key]);

    })
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

document.addEventListener("DOMContentLoaded", function(event) {
  fetchExecs()
});
