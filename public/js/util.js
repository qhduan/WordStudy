(function () {
  // 本地词典缓存
  var dict = {};

  function DownloadWords (words, callback) {
    
    if (words.length > 200) {
      var batch = Math.ceil(words.length / 200);
      
      var ok = 0;
      function Over () {
        ok++;
        if (ok == batch) {
          callback(dict);
        }
      }
      
      for (var i = 0; i < batch; i++) {
        Dict.download(words.slice(i*200, i*200+200), Over);
      }
    } else {
      
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
          callback(dict);
        } else {
          console.log(words, data.message);
          callback(dict);
        }
      }, "json").fail(function() {
        callback(dict);
      });
    }
  }
    
  function GetWord (word, callback) {
    if (typeof word != "string") {
      console.log("Dict.word invalid word", word);
      return;
    }
    
    if (typeof callback != "function") {
      return dict[word];
    } else {
      Dict.download([word], function (dict) {
        callback(dict[word]);
      });
    }
  }
  
  function TestWords (words, callback) {
    var good = [];
    var need = [];
    for (var i in words) {
      if (dict[words[i]]) good.push(words[i]);
      else need.push(words[i]);
    }
    
    if (need.length == 0) {
      return callback({success: words, fail: []});
    } else {
      $.post("/api/words/", {"words": JSON.stringify(need)}, function (data) {
        if (data.success) {
          var success = [];
          var fail = [];
          for (var i in words) {
            if (dict[words[i]] || data.success[words[i]])
              success.push(words[i]);
            else
              fail.push(words[i]);
          }
          callback({success: success, fail: fail});
        } else {
          console.log(words, data.message);
          callback({success: good, fail: need});
        }
      }, "json").fail(function() {
        callback({success: good, fail: need});
      });
    }
  }
  
  window.Dict = {
    download: DownloadWords,
    word: GetWord,
    test: TestWords
  };

})();


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
