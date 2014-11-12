

/*
 * @ NAME: Cross-browser TextStorage
 * @ DESC: text storage solution for your pages
 * @ COPY: sofish, http://sofish.de
 */
typeof window.localStorage == 'undefined' && ~function(){
 
    var localStorage = window.localStorage = {},
        prefix = 'data-userdata',
        doc = document,
        attrSrc = doc.body,
        html = doc.documentElement,
         
        // save attributeNames to <html>'s
        // data-userdata attribute
        mark = function(key, isRemove, temp, reg){
         
            html.load(prefix);
            temp = html.getAttribute(prefix);
            reg = RegExp('\\b' + key + '\\b,?', 'i');
             
            hasKey = reg.test(temp) ? 1 : 0;
                 
            temp = isRemove ? temp.replace(reg, '').replace(',', '') :
                    hasKey ? temp : temp === '' ? key :
                        temp.split(',').concat(key).join(',');
                     
         
            html.setAttribute(prefix, temp);
            html.save(prefix);
 
        };
         
    // add IE behavior support
    attrSrc.addBehavior('#default#userData');
    html.addBehavior('#default#userData');
         
    //
    localStorage.getItem = function(key){
        attrSrc.load(key);
        return attrSrc.getAttribute(key);
    };
     
    localStorage.setItem = function(key, value){
        attrSrc.setAttribute(key, value);
        attrSrc.save(key);
        mark(key);
    };
     
    localStorage.removeItem = function(key){
        attrSrc.removeAttribute(key);
        attrSrc.save(key);
        mark(key, 1);
    };
     
    // clear all attributes on <body> that using for textStorage
    // and clearing them from the 'data-userdata' attribute's value of <html>
    localStorage.clear = function(){
     
        html.load(prefix);
     
        var attrs = html.getAttribute(prefix).split(','),
            len = attrs.length;
             
        for(var i=0;i<len;i++){
            attrSrc.removeAttribute(attrs[i]);
            attrSrc.save(attrs[i]);
        };
         
        html.setAttribute(prefix,'');
        html.save(prefix);
         
    };
    
}();

function bytelength (str) {
	//return str.length*4;
  var b = str.match(/[^\x00-\xff]/g);
  return (str.length + (!b ? 0: b.length)); 
}

var DB = {
  create: function (name, def) {
    if (window.localStorage.getItem(name)) {
      //pass
    } else {
      window.localStorage.setItem(name, JSON.stringify(def));
    }
  },
  load: function (name) {
    var j = null;
    try {
      j = JSON.parse(window.localStorage.getItem(name));
    } catch (e) {
      alertify.alert("Database parse error: " + name);
      console.log("Database parse error", name);
    }
    return j;
  },
  save: function (name, obj) {
    window.localStorage.setItem(name, JSON.stringify(obj));
  },
  reset: function () {
    window.localStorage.clear();
    DB.init();
  },
  size: function () {
    var str = "";
    DB.list.forEach(function (key) {
      str += window.localStorage.getItem(key);
    });
    return bytelength(str);
  },
  init: function () {
    // 这里是数据库的空库默认类型，或者说初始化系统中这些数据库
    // 数据库必须在这里有定义
    DB.create("cfg", {}); // 设置
    DB.create("lib", []); // 词库
    DB.create("list", []); // 列表
    DB.create("ignore", []); // 忽略列表
    DB.list = ["cfg", "lib", "list", "ignore"];
  }
};

DB.init();

