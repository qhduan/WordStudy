
var Config = {
  create: function (key, def) {
    var cfg = DB.load("cfg");
    if (key in cfg) {
      //pass
    } else {
      cfg[key] = def;
    }
    DB.save("cfg", cfg);
  },
  get: function (key) {
    var cfg = DB.load("cfg");
    return cfg[key];
  },
  set: function (key, val) {
    var cfg = DB.load("cfg");
    cfg[key] = val;
    DB.save("cfg", cfg);
  },
  reset: function () {
    DB.save("cfg", {});
    Config.init();
  },
  init: function () {// 这里是设置的默认值，如果重置设置，则会重新运行这个函数，没有此项设置时会建立默认值
    Config.create("ChoosenLibrary", "");
    Config.create("StudyCount", 400);
    Config.create("ReviewCount", 400);
    Config.create("WordSelectLength", 6);
  }
};

Config.init();
