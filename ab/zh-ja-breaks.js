// fill zhWords from zhArray
var zhWords = new Set()
for (var s of zhArray) {
    if (!zhWords.has(s)) {
	zhWords.add(s)
    }
}

// fill zhWords from zhArray
var jaWords = new Set()
for (var s of jaArray) {
    if (!jaWords.has(s)) {
	jaWords.add(s)
    }
}

// is chinese returns if character is chinese, could also be japanese
/* function isChinese(c) {
    return c.match(/[\u3400-\u9FBF]/)
}*/

// jpWordBreaks: japanese word breaks
function jaWordBreaks(s) {
    return wordBreaks(s, 5, jaWords)
}

// zhWordBreaks: chinese word breaks
function zhWordBreaks(s) {
    return wordBreaks(s, 3, zhWords)
}

// wordBreaks tries print spaces in s at word boundaries, max length cutOff, words dict
function wordBreaks(s, cutOff, words) {
    var out = ""
    var i = 0
    while (i < s.length) {
	var found = s.substr(i, 1)
	// from each position, look among the next three for the longest known word
	var goOn = true
	for (var l = 1; goOn && l <= cutOff; l++) {
	    var t = s.substr(i, l)
	    if (words.has(t)) {
//		console.log("check " + t + ": " + zhWords.has(t))
	    }
	    if (t.match(/\P{L}/u)) { // as soon as non-letter appears, flush
//		found = t
		goOn = false
	    }
	    if (words.has(t)) {
		found = t
	    }
	}
	out += found + " "
	i += found.length // increases i at least by one
    }
    
    return out
}
