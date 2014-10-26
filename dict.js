var fs = require("fs");

var dictFile = fs.readFileSync("dict.json", {encoding: "utf-8"});
var dict = {};
try {
  dict = JSON.parse(dictFile);
} catch (e) {
  console.log("Dictionary parsing failed");
}
console.log("Dictionary was loaded,", Object.keys(dict).length, "items");

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

exports.GetWord = GetWord;
