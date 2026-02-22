function kpaste(texta, textb, books) {
  linesa = texta.split("\n")
  linesb = textb.split("\n")
  //console.log(linesb)
  both = {}
  _feed(both, linesa, "a")

  _feed(both, linesb, "b")
  //console.log(both["genesis"]["1"]["1"]["a"])    
  //console.log(both["genesis"]["1"]["1"]["b"])    

  out = []
  for (book of books) {
    var chaps = Object.keys(both[book])
    _nsort(chaps)
    for (var chap of chaps) {
      var verses = Object.keys(both[book][chap])
      _nsort(verses)
      for (var verse of verses) {
        //console.log("chap: " + chap + " verse: " + verse)
        var la = both[book][chap][verse]["a"]
	//console.log(la)
	var lb = both[book][chap][verse]["b"]
	//console.log(lb)
	for (var i = 0; i < Math.max(la.length, lb.length); i++) {
	  var tag = book + " " + chap + ":" + verse
	  var lai, lbi = ""
	  if (i < la.length) {
	    lai = la[i]
	  }
	  if (i < lb.length) {
	    lbi = lb[i]
	  }
	  out.push([tag, lai, lbi])
	}
      }
    }
  }
  return out
}
function _feed(both, lines, aorb) {
  for (var line of lines) {
    var a = line.split("\t")
    var tag = a[0]
    var text = a[1]
    b = a[0].split(/[ :]/)
    book = b[0]
    chap = b[1]
    verse = b[2]
    if (both[book] == undefined) {
      both[book] = {}
    }
    if (both[book][chap] == undefined) {
      both[book][chap] = {}
    }
    if (both[book][chap][verse] == undefined) {
      both[book][chap][verse] = {}
    }
    
    if (both[book][chap][verse]["a"] == undefined) {
      both[book][chap][verse]["a"] = []
    }
    if (both[book][chap][verse]["b"] == undefined) {
      both[book][chap][verse]["b"] = []
    }
    both[book][chap][verse][aorb].push(text)
  }
}
function _nsort(arr) {
  // need to copy?
  //b = a.copy()
  var coll = new Intl.Collator([], {numeric: true});
  arr.sort((a, b) => coll.compare(a, b))
  return b
}
