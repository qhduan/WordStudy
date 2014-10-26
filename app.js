var fs = require("fs");
var express = require("express");
var bodyParser = require("body-parser");
var compression = require('compression');

var dict = require("./dict");

var app = express();
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(compression());

app.get("/", function (req, res) {
	res.sendFile(__dirname + "/public/index.html");
});


app.post("/api/words", function (req, res) {
  var words = req.body.words;
  
  if (!words) {
    res.json({message: "words undefined"});
    res.end();
    return;
  }
  
  try {
    words = JSON.parse(words);
  } catch (e) {
    res.json({message: "words parsing failed"});
    res.end();
    return;
  }
  
  if (words.length <= 0) {
    res.json({message: "words empty"});
    res.end();
    return;
  }
  
  var answer = {};
  for (var i in words) {
    var word = words[i];
    if (!answer[word]) {
      var def = dict.GetWord(word);
      if (def) answer[word] = def;
    }
  }
  
  res.json({success: answer});
  res.end();
  return;
});


app.use(express.static(__dirname + "/public"));

var PORT = 1234;
app.listen(PORT, function () {
  console.log("System is running on", PORT);
});


