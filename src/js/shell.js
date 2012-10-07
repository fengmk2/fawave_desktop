/*!
 * fawave - lib/shell.js
 * Source: https://github.com/zcbenz/nw-file-explorer/blob/master/node_modules/shell.js
 * 
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var child_process = require('child_process');

var cmd;
if (process.platform === 'win32') {
  cmd = 'start "%ProgramFiles%\Internet Explorer\iexplore.exe"';
} else if (process.platform === 'linux') {
  cmd = 'xdg-open';
} else if (process.platform === 'darwin') {
  cmd = 'open';
}

exports.open = function (uri) {
  child_process.exec(cmd + ' "' + uri + '"');
};