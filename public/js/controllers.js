

var WordStudyControllers = angular.module("WordStudyControllers", []);


WordStudyControllers.controller("mainController", function ($scope, $q) {
  
  function GetWord (word) {
    var deferred = $q.defer();
    Dict.word(word, function (def) {
      if (def) deferred.resolve(def);
      else deferred.reject();
    });
    return deferred.promise;
  }
  
  $scope.word = "";
  $scope.def = "";
  
  $scope.setdef = function (def) {
    $scope.def = def;
  };
  
  $scope.lookup = function () {
    $scope.def = "";
    GetWord($scope.word).then(function (def) {
      $scope.def = def;
    }, function () {
      $scope.def = "没找到";
    });
  };
});


WordStudyControllers.controller("studyController", function ($scope) {
  $scope.info = "info";
  $scope.word = "word";
  $scope.def = "def";
  $scope.wordInput = "";
  
  var words = [];
  var success = [];
  var ignore = [];
  
  var colors = ["#FF3300", "#FF3333", "#FF6600", "#FF6633"];  
  $scope.randomColor = function () {
    var i = Math.floor(Math.random() * colors.length);
    $scope.wordStyle = { color: colors[i] };
  };
  $scope.randomColor();
  
  function TestStudyLibrary () {
    var lib = DB.load("lib");
    var name = Config.get("ChoosenLibrary");
    if (name == "") {
      return false;
    } else {
      for (var i in lib) {
        if (lib[i].name == name && lib[i].learned < lib[i].total) {
          return true;
        }
      }
      return false;
    }
  }
  
  function ShowPage () {
    if (words.length > 0) {
      $scope.word = words[0].word;
      $scope.def = "";
      $scope.info = "" + (success.length + 1) + " / " + (success.length + words.length);
      $scope.randomColor();
    } else {
      // finish
      var successList = [];
      var ignoreList = [];
      success.forEach(function (word) {
        successList.push(word.word + word.date);
      });
      ignore.forEach(function (word) {
        ignoreList.push(word.word + word.date);
      });
      var list = DB.load("list");
      
      list = list.filter(function (elem) {
        if (ignoreList.indexOf(elem.word + elem.date) != -1) return false;
        return true;
      });
      
      var now = new Date().getTime();
      
      list.forEach(function (elem, i, array) {
        if (successList.indexOf(list[i].word + list[i].date) != -1) {
          array[i].count++;
          array[i].next = now;
        }
      });
      
      DB.save("list", list);
      
      Alert("Study over", function () {
        window.location.href = "#/main";
      });
    }
  };
  
  (function () {
    var list = DB.load("list");
    var availible = [];
    list.forEach(function (word) {
      if (word.count == -1) availible.push(word);
    });
    console.log(list, availible);
    if (list.length <= 0 || availible.length <= 0) {
      return Alert("No availible words in list", function () {
        window.location.href="#/main";
      });
    }
    
    for (var i in availible) {
      words.push(availible[i]);
      if (words.length >= 200) break;
    }
    
    ShowPage();
    
  })();
  
  $scope.enter = function () {
    if ($scope.wordInput.trim().toLowerCase() == $scope.word.trim().toLowerCase()) {
      success.push(words[0]);
      words.splice(0, 1);
      $scope.wordInput = "";
    }
    ShowPage();
  };
  
  $scope.skip = function () {
    ignore.push(words[0]);
    words.splice(0, 1);
    $scope.wordInput = "";
    ShowPage();
  };
  
});


WordStudyControllers.controller("reviewController", function ($scope, $document) {
  $scope.word = "word"
  $scope.def = "def"
  $scope.info = "info"
  $scope.rememberStyle = {display: ""};
  $scope.checkStyle = {display: "none"};
  $scope.nextStyle = {display: "none"};
  
  var list = DB.load("list");
  var availible = [];
  var finish = [];
  
  var colors = ["#FF3300", "#FF3333", "#FF6600", "#FF6633"];  
  $scope.randomColor = function () {
    var i = Math.floor(Math.random() * colors.length);
    $scope.wordStyle = { color: colors[i] };
  };
  $scope.randomColor();
  
  $scope.keyPressed = function (e) {
    var k = e.which;
    if (k == 82 || k == 114) { // R | r
      if ($scope.rememberStyle.display == "") {
        $scope.remember(true);
      } else if ($scope.checkStyle.display == "") {
        $scope.check(true)
      } else if ($scope.nextStyle.display == "") {
      }
    } else if (k == 78 || k == 110) { // N | n
      if ($scope.rememberStyle.display == "") {
        $scope.remember(false);
      } else if ($scope.checkStyle.display == "") {
        $scope.check(false)
      } else if ($scope.nextStyle.display == "") {
        $scope.check(false)
      }
    }
  };
  
  function ShowPage () {
    if (availible.length) {
      $scope.word = availible[0].word;
      $scope.def = "";
      $scope.info = "" + finish.length + " / " + (finish.length + availible.length);
      $scope.randomColor();
      $scope.rememberStyle = {display: ""};
      $scope.checkStyle = {display: "none"};
      $scope.nextStyle = {display: "none"};
    } else {
      
      var list = DB.load("list");
      var now = new Date().getTime();
      var SECOND = 1000;
      var MINUTE = 60 * SECOND;
      var HOUR = 60 * MINUTE;
      var DAY = 24 * HOUR;
      var WEEK = 7 * DAY;
      var MONTH = 4 * WEEK;
      
      var TIMECAL = [
        HOUR,
        DAY,
        DAY * 3,
        WEEK,
        WEEK * 2,
        MONTH,
        MONTH * 2,
        MONTH * 5,
        MONTH * 10,
        MONTH * 24,
        MONTH * 36,
        MONTH * 48
      ];
      
      function FindFinish (elem) {
        for (var i in finish) {
          if (finish[i].word == elem.word && finish[i].date == elem.date)
            return finish[i];
        }
        return null;
      }
      
      list.forEach(function (elem, i, array) {
        var fin = FindFinish(elem);
        if (fin) {
          array[i].next = now + TIMECAL[elem.count];
          array[i].count++;
          array[i].fail = fin.fail;
        }
      });
      
      DB.save("list", list);
      
      Alert("Review over", function () {
        window.location.href = "#/main";
      });
    }
  }
  
  $scope.remember = function (f) {
    Dict.word(availible[0].word, function (def) {
      $scope.def = def;
    });
    if (f) { // remember
      $scope.rememberStyle = {display: "none"};
      $scope.checkStyle = {display: ""};
      $scope.nextStyle = {display: "none"};
    } else { // not at all
      $scope.rememberStyle = {display: "none"};
      $scope.checkStyle = {display: "none"};
      $scope.nextStyle = {display: ""};
    }
  };
  
  $scope.check = function (f) {
    if (f) { // remember && right
      if (availible[0].rem) {
        delete availible[0].rem;
        finish.push(availible[0]);
        availible.splice(0, 1);
      } else {
        var temp = availible[0];
        temp.rem = 1;
        availible.splice(0, 1);
        if (availible.length > 20) {
          var pos = Math.floor(Math.random() * 10) + 10;
          availible.splice(pos, 0, temp);
        } else {
          availible.push(temp);
        }
      }
    } else { // (remember && wrong) || (not at all)
      if (availible[0].rem) {
        delete availible[0].rem;
      }
      var temp = availible[0];
      temp.fail++;
      availible.splice(0, 1);
      if (availible.length > 20) {
        var pos = Math.floor(Math.random() * 10) + 10;
        availible.splice(pos, 0, temp);
      } else {
        availible.push(temp);
      }
    }
    ShowPage();
  };
  
  (function () {
    var now = new Date().getTime();
    list.forEach(function (word) {
      if (word.next <= now) {
        availible.push(word);
      }
    });
    
    if (!availible.length) {
      Alert("No word need review", function () {
        window.location.href = "#/main";
      });
      return;
    }
    
    ShowPage();
  })();
  
});


WordStudyControllers.controller("listController", function ($scope, $q) {
  var maxPage = 12;
  $scope.page = 0;
  $scope.prevDisabled = false;
  $scope.nextDisabled = false;
  
  $scope.DateToString = DateToString;
  
  var list = DB.load("list");
  if (list.length <= 0) {    
    return Alert("No words in list", function () {
      window.location.href="#/main";
    });
  }
  
  function ShowPage () {
    $scope.info = ($scope.page + 1) + " / " + Math.ceil(list.length / maxPage);
    $scope.words = list.slice($scope.page * maxPage, $scope.page * maxPage + maxPage);
    
    $scope.prevDisabled = false;
    $scope.nextDisabled = false;
    
    if ($scope.page == 0) {
      $scope.prevDisabled = true;
    }
    
    if ($scope.page == (Math.ceil(list.length / maxPage) - 1)) {
      $scope.nextDisabled = true;
    }
  }
  
  ShowPage();
    
  $scope.prev = function () {
    if ($scope.page > 0) {
      $scope.page--;
      ShowPage();
    }
  };
  
  $scope.next = function () {
    if ($scope.page < (Math.ceil(list.length / maxPage) - 1) && (Math.ceil(list.length / maxPage) - 1) >= 0) {
      $scope.page++;
      ShowPage();
    }
  };
  
  function remove (word, date) {
    var deferred = $q.defer();
    Confirm("Are you sure remove '" + word + "'?", function () {
      list = list.filter(function (elem) {
        if (elem.word == word && elem.date == date) return false;
        return true;
      });
      DB.save("list", list);
      deferred.resolve();
    });
    return deferred.promise;
  }
  
  $scope.remove = function (word, date) {
    remove(word, date).then(ShowPage);
  };
  
  function removeSelect (select) {
    var deferred = $q.defer();
    Confirm("Are you sure remove " + select.length + " words?", function () {
      var selectWords = [];
      select.each(function () {
        selectWords.push($(this).data("word") + $(this).data("date"))
      });
      
      list = list.filter(function (elem) {
        if (selectWords.indexOf(elem.word + elem.date) != -1) return false;
        return true;
      });
      DB.save("list", list);
      deferred.resolve();
    });
    return deferred.promise;
  }
  
  $scope.removeSelect = function () {
    var select = $("input:checked");
    if (select.length == 0) {
      Alert("No word selected");
    } else {
      removeSelect(select).then(ShowPage);
    }
  };
  
  $scope.selectAll = function () {
    if ($("input").length == $("input:checked").length) {
      $("input").prop("checked", false);
    } else {
      $("input").prop("checked", true);
    }
  };
});



WordStudyControllers.controller("libraryController", function ($scope) {
  
});



WordStudyControllers.controller("manualController", function ($scope, $q) {
  $scope.input = "";
  $scope.goodWords = [];
  $scope.badWords = [];
  
  function GetWords (words) {
    var deferred = $q.defer();
    Dict.words(words, function (result) {
      deferred.resolve(result);
    });
    return deferred.promise;
  }
  
  $scope.testCheck = function (word) {
    if (word.length >= Config.get("WordSelectLength")
      && IgnoreExist(word) == false
      && ListExist(word) == false) {
      return true;
    } else {
      return false;
    }
  };
  
  $scope.parse = function () {
    $scope.goodWords = [];
    $scope.badWords = [];
    var str = $scope.input;
    str = str.replace(/[^a-zA-Z-]+/g, function () {
      return "\n";
    });
    while(str.indexOf("\n\n") != -1) {
      str = str.replace(/\n\n/g, function () {
        return "\n";
      });
    }
    str = str.split("\n");
    var words = [];
    str.forEach(function (word) {
      word = word.toLowerCase();
      if (words.indexOf(word) == -1) words.push(word);
    });
    
    GetWords(words).then(function (result) {
      $scope.goodWords = Object.keys(result.success);
      $scope.goodWords.sort(function (a, b) {
        if (a.length > b.length) return -1;
        else if (a.length < b.length) return 1;
        else {
          if (a > b) return 1;
          else return -1;
        }
      });
      $scope.badWords = result.fail;
    });
  };
  
  $scope.add = function () {
    var input = $("input.goodWords:checked");
    if (input.length <= 0) {
      Alert("No valid choosen word");
    } else {
      var words = [];
      input.each(function () {
        words.push($(this).data("word"));
      });
      Confirm("Found " + words.length + " words, add them into list now?", function () {
        var wl = DB.load("list");
        var now = new Date().getTime();
        var nwl = [];
        for (var i in words) {
          var e = {};
          e.word = words[i];
          e.date = now;
          e.next = now;
          e.count = -1;
          e.fail = 0;
          nwl.push(e);
          now++;
        }
        DB.save("list", nwl.concat(wl));
        
        var ignore = DB.load("ignore");
        for (var i in words) {
          var word = words[i];
          if (ignore.indexOf(word) == -1) ignore.push(word);
        }
        DB.save("ignore");
        
        window.location.href = "#/main";
      });
    }
  };
  
  $scope.changeCheck = function (word) {
    $("input.goodWords[type='checkbox']").each(function () {
      if ($(this).data("word") == word) {
        $(this).prop("checked", !$(this).prop("checked"));
      }
    });
  };
});



WordStudyControllers.controller("settingController", function ($scope) {
  
  function Init () {
    $scope.info = DB.size()/1000 + " KBytes";
    $scope.file = "";
    $scope.maxStudyCount = Config.get("StudyCount");
    $scope.maxReviewCount = Config.get("ReviewCount");
    $scope.maxSelectLength = Config.get("WordSelectLength");
  };
  
  Init();
  
  $scope.export = function () {
    var s = {};
    DB.list.forEach(function (key) {
      if (key == "dict") return;
      s[key] = DB.load(key);
    });
    
    s = JSON.stringify(s);
    s = b64en(s);
    
    var now = new Date();
    var filename = "WordStudy_save_" + now.getFullYear() + "_" + (now.getMonth() + 1) + "_" + now.getDate() + ".txt";
    var blob = new Blob([s], {type: "text/plain;charset=utf-8"});
    saveAs(blob, filename);
  };
  
  $scope.openFile = function () {
    $("input[type='file']").click();
  };
  
  $scope.import = function (f) {
		if (f.files && f.files.length > 0) {
			var file = f.files[0];
			console.log(file);
			var name = file.name;
			var ext = name.substr(name.length - 3);
			name = name.substr(0, name.length - 4);
			
			if (ext != "txt") {
				Alert("Only text file support");
				return;
			}
			
			var reader = new FileReader();
			reader.onerror = function () {
				Alert("Load file faiure");
			};
			reader.onload = function (e) {
				var v = this.result;
        v = v.trim();
        if (v == "") return;
        v = b64de(v);
        var j;
        try {
          j = JSON.parse(v);
        } catch (e) {
          console.log(e);
          Alert("Save data parse error");
          return;
        }
        
        Confirm("Are you sure load the save data?", function () {
          for (var i in j) {
            window.localStorage.setItem(i, j[i]);
          }
          window.location.href = "#/main";
        });
			};
			reader.readAsText(file);
		}
  };
  
  $scope.reset = function () {
    Confirm("Are you sure reset all data? You can't restore it.", function () {
      DB.reset();
      window.location.href = "#/main";
    });
  };
  
  $scope.save = function () {
    Config.set("StudyCount", $scope.maxStudyCount);
    Config.set("ReviewCount", $scope.maxReviewCount);
    Config.set("WordSelectLength", $scope.maxSelectLength);
  };
  
  $scope.load = function () {
    Config.reset();
    Init();
  };
  
});
