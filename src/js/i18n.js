/*!
 * fawave_desktop - i18n.js
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var path = require('path');
var fs = require('fs');

var root = path.dirname(__dirname);
var localesDir = path.join(root, '_locales');

var _i18n_messages_cache = {};

function loadMessagesSync(language) {
  var filepath = path.join(localesDir, language, 'messages.json');
  return eval('[' + fs.readFileSync(filepath, 'utf-8') + ']')[0];
}

function get(s, e) {
  var msg = _i18n_messages_cache[s];
  var message = s;
  if (msg) {
    message = msg.message || s;
    if (msg.placeholders && e && e.length > 0 && msg.message) {
      for (var k in msg.placeholders) {
        var index = parseInt(msg.placeholders[k].content.substring(1), 10) - 1;
        message = message.replace(new RegExp('\\$' + k + '\\$', 'g'), e[index]);
      }
    }
  }
  return message;
}
exports.get = get;

function setLanguage(language) {
  _i18n_messages_cache = loadMessagesSync(language);
}
exports.setLanguage = setLanguage;

// window.navigator.language || 
setLanguage('zh_CN');

