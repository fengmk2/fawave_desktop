/**
 * monkey patch
 */

global.Storage = Storage;
global.localStorage = localStorage;
global.$ = $;
global.jQuery = jQuery;
global.document = document;
global.window = window;

// patch for localStorage
Storage.prototype.setObject = function (key, value) {
  this.setItem(key, JSON.stringify(value));
};

Storage.prototype.getObject = function (key) {
  var v = this.getItem(key);
  if (v) {
    try {
      v = JSON.parse(v);
    } catch (err) {
      v = null;
    }
  }
  return v;
};

// 微博字数
String.prototype.len = function () {
  return Math.round(this.replace(/[^\x00-\xff]/g, "qq").length / 2);
};

/**
 * 格式化字符串 from tbra
 * eg:
 *  formatText('{0}天有{1}个小时', [1, 24]) 
 *  or
 *  formatText('{{day}}天有{{hour}}个小时', {day:1, hour:24}}
 * @param {Object} msg
 * @param {Object} values
 */
function formatText(msg, values, filter) {
  var pattern = /\{\{([\w\s\.\(\)"',-\[\]]+)?\}\}/g;
  return msg.replace(pattern, function (match, key) {
    var value = values[key] || eval('(values.' + key + ')');
    if (typeof filter === 'function') {
      return filter(value, key);
    }
    return value;
  }); 
}

// 让所有字符串拥有模板格式化
String.prototype.format = function (data) {
  return formatText(this, data);
};

String.prototype.endswith = function (suffix) {
  return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

// 为字符串增加去除所有html tag和空白的字符的方法
String.prototype.remove_html_tag = function () {
  return this.replace(/(<.*?>|&nbsp;|\s)/ig, '');
};

//格式化时间输出。示例：new Date().format("yyyy-MM-dd hh:mm:ss");
Date.prototype.format = function (format) {
  var o = {
    "M+" : this.getMonth() + 1, //month
    "d+" : this.getDate(),    //day
    "h+" : this.getHours(),   //hour
    "m+" : this.getMinutes(), //minute
    "s+" : this.getSeconds(), //second
    "q+" : Math.floor((this.getMonth() + 3) / 3), //quarter
    "S" : this.getMilliseconds() //millisecond
  };
  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  }

  for (var k in o) {
    if (new RegExp("(" + k + ")").test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
    }
  }
  return format;
};


