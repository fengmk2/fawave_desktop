/*!
 * fawave - lib/utils.js
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

/**
 * Constant defines start
 */

var i18n = require('./i18n');
var tapi = require('weibo');

// var VERSION = 20110220;
// function getVersion() {
//   var ver = localStorage.getObject('VERSION');
//   return ver;
// }

// function updateVersion() {
//   localStorage.setObject('VERSION', VERSION);
// }

function display_size(bytes) {   // simple function to show a friendly size
  var i = 0, fixed = 0;
  while (1023 < bytes) {
    bytes /= 1024;
    ++i;
  }
  if (i > 1) {
    fixed = 1;
  }
  return bytes.toFixed(fixed) + [" B", " KB", " MB", " GB", " TB"][i];
}
exports.display_size = display_size;

/**
 * Action Cache 
 * @type {Object}
 */
var ActionCache = exports.ActionCache = {
  _cache: {},
  _get_cache: function () {
    return this._cache;
  },
  set: function (key, value) {
    var cache = this._get_cache();
    if (value === null || value === undefined) {
      delete cache[key];
    } else {
      cache[key] = JSON.stringify(value);
    }
  },
  get: function (key) {
    var cache = this._get_cache();
    var value = cache[key];
    if (value) {
      value = JSON.parse(value);
    }
    return value;
  }
};

/**
 * Text process helpers
 */

// HTML 编码
// test: hard code testing 。。。 '"!@#$%^&*()-=+ |][ {} ~` &&&&&amp; &lt; & C++ c++c + +c &amp;
function HTMLEnCode(str) {
  str = str || '';
  return str.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// window.htmlencode = HTMLEnCode;

// html转换为text
function htmlToText(html) {
  var tmp = document.getElementById('__htmldecode__tmp__');
  if (!tmp) {
    // 避免多次创建和销毁对象
    tmp = document.createElement("DIV");
    tmp.setAttribute('id', '__htmldecode__tmp__');
    tmp.setAttribute('style', 'display:none;');
    document.body.appendChild(tmp);
  }
  tmp.innerHTML = html;
  return tmp.innerText;
}

// window.htmldecode = htmlToText;

/**
 * 链接的html 转换为 url + text, href and src
 *
 * @param {String} html
 * @return {Object}
 *  - {Strint} text
 *  - {String} [images]
 */
function linkToText(html) {
  html = html || '';
  var images = [];
  html = html.replace(/<a[^>]+href=[\'\"]([^\'\"]+)[\'\"][^>]*>([^<]*)<\/a>/ig, function (m, url, text) {
    return url + ' ' + (text || '');
  }).replace(/<img[^>]+src=[\'\"]([^\'\"]+)[\'\"]\/?>/ig, function (m, src) {
    images.push(src);
    return src;
  });
  return {
    text: htmldecode(html),
    images: images
  };
}

// UBB内容转换
function ubbCode(str) {
  if (!str) {
    return '';
  }
  var result = str;
  var reg = new RegExp("(^|[^/=\\]'\">])((www\\.|http[s]?://)[\\w\\.\\?%&\\-/#=;!\\+]+)", "ig");
  var reg2 = new RegExp("\\[url=((www\\.|http[s]?://)[\\w\\.\\?%&\\-/#=;:!\\+]+)](.+)\\[/url]", "ig");
  var tmp = reg.exec(result);
  if (tmp && tmp.length > 0) {
    result = result.replace(reg, "<a href='" + tmp[2] + "' target='_blank'>" + tmp[2] + "</a>");
  }
  tmp = reg2.exec(result);
  if (tmp && tmp.length > 0) {
    result = result.replace(reg2, "<a href='" + tmp[1] + "' target='_blank'>" + tmp[3] + "</a>");
  }
  return result;
}
