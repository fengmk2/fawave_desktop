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

var oauth_callback = 'http://localhost.nodeweibo.com:8088/oauth/callback';

// init appkey
weibo.init('tqq', '801196838', '9f1a88caa8709de7dccbe3cae4bdc962', oauth_callback);
weibo.init('weibo', '1122960051', 'e678e06f627ffe0e60e2ba48abe3a1e3', oauth_callback);

// weibo.init('twitter', 'i1aAkHo2GkZRWbUOQe8zA', 'MCskw4dW5dhWAYKGl3laRVTLzT8jTonOIOpmzEY', 'oob');

var users = {
  tqq: {
    blogtype: 'tqq',
    oauth_token: '2d746f8c91ae4baea7243a6867cf309f',
    oauth_token_secret: '2bec75e9ddad6b27067e384a84550e38',
    name: 'node-weibo'
  },
  weibo: { 
    blogtype: 'weibo',
    access_token: '2.00EkofzBtMpzNBb9bc3108d8MwDTTE',
    uid: 1827455832,
  }
};

$(function () {

var $console = $('#console');
$console.html(Object.keys(weibo.TYPES).join(', '));



});



