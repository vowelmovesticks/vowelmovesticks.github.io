// quick fix
/*const fs = require("fs")
var homedir = "/home/max/lingobin"
eval(fs.readFileSync(homedir + '/ja-words.js')+'');
eval(fs.readFileSync(homedir + '/zh-words.js')+'');
eval(fs.readFileSync(homedir + '/zh-ja-breaks.js')+'');
*/

class lingobin {

  dict = {}

  constructor(dict={}) {
    this.dict = dict
  }

  gl(text, langa, langb="en", tlit=false, marksourceword=false) {
      if (text.match(/\[\[/) && text.match(/\]\]/)) {
          return text
      }
      text = lingobin.insertbreaks(text, langa)
      var a = lingobin.split(text, langa)
      var out = ""
      for (var w of a) {
  	// w is non-word
  	if (!w.match(/\p{L}/u)) {
  	    out += w
  	} else {
     	 	    // w is word
     	 	    var w_orig = w
     	 	    w = w.toLowerCase()
     	 	    var insert = ""
     	 	    if (langa == "en" && this.dict["en"][langb]) {
     	 	        if (this.dict["en"][langb][w]) {
     	 		    insert = this.dict["en"][langb][w]
     	 		}
     	 	    }
     	 	    else if (this.dict[langa] && this.dict[langa][w]) {
     	 		insert = this.dict[langa][w]
     	 	    }
     	 	    if (langa != "en" && langb != null && langb != "en") { 
     	 		insert = this._mocktranslate(insert, langb)
     	 	    }
     	    if (tlit == true) {
		console.log("translit from gl")
     	 	         w = translit(w, { translitLatin: false })
     	 	    }
     	 	    if (marksourceword) {
     	 		out += "<<" + w_orig + ">>"
     	 	    } else {
     	 		out += w_orig
     	 	    }
     	 	    out += " [[" + insert + "]]" 
  	}
      }
      return out
  }
  glhtml(text, langa, langb="en", tlit=false) {
    return lingobin.gltohtml(this.gl(text, langa, langb, tlit))
  }
  static gltohtml(s) {
      s = s.replaceAll(/ \[\[/g, '&nbsp;<span style="font-weight:normal">')
      s = s.replaceAll(/\[\[/g, '<span style="font-weight:normal">')
      s = s.replaceAll(/\]\]$/g, '<\/span>')
      s = s.replaceAll(/\]\] /g, '<\/span>&nbsp; ')
      s = s.replaceAll(/\]\]([^\p{L}\p{M}])+ ?/gu, '<\/span>$1&nbsp; ')
      s = s.replaceAll(/\]\]/g, '<\/span>&nbsp; ') 
      s = '<span style="font-weight: bold">' + s + '</span>'
      return s
  }
  _mocktranslate(en, lang) {
      var wrds = lingobin.words(en)
      wrds.sort((a, b) => { return b.length - a.length })
      var smallwords = ["and", "or", "i", "you", "he", "she", "it", "we", "they", "my", "your", "his", "her", "our", "their"]
      var wmax = wrds[0] // longest word
      if (smallwords.includes(wmax) && wrds.length > 1) {
        wmax = wrds[1]
      }
      if (this.dict["en"][lang] && this.dict["en"][lang][wmax]) {
  	return this.dict["en"][lang][wmax]
      }
      return en
  }
  static split(text, lang) {
      if (!text) { return [] }
      var nonword = "[^\\p{L}\\p{M}]"
      var r =
          "("
  	+ "^" + nonword + "+" 
  	// or
  	+ "|"
  	+ nonword + "*" + "[\\s" + (lang != "id" ? "\\-" : "") + "]+" + nonword + "*"
  	// or
  	+ "|"
  	+ nonword + "+$"
  	// close group
  	+ ")"
      var reg = new RegExp(r, "u") // u: unicode character classes used
      return text.split(reg)
  }
  static words(text, lang) {
      text = this.insertbreaks(text, lang) // todo: pass lang
      var a = this.split(text, lang) 
      var out = []
      for (var w of a) {
       	if (!lingobin.isword(w)) {
       	    continue
       	} else { // w is word, print
       	    out.push(w)
       	}
      }
      return out
  }
  static isword(w) {
      if (!w.match(/\p{L}/u) || w.match(/[^\p{L}\p{M}\-'\u200c]/u)) {
  	return false
      }
      return true
  }
  static insertbreaks(text, lang) {
      if (lang == "zh") {
  	text = zhWordBreaks(text)
      } else if (lang == "ja") {
  	text = jaWordBreaks(text)
      }
      return text
  }
  hasdict(langa, langb="en") {
    if (langb == "en") {
      return this.dict.hasOwnProperty(langa)
    }
    else { 
      return this.dict.hasOwnProperty(langa) && this.dict.hasOwnProperty("en") && this.dict["en"].hasOwnProperty(langb)
    }
  }
  adddict(newdict) {
    this.dict = lingobin.merge(this.dict, newdict)
  }
  static merge(dto, dfrom) {
      var out = Object.assign({}, dto)
      for (var lang of Object.keys(dfrom)) {
         	if (!out[lang]) { out[lang] = {} }
         	if (lang == "en") {
         	    out["en"] = lingobin.merge(out["en"], dfrom["en"])
         	}
                 else { 
         	    for (var [w, tlate] of Object.entries(dfrom[lang])) {
         		out[lang][w.toLowerCase()] = tlate.toLowerCase()
         	    }
         	}
      }
      return out
  }
  static towst(s) {
    var out = []
    var intranslate = false
    var gather = ""
    a = lingobin.split(s, "en")
    //console.log("split: " + JSON.stringify(a))
    for (var i = 0; i < a.length; i++) {
      //console.log("a[i]: " + a[i])
      if (a[i].match(/\[\[\]\]/)) {
        var before = a[i].substring(0, a[i].indexOf("[["))
        out.push({ txt: before, type: "s" })
        out.push({ txt: "", type: "t" })
        var after = a[i].substring(a[i].indexOf("]]")+2, a[i].length)
        out.push({ txt: after, type: "s" })
      } else if (a[i].match(/\[\[/)) {  
        var j = a[i].indexOf("[[")
        var before = a[i].substring(0, j)
        if (j > 0) {
          out.push({ txt: before, type: "s" })
        }
        intranslate = true
        var after = a[i].substring(j+2, a[i].length)
        gather = after
      } else if (a[i].match(/\]\]/)) {
        var j = a[i].indexOf("]]")
        var before = a[i].substring(0, j)
        gather += before
        out.push({ txt: gather, type: "t" })
        var after = a[i].substring(j+2, a[i].length)
        if (after != "") {
          out.push({ txt: after, type: "s" })
        }
        intranslate = false
        gather = ""
      } else if (intranslate == true) {
        //console.log("intranslate: " + a[i])
        gather += a[i]
      } else {
        if (lingobin.isword(a[i])) {
          out.push({ txt: a[i], type: "w" })
        } else {
          out.push({ txt: a[i], type: "s" })
        }
      }
    }
    //console.log("wst out: " + JSON.stringify(out))
    return out
  }
  static fromwst(wst) {
    out = ""
    for (var i = 0; i < wst.length; i++) {
      if (wst[i].type == "t") {
        out += "[[" + wst[i].txt + "]]"
      } else {
        out += wst[i].txt
      }
    }
    return out
  }
}
// comment this out for use in chrome extension
//module.exports = lingobin
