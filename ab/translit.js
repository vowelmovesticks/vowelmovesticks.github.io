var unicodeDict = new Map()
for (var entry of unicodeDictArray) {
    unicodeDict.set(entry[0], entry[1])
}
/*var unicodeDict = {}
for (var entry of unicodeDictArray) {
    unicodeDict[entry[0]] = entry[1]
}*/

//console.log("unicode dict:" + JSON.stringify(unicodeDict, null, " "))

var kanjiDict = new Map()
for (var entry of kanjiDict) {
    kanjiDict.set(entry[0], entry[1])
}

// isLatin returns if s.charAt(i) is latin.
// if c is a combining diacritical mark, return true if the nearest letter previous (or the nearest letter next, to-do?) are of latin script
function isLatin(s, i) {
    var c = s.charAt(i)
    // go to previous non-combining-diacritical
    while (isCombiningDiacriticalMark(s.charAt(i)) && i > 0) {
	i--
    }
    if (s.charAt(i).match(/\p{Script=Latin}/u)) {
	return true
    }
    return false
}

// isCombiningDiacriticalMark returns whether c is matched by \p{Block=CombiningDiacriticalMarks}, which isn't supported in javascript
function isCombiningDiacriticalMark(c) {
    return c.match(/[\u0300-\u036f]/u) // u0300-u036f: range of \p{Block=CombiningDiacriticalMarks}
}

function translit(oldTextContent, translitLatin) {
    if (!oldTextContent) {
	return ""
    }
    // insert blanks in chinese or thai
    var nblanks = (oldTextContent.match(/ /g) || []).length
    var insertBlanks = false

    var greekhused = false
    
    // decompose string. compose again with String.normalize("NFC")
    oldTextContent = oldTextContent.normalize("NFD") // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
    var newTextContent = ""

    for (var i = 0; i < oldTextContent.length; i++) {
	var c = oldTextContent.charAt(i)

	if (isLatin(oldTextContent, i) && !translitLatin) {
	    newTextContent += c;
	    continue;
	}

	// number and last character chinese? insert blank
	if (c.match(/\p{N}/u) && i > 0 && oldTextContent.charAt(i-1).match(/[\u3400-\u9FBF]/)) {
	    newTextContent += " "
	} 
	// japanese, hiragana, katakana, kanji? insert blanks.
	if (c.match(/\p{Script=Hiragana}/u) || c.match(/\p{Script=Katakana}/u) || c.match(/[\u4e00-\u9fbf]/)) {
	    newTextContent += " "
	}

	// arabic
	// drop diacritics preceeded or succeeded by letter of same vowel
	// arabic unicode: https://unicode.org/charts/PDF/U0600.pdf
	var lnext = nextLetter(oldTextContent, i)
	if (lnext) {
	    // drop fatha (a diacritic) before alef and before alef maksura
	    if (c.match(/\u064e/) && (lnext.match(/ا/) || lnext.match(/ى/))) { continue }
	    // drop damma (u diacritic) before u
	    if (c.match(/\u064f/) && lnext.match(/و/)) { continue }
	    // drop kasra (i diacritic) before i
	    if (c.match(/\u0650/) && lnext.match(/ي/)) { continue }
	}
	var lprev = prevLetter(oldTextContent, i)
	if (lprev) {
	    // drop fatha (a diacritic) after alif
	    if (c.match(/\u064e/) && lprev.match(/ا/)) { continue }
	    // drop damma (u diacritic) after u. does this actually occur?
	    if (c.match(/\u064f/) && lprev.match(/و/)) { continue }
	    // drop kasra (i diacritic) after i
	    if (c.match(/\u0650/) && lprev.match(/ي/)) { continue }
	}

	/*
	  greek h. if the next letters are greek vowels followed by a h, put the h now (if we haven't put it yet), otherwise we sometimes end up with ohs instead of hos, uhpo instead of hupo, etc.
	*/
	// get the upcoming string
	var upcoming = oldTextContent.substring(i) // i to the end
	if (greekhused == false && upcoming.match(/^[αεηιουω]*\u0314/i)) {
	    newTextContent += "h"
	    // remember that we put this h, in case it is preceeded by more than one vowel
	    greekhused = true
	}
	// free the greekhused when we come to the h
	if (c.match(/\u0314/)) { // greek h
	    greekhused = false
	    // the h was already put, continue
	    continue
	}

	newC = c;
	if(unicodeDict.has(c)) {
//	if (unicodeDict[c]) {
	    newC = unicodeDict.get(c)
	    //newC = unicodeDict[c]
	}
	// japanese kanji? (the chinese glyphs in japanese language)
	if ( /[\u4e00-\u9fbf]/.test(c) && kanjiDict.has(c) && isJapanese(oldTextContent)) {
	    newC = kanjiDict.get(c)
	}

	// chinese, and next character letter? insert blank
	if (/[\u3400-\u9FBF]/.test(c) && i < oldTextContent.length-1 && oldTextContent.charAt(i+1).match(/\p{Letter}/u)) {
	    newTextContent += " "
	}

	newTextContent += newC

    }
    //console.log("new:" + newTextContent)
    return newTextContent
}

function isJapanese(text) {
    return text.match(/\p{Script=Hiragana}/ug) || text.match(/\p{Script=Katakana}/ug)
}

// nextLetter returns the next letter in s
function nextLetter(s, i) {
    var j = nextLetterI(s, i)
    if (j == -1) { return null }
    return s.charAt(j)
}

// prevLetter returns the previous letter in s
function prevLetter(s, i) {
    var j = prevLetterI(s, i)
    if (j == -1) { return null }
    return s.charAt(j)
}

// nextLetterI returns index of the next letter in s starting at i
// if none return -1
function nextLetterI(s, i) {
    for (var j = i+1; j < s.length; j++) {
	if (s.charAt(j).match(/\p{L}/u)) return j
    }
    return -1
}

// prevLetterI returns index of the previous letter in s starting at i
// if none return -1
function prevLetterI(s, i) {
    for (var j = i-1; j >= 0; j--) {
	if (s.charAt(j).match(/\p{L}/u)) return j
    }
    return -1
}
