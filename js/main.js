/*!
 * fawave - js/main.js
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var weibo = require('weibo');

console.log(Object.keys(weibo.TYPES).join(', '));

$(function () {

var $console = $('#console');
$console.html(Object.keys(weibo.TYPES).join(', '));

});



