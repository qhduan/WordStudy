

// 本地词典缓存
var Dict = {
  download: function (words, callback) {
    var dict = DB.load("dict");
    var need = [];
    for (var i in words) {
      if (dict[words[i]]) continue;
      need.push(words[i]);
    }
    
    if (need.length == 0) {
      callback(dict);
      return;
    }
    
    // words is an array
    $.post("/api/words/", {"words": JSON.stringify(need)}, function (data) {
      if (data.success) {
        for (var i in data.success) {
          dict[i] = data.success[i];
        }
        DB.save("dict", dict);
        callback(dict);
      } else {
        console.log(words, data.message);
        callback(dict);
      }
    }, "json").fail(function() {
      callback(dict);
    });
  },
  word: function (word, callback, no_download) {
    if (!word || typeof callback != "function") {
      return;
    }
    
    if (no_download) {
      callback(dict[word]);
    } else {
      Dict.download([word], function (dict) {
        callback(dict[word]);
      });
    }
  },
  words: function (words, callback, no_download) {
    if (!$.isArray(words) || words.length <= 0 || typeof callback != "function") {
      return;
    }
    
    if (no_download) {
      var dict = DB.load("dict");
      var success = {};
      var fail = [];
      for (var i in words) {
        var word = words[i];
        if (dict[word]) {
          success[word] = dict[word]
        } else {
          fail.push(word);
        }
      }
      callback({success: success, fail: fail});
    } else {    
      Dict.download(words, function (dict) {
        var success = {};
        var fail = [];
        for (var i in words) {
          var word = words[i];
          if (dict[word]) {
            success[word] = dict[word]
          } else {
            fail.push(word);
          }
        }
        callback({success: success, fail: fail});
      });
    }
  }
};


// 测试列表中是否存在某单词
function ListExist (word) {
  var list = DB.load("list");
  for (var i in list) {
    var e = list[i];
    if (e.word == word)
      return true;
  }
  return false;
}

// 测试忽略列表中是否存在某单词
function IgnoreExist (word) {
  var ign = DB.load("ignore");
  for (var i in ign) {
    var e = ign[i];
    if (e == word)
      return true;
  }
  return false;
}


function DateToString (date) {
	var t = new Date();
	t.setTime(date - t.getTimezoneOffset() * 60 * 1000);
	return t.toISOString().replace(/\..+/, "").replace("T", " ");
}


// a solution from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Base64_encoding_and_decoding#The_.22Unicode_Problem.22
function b64en (str) {
	return window.btoa(unescape(encodeURIComponent( str )));
}

function b64de (str) {
	return decodeURIComponent(escape(window.atob( str )));
}