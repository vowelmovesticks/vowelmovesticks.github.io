var sel = {}
var toc = {}
var text = {}
var langcodes = {}
var ww = new lingobin()
var check = {}
  tlitcheck = {}
var pasted = {}
var bybook = {}

console.log("hello main")
async function main() {
  await initww()
  
  await inittlit()

  await makeselect()
  console.log("sel[a].value: " + sel["a"].value)
  await biblechange("a")
  await biblechange("b")
}
async function makeselect() {
  var wrapa = document.getElementById("select_a")
  var wrapb = document.getElementById("select_b")
  sel["a"] = elm("select", {}, wrapa)
  sel["b"] = elm("select", {}, wrapb)
  var res = await fetch("names.json")
  console.log("fetch names done")  
  var langtofile = await res.json()
  console.log("res.json done")    
  for (var lang of keys(langtofile)) {
    elm("option", { value: langtofile[lang] }, sel["a"], lang)
    elm("option", { value: langtofile[lang] }, sel["b"], lang)
  }
  var booka = getparam("a")
  var bookb = getparam("b")
  if (booka == null) { booka = "yeahoshua-bible" }
  if (bookb == null) { bookb = "bible-he-yeahoshua" }
  sel["a"].value = booka
  sel["b"].value = bookb
  console.log("sel made")
  sel["a"].addEventListener("change", function() {bibleselect("a")}) // maybe selected("a")
  sel["b"].addEventListener("change", function() {bibleselect("b")})
}
async function bibleselect(what) {
  sethash("")
  biblechange(what)
}
async function biblechange(what) {
  setparam(what, sel[what].value)
//  sethash("")
  // is there no shorter native way to get selected text of element?
  document.title = sel["a"].options[sel["a"].selectedIndex].text + " " + sel["b"].options[sel["b"].selectedIndex].text
  console.log(what)
  var res = await fetch("../txt/" + sel[what].value + ".txt")
  text[what] = await res.text()
  res = await fetch("../txt/" + sel[what].value + ".toc")
  if (res.ok) {
    var toctext = await res.text()
    toc[what] = buildtoc(toctext)
  } else { // set to null explicitly to clear old toc
    toc[what] = null
  }
  console.log("text a null: " + (text["a"] == null) + ", text b null: " + (text["b"] == null))
  if (text["a"] == null || text["b"] == null) {
    return
  }
  console.log("before updatepaste")
  updatepaste()
  updatebybook()
  updatetoc()
  render()
  oncheck(what)
}
function updatepaste() {
  console.log("before kpaste")

  var books = ["genesis","exodus","leviticus","numbers","deuteronomy","joshua","judges","1_samuel","2_samuel","1_kings","2_kings","isaiah","jeremiah","ezekiel","hosea","joel","amos","obadiah","jonah","micah","nahum","habakkuk","zephaniah","haggai","zechariah","malachi","psalms","proverbs","job","songs","ruth","lamentations","ecclesiastes","esther","daniel","ezra","nehemiah","1_chronicles","2_chronicles","romans","1_corinthians","2_corinthians","galatians","ephesians","philippians","colossians","1_thessalonians","2_thessalonians","1_timothy","2_timothy","titus","philemon","hebrews","james","1_peter","2_peter","1_john","2_john","3_john","jude","matthew","mark","luke","acts","john","revelation"]
  
  pasted = kpaste(text["a"], text["b"], books)
  
  console.log("after kpaste")  
}
function updatebybook() {
  var pastelines = biblebookchap(pasted, [toc["a"], toc["b"]])
  bybook = getbybook(pastelines)
}
function updatetoc() {
  var tocelm = elm("div", { class: "toc" })
  var booktags = Object.keys(bybook)
  // console.log("updatetoc() booktags: " + booktags)
  for (var booktag of booktags) {
    //console.log("booktag: " + booktag)
    //console.log("toc: " + toc)
    var linktext = getprintbook(booktag, toc["a"], toc["b"])
    //console.log("printtext: " + linktext)
    // var linktext = booktag
    // var link = elm("a", {}, toc, linktext) // maybe put in beautiful toc text here
    var link = document.createElement("a")
    link.innerHTML = linktext
    tocelm.appendChild(link)
    link.addEventListener("click", wrp(bookclicked, booktag))
    elm("br", null, tocelm)
  }
  document.getElementById("tocwrap").innerHTML = ""
  document.getElementById("tocwrap").appendChild(tocelm)
}
function bookclicked(booktag) {
  // set hash booktag
  sethash(booktag)
  // render the book
  renderbook(booktag)
}
async function initww() {
  var res = await fetch("langcodes.json")
  langcodes = await res.json()
  check["a"] = document.querySelector("#check_a")
  check["b"] = document.querySelector("#check_b")
  if (getparam("ww_a") == "true") { check["a"].checked = true }
  if (getparam("ww_b") == "true") { check["b"].checked = true }
  check["a"].addEventListener("change", function() { oncheck("a") })
  check["b"].addEventListener("change", function() { oncheck("b") })
}
async function oncheck(what) {
  setparam("ww_" + what, check[what].checked)
  
  var langcode = langcodes[sel[what].value]

  // we need a dict
  if (check[what].checked && !ww.hasdict(langcode)) {
    var res = await fetch("../dicts/dict-" + langcode + ".json")
    var d = await res.json()
    ww.adddict(d)
  }
  render()
}

function inittlit() {
  tlitcheck["a"] = document.querySelector("#tlit_a")
  tlitcheck["b"] = document.querySelector("#tlit_b")
  if (getparam("tlit_a") == "true") { tlitcheck["a"].checked = true }
  if (getparam("tlit_b") == "true") { tlitcheck["b"].checked = true }
  tlitcheck["a"].addEventListener("change", function() { ontlit("a") })
  tlitcheck["b"].addEventListener("change", function() { ontlit("b") })
}
function ontlit(what) {
  console.log(tlitcheck[what].checked) 
  setparam("tlit_" + what, tlitcheck[what].checked)
  updatebybook()
  updatetoc()
  render()
}

function tohtml(lines) {
  var html = ""
  for (var line of lines) {
    var f = line.split("\t")
    if (f.length < 2) { continue }
    // get all but the first
    var juice = f.slice(1).join("\t")
    if (juice.match(/##book/)) {
      var book = juice.replace(/##book /, "")
      var booktag = f[0].split(" ")[0]
      html += "<h2 id='" + booktag + "'>" + book + "</h2>\n"
      continue
    } else if (juice.match(/##chapter/)) {
      var chap = juice.replace(/##chapter /, "")
      if (parseInt(chap) > 1) { html += "</table>" }
      html += "<h3>" + chap + "</h3>\n"
      html += "<table>"
      continue
    } else {
      var id = f[0].replace(" ", "_") 
      var b = f[0].split(":")
      var a = juice.split("\t")
      for (var i = 0; i < a.length; i++) {
          if (i == 0) { // the first line doesn't get display block so it
	    var langa = langcodes[sel["a"].value]
	    var dir_a = ""
	    if (!tlitcheck["a"].checked) {
	      // if not tlit, get dir 
	      dir_a = dir(langa)
	    } else {
	      dir_a = "ltr"
	    }
	    html += "<div dir='" + dir_a + "' class='" + dir_a + "'>"
	    html += "<sup id='" + id + "' onclick='sethash(\"" + id + "\")' >" + b[1] + "</sup>"
	    html += a[i] + "<br/>"
	    html += "</div>"
   	  } else { // the second field gets margin bottom
	    var langb = langcodes[sel["b"].value]
	    var dir_b = ""
	    if (!tlitcheck["b"].checked) {
	      // if not tlit, get dir
	      dir_b = dir(langb)
	    } else {
	      // if tlit, dir is ltr (for now)
	      dir_b = "ltr"
	    }
	      
	    html += "<div dir='" + dir_b + "' style='margin-top:10pt; margin-bottom:10pt; display: block'>" + a[i] + "</div>"
	  }
      }
    }
  }
  return html
}
function render() {
  var book = getparam("book")
  if (book == null) { book = "genesis" }
  renderbook(book)
}
function buildtoc(toctext) {
  var lines = toctext.split("\n")
  var out = {}
  for (var l of lines) {
    var f = l.split("\t")
    // map from the id-like name to the print name
    out[f[0]] = f[1]
  }
  return out
}
function getbybook(lines) {
  var out = {}
  var thisbook = null
  for (var line of lines) {
    var a = line.split(" ")
    // new book
    if (a[0] != thisbook) {
      out[a[0]] = []
      thisbook = a[0]
    }
    // put in the line with versetag
    out[thisbook].push(line)
  }
  return out   
}
function setparam(what, val) {
  var url = new URL(window.location)
  url.searchParams.set(what, val)
  history.pushState(null, "", url)
}
function getparam(what) {
  var params = new URLSearchParams(document.location.search)
  return params.get(what)
}
function getprintbook(booktag, toca, tocb) {
  var out = null
  //console.log("toca: " + toca + ", tocb:" + tocb)

  if (toca == null && tocb == null) {
    out = booktag
  }
  else {
    var booka = booktag
    // carry the translit
    if (toca != null) {
      booka = (tlitcheck["a"].checked ? translit(toca[booktag]) : toca[booktag])
    }
    var bookb = booktag
    if (tocb != null) {
      bookb = (tlitcheck["b"].checked ? translit(tocb[booktag]) : tocb[booktag])
    }
    out = booka + "&nbsp;&nbsp;" + bookb
  }
  return out
}
function biblebookchap(lines, tocs) {
  var inbook = null
  var inchap = null
  var out = []
  for (var l of lines) {
    var thisversetag = l[0]
    var a = thisversetag.split(/[ :]/)
    var thisbook = a[0]
    var thischap = a[1]
    // put the versetag with in, so that these lines are 'greppable' by book
    if (thisbook != inbook) {
      out.push(thisversetag + "\t##book " + getprintbook(thisbook, tocs[0], tocs[1])) // for two tocs for now
    }
    // chap has changed or we're in a new book
    if (thischap != inchap || inbook != thisbook) {
      out.push(thisversetag + "\t##chapter " + thischap)
      inchap = thischap
    }
    // wait with the book update here in case the last book was only with one chapter
    inbook = thisbook
    out.push(l[0] + "\t" + l[1] + "\t" + l[2])
  }
  return out
}
function renderbook(booktag) {
  setparam("book", booktag)
  console.log("renderbook " + booktag)
  var textwrap = document.getElementById("textwrap")
  var lines = insertwwtlit(bybook[booktag])
  textwrap.innerHTML = tohtml(lines)

  if (window.location.hash) {
    // get the string without the # character
    var hash = window.location.hash.substring(1)
    console.log("scrolling to hash: " + hash)
    // scroll to the element
    var el = document.getElementById(hash)
    if (el) { el.scrollIntoView() }
  }
}
function insertwwtlit(lines) {
  out = []
  for (var line of lines) {
    var outline = ""
    var f = line.split("\t")
    if (!f[1].match(/^##/)) {
      outline = f[0]
      for (var i = 1; i < f.length; i++) {
        var s = f[i]
        if (i == 1 && check["a"].checked) {
	  s = quickfixends(s)
	  outline += "\t" + ww.glhtml(s, langcodes[sel["a"].value], "en", tlitcheck["a"].checked)
	}
        else if (i == 2 && check["b"].checked) {
	  s = quickfixends(s)
	  // console.log(s)
	  outline += "\t" + ww.glhtml(s, langcodes[sel["b"].value], "en", tlitcheck["b"].checked)
	}
        //else {
	  // console.log("tlit b: " + tlitcheck["b"].checked)
	  // translit if set
	  if (i == 1 && tlitcheck["a"].checked || i == 2 && tlitcheck["b"].checked) {
	    //console.log("translit: " + translit(s))
	    outline += "\t" + translit(s)
	    
	  } else { // else don't translit
	    outline += "\t" + s
	  }
	//}
      }
    }
    else {
      outline = line
    }
    out.push(outline)    
  }
  return out
}
function dir(lang) {
  if (["he", "ar", "fa"].includes(lang)) {
    // right to left
    return "rtl"
  }
  // left to right
  return "ltr"
}
function sethash(hash) {
  if (history.pushState) {
    history.pushState(null, null, "#" + hash)
  } else {
    // support older browsers
    location.hash = "#" + hash
  }
}
function quickfixends(s) {
  s = s.replace(/כ(\P{L})/gu, "ך$1") // actually k$1
  s = s.replace(/מ(\P{L})/gu, "ם$1")
  s = s.replace(/נ(\P{L})/gu, "ן$1")
  s = s.replace(/פ(\P{L})/gu, "ף$1")
  s = s.replace(/צ(\P{L})/gu, "ץ$1")
 
  s = s.replace(/σ(\P{L})/g, "ς$1")
  return s
}


main()
