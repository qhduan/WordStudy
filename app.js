var fs = require("fs");
var express = require("express");
var bodyParser = require("body-parser");

var dict = fs.readFileSync("dict.json", {encoding: "utf-8"})
dict = JSON.parse(dict)
console.log("Dictionary was loaded,", Object.keys(dict).length, "items");

var app = express();
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

app.get("/", function (req, res) {
	res.sendFile(__dirname + "/public/index.html");
});

function GetWord (word) {
	if (word == undefined || typeof(word) != "string") return "";
	word = word.trim();
	var w = word;
	if (w.length <= 0) return "";
	// try original
	if (w in dict) return dict[w];
	// word, try all lower case
	w = w.toLowerCase();
	if (w in dict) return dict[w];
	// Word, try upper head with lower tail
	w = w[0].toUpperCase() + w.substr(1);
	if (w in dict) return dict[w];
	// WORD, try upper case
	w = w.toUpperCase();
	if (w in dict) return dict[w];
	
	return "";
}

// get word
app.post("/word/", function (req, res) {
	// 'word' has to be a list of words in JSON
	
	var word = req.body.word;
	
	if (word == undefined) {
		res.json([]);
		res.end();
		console.log("nothing quit");
		return;
	}
	
	try {
		word = JSON.parse(word);
	} catch (e) {
		res.json([]);
		res.end();
		console.log("parse quit", e);
		return;
	}
	
	// not a valid array, or length is zero
	if (word.length == undefined || word.length <= 0) {
		res.json([]);
		res.end();
		console.log("undefined quit");
		return;
	}
	
	var answer = [];
	answer.length = word.length;
	for (var i = 0; i < word.length; i++) {
		answer[i] = GetWord(word[i]);
	}
	
	res.json(answer);
	res.end();
});

// test word
app.post("/testword/", function (req, res) {
	// 'word' has to be a list of words in JSON
	
	var word = req.body.word;
	
	if (word == undefined) {
		res.json([]);
		res.end();
		console.log("nothing quit");
		return;
	}
	
	try {
		word = JSON.parse(word);
	} catch (e) {
		res.json([]);
		res.end();
		console.log("parse quit", e);
		return;
	}
	
	// not a valid array, or length is zero
	if (word.length == undefined || word.length <= 0) {
		res.json([]);
		res.end();
		console.log("undefined quit");
		return;
	}
	
	var good = [];
	var bad = [];
	for (var i = 0; i < word.length; i++) {
		var w = word[i];
		if (GetWord(w) == "") {
			//s
			if (w.match(/s$/)) {
				var t = w.replace(/s$/, "");
				if (GetWord(t) != "") {
					good.push(t);
					continue;
				}
			}
			//es
			if (w.match(/es$/)) {
				var t = w.replace(/es$/, "");
				if (GetWord(t) != "") {
					good.push(t);
					continue;
				}
			}
			//er
			if (w.match(/er$/)) {
				var t = w.replace(/er$/, "");
				if (GetWord(t) != "") {
					good.push(t);
					continue;
				}
			}
			//er - e
			if (w.match(/er$/)) {
				var t = w.replace(/er$/, "e");
				if (GetWord(t) != "") {
					good.push(t);
					continue;
				}
			}
			//est
			if (w.match(/est$/)) {
				var t = w.replace(/est$/, "");
				if (GetWord(t) != "") {
					good.push(t);
					continue;
				}
			}
			//est - e
			if (w.match(/est$/)) {
				var t = w.replace(/est$/, "e");
				if (GetWord(t) != "") {
					good.push(t);
					continue;
				}
			}
			//ed
			if (w.match(/ed$/)) {
				var t = w.replace(/ed$/, "");
				if (GetWord(t) != "") {
					good.push(t);
					continue;
				}
			}
			//ed - e
			if (w.match(/ed$/)) {
				var t = w.replace(/ed$/, "e");
				if (GetWord(t) != "") {
					good.push(t);
					continue;
				}
			}
			//ing
			if (w.match(/ing$/)) {
				var t = w.replace(/ing$/, "");
				if (GetWord(t) != "") {
					good.push(t);
					continue;
				}
			}
			//ing - e
			if (w.match(/ing$/)) {
				var t = w.replace(/ing$/, "e");
				if (GetWord(t) != "") {
					good.push(t);
					continue;
				}
			}
			//ves - f
			if (w.match(/ves$/)) {
				var t = w.replace(/ves$/, "f");
				if (GetWord(t) != "") {
					good.push(t);
					continue;
				}
			}
			//ly
			if (w.match(/ly$/)) {
				var t = w.replace(/ly$/, "");
				if (GetWord(t) != "") {
					good.push(t);
					continue;
				}
			}
			
			bad.push(w);
		} else {
			good.push(w);
		}
	}
	
	res.json({good: good, bad: bad});
	res.end();
});

app.use(express.static(__dirname + "/public"));


//var PORT = 80
var PORT = 1234;

console.log("Choice port:", PORT);

app.listen(PORT);

console.log("System is running on", PORT);
