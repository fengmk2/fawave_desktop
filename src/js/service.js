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

var URLTool = exports.URLTool = {
  domainRe: /^https?:\/\/([^\/]+)/i,
  getDomain: function (url) {
    if (url && url.match) {
      var m = url.match(this.domainRe);
      if (m) {
        return m[1];
      }
    }
    return '';
  },
  urlRe: new RegExp('(?:\\[url\\s*=\\s*|)((?:www\\.|http[s]?://)[\\w\\.\\?%&\\-/#=;:!\\+~]+)(?:\\](.+)\\[/url\\]|)', 'ig'),
  findUrls: function (text) {
    return text.match(this.urlRe);
  },
  getFavicon: function (url) {
    var domain = this.getDomain(url);
    return 'https://www.google.com/s2/favicons?domain=' + domain;
  }
};

var ShortenUrl = exports.ShortenUrl = {
  SHORT_SERVICE_RE: /(t\.co|bit\.ly|lnk\.by|fa\.by|v\.gd|is\.gd|s8\.hk|seso\.me|tinyurl\.com|to\.ly|zi\.mu|2\.ly|aa\.cx|2br\.in)/i,
  services: {
    't.cn': {
      api: 'http://api.t.sina.com.cn/short_url/shorten.json?source=3434422667',
      format: 'json', 
      method: 'get',
      param_name: 'url_long',
      result_callback: function (data) {
        if (data && data.length === 1) {
          data = data[0];
        }
        return data ? data.url_short : null;
      }
    },
    'seso.me': 'http://seso.me/api/?longurl={{url}}',
    'tinyurl.com': 'http://tinyurl.com/api-create.php?url={{url}}',
    'to.ly': 'http://to.ly/api.php?longurl={{url}}',
    'fa.by': 'http://fa.by/?module=ShortURL&file=Add&mode=API&url={{url}}',
    'lnk.by': {
      api: 'http://lnk.by/Shorten', 
      format_name: 'format', 
      format: 'json', 
      method: 'get', 
      param_name: 'url', 
      result_name: 'shortUrl'
    },
    'bit.ly': {
      api: 'http://api.bitly.com/v3/shorten?login=fengmk2&apiKey=R_da317e9fbaebee684da33d1237adf853&format=json',
      format: 'json', 
      method: 'get',
      param_name: 'longUrl',
      result_callback: function (data) {
        if (data && data.data) {
          data = data.data;
        }
        return data ? data.url : null;
      }
    },
  },
  
  expand: function (shorturl, callback) {
    // var url = 'http://api.yongwo.de/api/e?f=json&u=' + shorturl;
    var url = 'http://api.longurl.org/v2/expand?format=json&title=1&url=' + encodeURIComponent(shorturl);
    // {"long-url":"http:\/\/www.douban.com\/event\/16186934\/","content-type":"text\/html; charset=utf-8","response-code":"200","title":"\u8c46\u74e3-\u4ed6\u4e61\u65e2\u543e\u57ce\u2014\u9053\u683c.\u6851\u5fb7\u65af\u4e0e\u718a\u57f9\u4e91\u5bf9\u8c08"}
    $.ajax({
      url: url,
      dataType: 'json',
      success: function (data, status, xhr) {
        if (data) {
          data.url = data['long-url'];
        }
        callback(data);
      }, 
      error: function (xhr, status) {
        callback(null);
      }
    });
  },
  
  expandAll: function () {
    return;
    var conditions = '.short_done';
    var selector = 'a.link:not(' + conditions + ')';
    var config = tapi.get_config(getUser());
    if (!config.need_processMsg) {
      selector += ', .tweet_text a:not(' + conditions + ')';
    }
    var that = this;
    var tweetCache = window.TWEETS || {};
    $(selector).each(function () {
      var $this = $(this);
      var url = $this.attr('href');
      if (url.length < 10 || url.indexOf('javascript:') >= 0) {
        if (url === '#') {
          // 豆瓣电台的推荐链接无法点击
          // http://api.douban.com/recommendation/89139831
          // => search http://music.douban.com/subject_search?search_text=%E3%80%8A%E4%B8%80%E7%94%9F%E6%89%80%E7%88%B1%E3%80%8B+-+%E5%8D%A2%E5%86%A0%E5%BB%B7
          $this.attr('href', 'javascript:;').addClass('short_done');
        }
        return;
      }
      if (VideoService.attempt(url, this) || ImageService.attempt(url, this) || url.length > 30) {
        // 无需还原
        UrlUtil.showFaviconBefore(this, url);
        $this.addClass('short_done');
        return;
      }
      var $tweetItem = $this.parents('.tweetItem:first');
      var tid = $tweetItem.attr('id').substring(5);
      var status = tweetCache[tid];
      if (!status) {
        console.log('no status', $tweetItem, url);
        return;
      }
      status.urlCache = status.urlCache || {};
      var data = status.urlCache[url];
      if (data && data.url) {
        that._format_link(this, url, data.url, data);
      } else {
        ShortenUrl.expand(url, function (data) {
          var longurl = data ? data.url : null;
          if (longurl) {
            status.urlCache[url] = data;
            that._format_link(this, url, longurl, data);
          }
        }, this);
      }
    });
  },
  _format_link: function (ele, url, longurl, data) {
    var title = _u.i18n("comm_mbright_to_open") + ' ' + longurl;
    if (data && data.title) {
      title += ' (' + data.title + ')';
    }
    var attrs = {
      title:  title,
      rhref: longurl
    };
    $(ele).attr(attrs).addClass('longurl short_done');
    UrlUtil.showFaviconBefore(ele, longurl);
    if (!VideoService.attempt(data, ele)) {
      ImageService.attempt({url: longurl, sourcelink: url}, ele);
    }
  },
  
  short: function (longurl, callback, name, context) {
    name = name || Settings.get().shorten_url_service;
    var service = this.services[name];
    var format = 'text';
    var format_name = null;
    var method = 'get';
    var data = {};
    var result_name = null, result_callback = null;
    if (typeof service !== 'string') {
      format_name = service.format_name || format_name;
      format = service.format || format;
      method = service.method || method;
      data[service.param_name] = longurl;
      if (format_name) {
        data[format_name] = format;
      }
      result_name = service.result_name;
      result_callback = service.result_callback;
      if (name === 'goo.gl') {
        data.user = 'toolbar@google.com';
        data.auth_token = this._create_googl_auth_token(longurl);
      }
      service = service.api;
    } else {
      service = service.format({url: encodeURIComponent(longurl)});
    }
    $.ajax({
      url: service,
      type: method,
      data: data,
      dataType: format,
      success: function (data, status, xhr) {
        if (result_callback) {
          data = result_callback(data);
        } else if (result_name) {
          data = data[result_name];
        }
        callback.call(context, data);
      }, 
      error: function (xhr, status) {
        callback.call(context, null);
      }
    });
  },  
};


