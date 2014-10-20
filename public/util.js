
var DB = {};

DB.create = function (name, def) {
	if (window.localStorage[name]) {
		//pass
	} else {
    window.localStorage[name] = JSON.stringify(def);
	}
};

DB.load = function (name) {
	var j = null;
	try {
		j = JSON.parse(window.localStorage[name]);
	} catch (e) {
		Alert("Database parse error");
		console.log("Database parse error");
	}
	return j;
};

DB.save = function (name, obj) {
	window.localStorage[name] = JSON.stringify(obj);
}

// 这里是数据库的空库默认类型，或者说初始化系统中这些数据库
DB.init = function () {
	DB.create("cfg", {});
	DB.create("dict", {});
	DB.create("lib", []);
	DB.create("list", []);
  DB.create("ignore", []);
};

DB.reset = function () {
	for (var i in window.localStorage) {
		delete window.localStorage[i];
	}
	DB.init();
};

DB.init();

function ListExist (word) {
  var list = DB.load("list");
  for (var i in list) {
    var e = list[i];
    if (e.word == word)
      return true;
  }
  return false;
}

function IgnoreExist (word) {
  var ign = DB.load("ignore");
  for (var i in ign) {
    var e = ign[i];
    if (e == word)
      return true;
  }
  return false;
}

function define (word) {
	var dict = DB.load("dict");
	return dict[word];
}

function GetWord (word, callback) {
	if (typeof(word) != "object" || word.length == undefined || word.length <= 0 || typeof(callback) != "function") {
		console.log("GetWord: something wrong");
	}
	var dict = DB.load("dict");
	var valid = [];
	var invalid = []
	for (var i in word) {
		if (dict.hasOwnProperty(word[i]))
			valid.push(word[i]);
		else
			invalid.push(word[i]);
	}
	if (invalid.length == 0) {
		callback();
	} else {
		RemoteGetWord(invalid, function (result) {
			if (result && result.length && result.length == invalid.length) {
				for (var i in invalid) {
					if (result[i] != "")
						dict[invalid[i]] = result[i];
				}
				DB.save("dict", dict);
				callback();
			} else {
				Alert("Download words info problem");
			}
		});
	}
}

function RemoteGetWord (word, callback) {
	$.post("/word/", {"word": JSON.stringify(word)}, function (data) {
		if (data && data.length && data.length == word.length)
			callback(data);
		else
			callback(undefined);
	}, "json").fail(function() {
		callback(undefined);
	});
}



function TestWord (word, callback) {
	if (word == undefined || typeof(callback) != "function")
		return;
	if (typeof(word) == "string")
		word = [word];
	
	$.post("/testword/", {"word": JSON.stringify(word)}, function (data) {
		if (data && data.good && data.bad && data.good.length != undefined && data.bad.length != undefined && (data.good.length + data.bad.length) == word.length)
			callback(data);
		else
			callback(undefined);
	}, "json").fail(function() {
		callback(undefined);
	});
}


function Alert (content, callback) {
  function AlertKey(e) {
	var k = e.which;
	if (k == 111 || k == 79) { //o or O press
		$("#AlertModalOk").click();
	}
	return false;
  }
  $(document).on("keypress", AlertKey);
  $("#AlertModalBody").html(content);
  $("#AlertModal").on("hidden.bs.modal", function () {
	$(document).off("keypress", AlertKey);
    $("#AlertModal").off("hidden.bs.modal");
    if (callback) callback();
  });
  $("#AlertModal").modal();
}

var ConfirmState = null;

function Confirm (content, callback) {
  function ConfirmKey(e) {
	var k = e.which;
	if (k == 121 || k == 89) { //y or Y press
		$("#ConfirmModalYes").click();
	} else if (k == 110 || k == 78) { //n or N press
		$("#ConfirmModalNo").click();
	}
	return false;
  }
  $(document).on("keypress", ConfirmKey);
  ConfirmState = null;
  $("#ConfirmModalBody").html(content);
  $("#ConfirmModal").on("hidden.bs.modal", function () {
	$(document).off("keypress", ConfirmKey);
    $("#ConfirmModal").off("hidden.bs.modal");
    if (callback) {
      callback(ConfirmState);
    }
  });
  $("#ConfirmModal").modal();
}

$(document).ready(function () {
  $("body").append("" +
  "<div class='modal fade' id='AlertModal' tabindex='-1' role='dialog' aria-labelledby='AlertModalLabel' aria-hidden='true' data-backdrop='static' data-keyboard='false'>" +
    "<div class='modal-dialog'>" +
      "<div class='modal-content'>" +
        "<div class='modal-header'>" +
          "<h4 id='AlertModalLabel' class='modal-title'>Alert</h4>" +
        "</div>" +
        "<div id='AlertModalBody' class='modal-body'>" +
        "</div>" +
        "<div class='modal-footer'>" +
          "<button type='button' id='AlertModalOk' class='btn btn-default' data-dismiss='modal'><span class ='glyphicon glyphicon-ok'></span> <u>O</u>k</button>" +
        "</div>" +
      "</div><!-- /.modal-content -->" +
    "</div><!-- /.modal-dialog -->" +
  "</div><!-- /.modal -->");
  
  
  $("body").append("" +
  "<div class='modal fade' id='ConfirmModal' tabindex='-1' role='dialog' aria-labelledby='ConfirmModalLabel' aria-hidden='true' data-backdrop='static' data-keyboard='false'>" +
    "<div class='modal-dialog'>" +
      "<div class='modal-content'>" +
        "<div class='modal-header'>" +
          "<h4 id='ConfirmModalLabel' class='modal-title'>Confirm</h4>" +
        "</div>" +
        "<div id='ConfirmModalBody' class='modal-body'>" +
        "</div>" +
        "<div class='modal-footer'>" +
          "<button type='button' id='ConfirmModalYes' class='btn btn-default' onclick='ConfirmState=true;' data-dismiss='modal'><span class='glyphicon glyphicon-ok'></span> <u>Y</u>es</button>" +
          "<button type='button' id='ConfirmModalNo' class='btn btn-default' onclick='ConfirmState=false;' data-dismiss='modal'><span class='glyphicon glyphicon-remove'></span> <u>N</u>o</button>" +
        "</div>" +
      "</div><!-- /.modal-content -->" +
    "</div><!-- /.modal-dialog -->" +
  "</div><!-- /.modal -->");
});

function DateToString (date) {
	var t = new Date();
	t.setTime(date);
	return t.toLocaleString();
}

var Config = {};
Config.create = function (key, def) {
	var cfg = DB.load("cfg");
	if (key in cfg) {
		//pass
	} else {
		cfg[key] = def;
	}
	DB.save("cfg", cfg);
};

Config.get = function (key) {
	var cfg = DB.load("cfg");
	return cfg[key];
};

Config.set = function (key, val) {
	var cfg = DB.load("cfg");
	cfg[key] = val;
	DB.save("cfg", cfg);
};

// 这里是设置的默认值，如果重置设置，则会重新运行这个函数，没有此项设置时会建立默认值
Config.init = function () {
	Config.create("ChoosenLibrary", "");
	Config.create("StudyCount", 100);
	Config.create("ReviewCount", 400);
	Config.create("WordSelectLength", 6);
};

Config.reset = function () {
	DB.save("cfg", {});
	Config.init();
};

Config.init();

// a solution from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Base64_encoding_and_decoding#The_.22Unicode_Problem.22
function b64en (str) {
	return window.btoa(unescape(encodeURIComponent( str )));
}

function b64de (str) {
	return decodeURIComponent(escape(window.atob( str )));
}

function bytelength (str) {
	//return str.length*4;
  var b = str.match(/[^\x00-\xff]/g);
  return (str.length + (!b ? 0: b.length)); 
}