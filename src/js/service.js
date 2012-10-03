/*!
 * fawave - js/service.js
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var weiboutil = require('weibo/lib/utils');

var Nodebox = exports.Nodebox = {
  host: 'nfs.nodeblog.org',
  url_re: /http:\/\/nfs\.nodeblog.org\/\w\/\w\/\w+\.(jpg|png|bmp|gif|webp|jpeg)/i,
  sync: true,
  get: function (url, callback) {
    var pics = {
      thumbnail_pic: url,
      bmiddle_pic: url,
      original_pic: url
    };
    callback(pics);
  },
  upload: function (data, pic, callback, onprogress) {
    var url = 'http://upload.cnodejs.net/store';
    pic.keyname = 'file';
    var blob = weiboutil.build_upload_params(data, pic);
    $.ajax({
      url: url,
      data: blob,
      type: 'post',
      dataType: 'json',
      contentType: blob.contentType,
      processData: false,
      xhr: weiboutil.xhrProvider(onprogress),
      success: function (result) {
        var error = null, info = null;
        if (result.success) {
          info = result.payload;
        } else {
          error = new Error(JSON.stringify(result));
        }
        callback(error, info);
      },
      error: function (xhr, status, err) {
        callback(err);
      }
    });
  }
};
