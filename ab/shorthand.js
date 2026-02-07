var doc = document
// elm gives a html element with tag name and options. if provided, it appends it to a parent adds children
// if the tag is 'txt', then it creates a text node. options needs to be a string then, holding its contents.
// child can be a string, then a textnode of that string is added as child, or a node, then that node is added, or an array of nodes, then the nodes in the array are added. but maybe that's too much.
function elm(tag, options, parent, child) {
    var e
    if (tag == "txt" && typeof(options) == "string") {
	  e = document.createTextNode(options)
    } else {
	  e = document.createElement(tag)
    }
    if (options && typeof(options) == "object") {
	  // add attributes
	  for (var k of Object.keys(options)) {
	      e[k] = options[k]
	  }
    }
    // add to parent
    if (parent) {
	  parent.appendChild(e)
    }
    if (child) {
	  // create a textnode of string
	  if (typeof(child) == "string") {
	      //	    e.appendChild(txn(child))
	      e.appendChild(elm("txt", child))
	  } else if (typeof(child == "array")) {
	      // add children in array
	      for (var c in child) {
		  e.appendChild(c)
	      }
	  } else {
	      // just append
	      e.appendChild(child)
	  }
    }
    return e
}



// evt adds an event listener to element with function func
function evt(type, element, func) {
    element.addEventListener(type, func)
}



// txn creates a new text node, and optionally appends it to parent
function txn(text, parent) {
    var n = document.createTextNode(text)
    if (parent) {
	  parent.appendChild(n)
    }
    return n
}



// wrp returns a function in which the function that is passed is called.
// it preserves the arguments of the function call.
// e.g. when passing arguments to a event handler:
// a.onclick = wrp(my_handler, arg_a, arg_b)
function wrp(func, ...arg) {
    return (function() {
	  // call func with argument(s)
	  func.apply(null, arg)
    })
}



// keys returns the keys of object o
function keys(o) {
    return Object.keys(o)
}



// jget gets response from url and calls callback
function jget(url, callback) {
    console.log("jget " + url)
    let xhr = new XMLHttpRequest()
    xhr.open("GET", url)
    xhr.send()
    xhr.addEventListener("load", function() {
	  console.log("response " + xhr.response)
	  callback(JSON.parse(xhr.response))
    })
}




// jpost posts json data to url and calls callback. todo is callback calling necessary?
// from // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
async function jpost(url = "", data = {}) {
    var response = await fetch(url, {
	  method: "POST",
	  headers: {
	      "Content-Type": "application/json"
	  },
	  body: JSON.stringify(data)
    })
    return response.json()
}






