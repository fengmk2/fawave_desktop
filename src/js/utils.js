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

var VERSION = 20110220;
function getVersion() {
  var ver = localStorage.getObject('VERSION');
  return ver;
}

function updateVersion() {
  localStorage.setObject('VERSION', VERSION);
}

//需要不停检查更新的timeline的分类列表
var T_LIST = exports.T_LIST = {
  all: ['friends_timeline', 'mentions', 'comments_timeline', 'direct_messages'],
  weibo: [
    'friends_timeline', 'mentions', 'comments_mentions', 'comments_timeline',
    // 'direct_messages'
  ],
  digu: ['friends_timeline', 'mentions', 'direct_messages'],
  buzz: ['friends_timeline'],
  facebook: ['friends_timeline'],
  renren: ['friends_timeline'],
  plurk: ['friends_timeline'],
  douban: ['friends_timeline', 'direct_messages'],
  tianya: ['friends_timeline', 'mentions', 'comments_timeline'],
  googleplus: [],
  diandian: []
};
T_LIST.tqq = T_LIST.t163 = T_LIST.tsina = T_LIST.tsohu = T_LIST.all;
T_LIST.t_taobao = T_LIST.fanfou = T_LIST.renjian = T_LIST.leihou = T_LIST.twitter =
  T_LIST.identi_ca = T_LIST.tumblr = T_LIST.digu;

var T_NAMES = exports.T_NAMES = {
  tsina: '新浪微博',
  weibo: '新浪微博(V2.0 不支持私信)',
  tqq: '腾讯微博',
  tsohu: '搜狐微博',
  t163: '网易微博',
  douban: '豆瓣',
  fanfou: '饭否',
  diandian: '点点网',
  renren: '人人网',
  googleplus: 'Google+',
  digu: '嘀咕',
  tianya: '天涯微博',
  // zuosa: '做啥',
  leihou: '雷猴',
  // renjian: '人间网',
  twitter: 'Twitter',
  facebook: 'Facebook',
  plurk: 'Plurk',
  identi_ca: 'identi.ca',
  t_taobao: '@AiTa'
//    'tumblr': 'Tumblr'
};

var Languages = exports.Languages = {
  '中文': 'zh',
  'Afrikaans': 'af',
  'Albanian': 'sq',
  'Arabic': 'ar',
  'Basque': 'eu',
  'Belarusian': 'be',
  'Bulgarian': 'bg',
  'Catalan': 'ca',
  'Croatian': 'hr',
  'Czech': 'cs',
  'Danish': 'da',
  'Dutch': 'nl',
  'English': 'en',
  'Estonian': 'et',
  'Filipino': 'tl',
  'Finnish': 'fi',
  'French': 'fr',
  'Galician': 'gl',
  'German': 'de',
  'Greek': 'el',
  'Haitian Creole': 'ht',
  'Hebrew': 'iw',
  'Hindi': 'hi',
  'Hungarian': 'hu',
  'Icelandic': 'is',
  'Indonesian': 'id',
  'Irish': 'ga',
  'Italian': 'it',
  'Japanese': 'ja',
  'Latvian': 'lv',
  'Lithuanian': 'lt',
  'Macedonian': 'mk',
  'Malay': 'ms',
  'Maltese': 'mt',
  'Norwegian': 'no',
  'Persian': 'fa',
  'Polish': 'pl',
  'Portuguese': 'pt',
  'Romanian': 'ro',
  'Russian': 'ru',
  'Serbian': 'sr',
  'Slovak': 'sk',
  'Slovenian': 'sl',
  'Spanish': 'es',
  'Swahili': 'sw',
  'Swedish': 'sv',
  'Thai': 'th',
  'Turkish': 'tr',
  'Ukrainian': 'uk',
  'Vietnamese': 'vi',
  'Welsh': 'cy',
  'Yiddish': 'yi'
};

var unreadDes = {
  'friends_timeline': i18n.get('abb_friends_timeline'), 
  'mentions': '@', 
  'comments_timeline': i18n.get('abb_comments_timeline'), 
  'direct_messages': i18n.get('abb_direct_message'),
  'comments_mentions': i18n.get('abb_comments_mentions'),
};

var tabDes = exports.tabDes = {
  'friends_timeline': i18n.get('comm_TabName_friends_timeline'), 
  'mentions': i18n.get('comm_TabName_mentions'), 
  'comments_mentions': i18n.get('comm_TabName_comments_mentions'),
  'comments_timeline': i18n.get('comm_TabName_comments_timeline'), 
  'direct_messages': i18n.get('comm_TabName_direct_messages')
};

//刷新时间限制
var refreshTimeLimit = {
  tsina: {
    'friends_timeline': 30, 
    'mentions': 30, 
    'comments_timeline': 30, 
    'direct_messages': 30,
    'sent_direct_messages': 60
  },
  tqq: {
    'friends_timeline': 45, 
    'mentions': 45, 
    'comments_timeline': 45, 
    'direct_messages': 45,
    'sent_direct_messages': 60
  }
};
refreshTimeLimit.tianya = refreshTimeLimit.digu = refreshTimeLimit.twitter = refreshTimeLimit.identi_ca = 
  refreshTimeLimit.tsohu = refreshTimeLimit.t163 = refreshTimeLimit.fanfou = refreshTimeLimit.plurk = 
  refreshTimeLimit.tsina;
refreshTimeLimit.leihou = 
  refreshTimeLimit.douban = refreshTimeLimit.buzz = refreshTimeLimit.tqq;

/**
 * Constant defines end
 */

function getBackgroundView() {
  return require('./background');
}
exports.getBackgroundView = getBackgroundView;


/**
 * Action Cache 
 * @type {Object}
 */
var ActionCache = exports.ActionCache = {
  _cache: null,
  _get_cache: function () {
    if (!this._cache) {
      var bg = getBackgroundView() || {};
      if (!bg.__action_cache) {
        bg.__action_cache = {};
      }
      this._cache = bg.__action_cache;
    }
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

// 将字符串参数变成dict参数
// form: oauth_token_secret=a26e895ca88d3ddbb5ec4d9d1780964b&oauth_token=b7cbcc0dc5056509a6b85967639924df
// 支持完整url
function decodeForm(form) {
  var index = form.indexOf('?');
  if (index > -1) {
    form = form.substring(index + 1);
  }
  var d = {};
  var nvps = form.split('&');
  for (var n = 0; n < nvps.length; ++n) {
    var nvp = nvps[n];
    if (!nvp) {
      continue;
    }
    var equals = nvp.indexOf('=');
    if (equals < 0) {
      d[nvp] = null;
    } else {
      d[nvp.substring(0, equals)] = decodeURIComponent(nvp.substring(equals + 1));
    }
  }
  return d;
}

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

// shorturl
var ShortenUrl = exports.ShortenUrl = {
  SHORT_SERVICE_RE: /(goo\.gl|t\.co|bit\.ly|lnk\.by|fa\.by|v\.gd|is\.gd|s8\.hk|seso\.me|tinyurl\.com|to\.ly|zi\.mu|2\.ly|aa\.cx|2br\.in)/i,
  services: {
    // http://api.t.sina.com.cn/short_url/shorten.json?source=3538199806&url_long=http://www.tudou.com/programs/view/cl_8vhHMCfs/
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
    'goo.gl': {
      api: 'http://goo.gl/api/url', 
      format: 'json', 
      method: 'post', 
      param_name: 'url', 
      result_name: 'short_url'
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
  // 还原
  // http://urlexpand0-55.appspot.com/api?u=http://is.gd/imWyT
  // MAX_INDEX => http://yongwo.de:1235/api?u=http://is.gd/imWyT&cb=foo
  MAX_INDEX: 56,
  expand: function (shorturl, callback, context) {
    this._expand(shorturl, callback, context);
  },
  
  _expand: function (shorturl, callback, context) {
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
        callback.call(context, data);
      }, 
      error: function (xhr, status) {
        callback.call(context, null);
      }
    });
  },
  
  SINAURL_RE: /http:\/\/(?:t|sinaurl)\.cn\/(\w+)/i,
  // 新浪短址特殊处理
  // http://t.sina.com.cn/mblog/sinaurl_info.php?url=h6yl4g
  expand_sinaurl: function (shorturl, callback, context) {
    var m = this.SINAURL_RE.exec(shorturl);
    if (!m) {
      return callback.call(context, null);
    }
    var id = m[1];
    $.ajax({
      url: 'http://weibo.com/mblog/sinaurl_info.php?url=' + id,
      dataType: 'json',
      success: function (data, status, xhr) {
        if (data && data.data) {
          data = data.data[id];
        }
        callback.call(context, data);
      }, 
      error: function (xhr, status) {
        if (status === 'parsererror') {
          // 使用了新版本的新浪微博，无法调用还原接口
          var b_view = getBackgroundView();
          b_view.__enable_expand_sinaurl = false;
        }
        callback.call(context, null);
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
  
  // goo.gl的认证token计算函数
  _create_googl_auth_token: function(f){function k(){for(var c=0,b=0;b<arguments.length;b++)c=c+arguments[b]&4294967295;return c}function m(c){c=c=String(c>0?c:c+4294967296);var b;b=c;for(var d=0,i=false,j=b.length-1;j>=0;--j){var g=Number(b.charAt(j));if(i){g*=2;d+=Math.floor(g/10)+g%10}else d+=g;i=!i}b=b=d%10;d=0;if(b!=0){d=10-b;if(c.length%2==1){if(d%2==1)d+=9;d/=2;}}b=String(d);b+=c;return b;}function n(c){for(var b=5381,d=0;d<c.length;d++)b=k(b<<5,b,c.charCodeAt(d));return b;}function o(c){for(var b=0,d=0;d<c.length;d++)b=k(c.charCodeAt(d),b<<6,b<<16,-b);return b;}f={byteArray_:f,charCodeAt:function(c){return this.byteArray_[c];}};f.length=f.byteArray_.length;var e=n(f.byteArray_);e=e>>2&1073741823;e=e>>4&67108800|e&63;e=e>>4&4193280|e&1023;e=e>>4&245760|e&16383;var l="7";f=o(f.byteArray_);var h=(e>>2&15)<<4|f&15;h|=(e>>6&15)<<12|(f>>8&15)<<8;h|=(e>>10&15)<<20|(f>>16&15)<<16;h|=(e>>14&15)<<28|(f>>24&15)<<24;l+=m(h);return l;}
};

var FanfouImage = {
  host: 'fanfou.com',
  url_re: /fanfou\.com\/photo\/\w+/i,
  get: function (url, callback) {
    var bg = getBackgroundView();
    if (bg.IMAGE_URLS[url]) {
      return callback(bg.IMAGE_URLS[url], true);
    }
    $.ajax({
      url: url,
      success: function (html, status, xhr) {
        var src = $(html).find('#photo img').attr('src');
        if (src) {
          return callback();
        }
        var pics = {
          thumbnail_pic: src.replace('/n0/', '/s0/'),
          bmiddle_pic: src,
          original_pic: src
        };
        bg.IMAGE_URLS[url] = pics;
        callback(pics);
      },
      error: function () {
        callback();
      }
    });
  }
};

// http://www.yupoo.com/photos/techparty/81756954/zoom/small/
// http://www.yupoo.com/photos/techparty/81756954/
// http://photo.yupoo.com/techparty/BckmKZdN/medish.jpg
var Yupoo = {
  host: 'yupoo.com',
  url_re: /yupoo\.com\/photos\//i,
  show_link: true,
  get: function (url, callback) {
    var bg = getBackgroundView();
    if (bg.IMAGE_URLS[url]) {
      return callback(bg.IMAGE_URLS[url], true);
    }
    $.ajax({
      url: url,
      success: function (html, status, xhr) {
        var src = $(html).find('#photo_img').attr('src');
        if (src) {
          return callback();
        }
        var pics = {
          thumbnail_pic: src.replace('medish.', 'small.'),
          bmiddle_pic: src.replace('medish.', 'medium.'),
          original_pic: src
        };
        bg.IMAGE_URLS[url] = pics;
        callback(pics);
      },
      error: function () {
        callback();
      }
    });
  }
};

// 查看豆瓣预览图
var DoubanImage = {
  /**
   * http://movie.douban.com/subject/4286017/ 
=>
<div id="mainpic"> 
      <a class="nbg" href="http://movie.douban.com/subject/4286017/photos?type=R" title="点击看更多海报"> 
      <img src="http://img3.douban.com/mpic/s4672723.jpg" title="点击看更多海报" alt="Fast Five" rel="v:image" /> 
      </a><br /> 

  </div> 
=>
http://img3.douban.com/mpic/s4672723.jpg
http://img3.douban.com/lpic/s4672723.jpg
=> 
http://img3.douban.com/spic/s4672723.jpg
http://img3.douban.com/opic/s4672723.jpg

http://code.google.com/p/falang/issues/detail?id=235
   * 
   */
  host: 'douban.com',
  url_re: /http:\/\/(?:(?:book|music|movie)\.douban\.com\/subject\/.+|www\.douban.com\/.+?\/photo\/)/i,
  image_url_re: /com\/([mlso]pic)\//i,
  photos_re: /\/photo\/(\d+)\//i,
  show_link: true, 
  need_sourcelink: true, // RT的时候，需要原始链接
  sync: true,
  get: function (url, callback) {
    var photo_matchs = this.photos_re.exec(url);
    if (photo_matchs) {
      var id = photo_matchs[1];
      return callback({
        thumbnail_pic: 'http://img3.douban.com/view/photo/thumb/public/p' + id + '.jpg',
        bmiddle_pic: 'http://img3.douban.com/view/photo/photo/public/p' + id + '.jpg',
        original_pic: 'http://img3.douban.com/view/photo/photo/public/p' + id + '.jpg'
      });
    }
    var bg = getBackgroundView();
    if (bg.IMAGE_URLS[url]) {
      return callback(bg.IMAGE_URLS[url], true);
    }
    $.ajax({
      url: url,
      success: function (html, status, xhr) {
        var src = $(html).find('#mainpic img').attr('src');
        var pics = null;
        if (src) {
          var matchs = DoubanImage.image_url_re.exec(src);
          if (matchs) {
            var size = matchs[1];
            pics = {
              thumbnail_pic: src.replace(size, 'mpic'),
              bmiddle_pic: src.replace(size, 'lpic'),
              original_pic: src.replace(size, 'opic')
            };
            bg.IMAGE_URLS[url] = pics;
          }
        }
        callback(pics);
      },
      error: function () {
        callback();
      }
    });
  }
};

// http://campl.us/dcEN
// http://code.google.com/p/falang/issues/detail?id=190
var Camplus = {
  host: 'campl.us',
  url_re: /http:\/\/campl\.us\/\w+$/i,
  show_link: true,
  sync: true,
  get: function (url, callback) {
    var bg = getBackgroundView();
    if (bg.IMAGE_URLS[url]) {
      return callback(bg.IMAGE_URLS[url], true);
    }
    $.ajax({
      url: url,
      success: function (html, status, xhr) {
        var $doc = $(html);
        var caption = $doc.find('.tweetContents').text();
        var src = $doc.find('img.photo').attr('src');
        if (!src) {
          return callback();
        }
        var pics = {
          thumbnail_pic: src.replace('/f/', '/t/'),
          bmiddle_pic: src.replace('/f/', '/iphone/'),
          original_pic: src
        };
        if (caption) {
          pics.caption = caption.trim();
        }
        bg.IMAGE_URLS[url] = pics;
        callback(pics);
      },
      error: function () {
        callback();
      }
    });
  }
};

var Nodebox = {
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
  upload: function (data, pic, callback, onprogress, context) {
    var url = 'http://upload.cnodejs.net/store';
    pic.keyname = 'file';
    var blob = build_upload_params(data, pic);
    $.ajax({
      url: url,
      data: blob,
      type: 'post',
      dataType: 'json',
      contentType: blob.contentType,
      processData: false,
      xhr: xhr_provider(onprogress),
      success: function (result) {
        var error = null, info = null;
        if (result.success) {
          info = result.payload;
        } else {
          error = new Error(JSON.stringify(result));
        }
        callback.call(context, error, info);
      },
      error: function (xhr, status, err) {
        callback.call(context, err);
      }
    });
  }
};

// http://imm.io/api/
// http://imm.io/7BhM
var Immio = {
  host: 'imm.io',
  url_re: /http:\/\/imm\.io\/\w+$/i,
  show_link: true,
  sync: true,
  get: function (url, callback) {
    var bg = getBackgroundView();
    if (bg.IMAGE_URLS[url]) {
      return callback(bg.IMAGE_URLS[url], true);
    }
    $.ajax({
      url: url,
      success: function (html, status, xhr) {
        var $doc = $(html);
        var caption = $doc.find('#name_in').text();
        var src = $doc.find('.view img').attr('src');
        if (!src) {
          return callback();
        }
        var pics = {
          thumbnail_pic: src,
          bmiddle_pic: src,
          original_pic: src
        };
        if (caption) {
          pics.caption = caption.trim();
        }
        bg.IMAGE_URLS[url] = pics;
        callback(pics);
      },
      error: function () {
        callback();
      }
    });
  },
  upload: function (data, pic, callback, onprogress, context) {
    var url = 'http://imm.io/store/';
    pic.keyname = 'image';
    var blob = build_upload_params(data, pic);
    $.ajax({
      url: url,
      data: blob,
      type: 'post',
      dataType: 'json',
      contentType: blob.contentType,
      processData: false,
      xhr: xhr_provider(onprogress),
      success: function (result) {
        var error = null, info = null;
        if (result.success) {
          info = result.payload;
        } else {
          error = new Error(JSON.stringify(result));
        }
        callback.call(context, error, info);
      },
      error: function (xhr, status, err) {
        callback.call(context, err);
      }
    });
  }
};

// http://code.google.com/p/falang/issues/detail?id=244
// http://picplz.com/user/martinisantos/pic/hg5wl/
// http://picplz.com/tlzl
var Picplz = {
  host: 'picplz.com',
  url_re: /http:\/\/picplz\.com\/([\w\-\=]+$|user\/\w+\/\w+)/i,
  show_link: true,
  sync: true,
  get: function (url, callback) {
    var bg = getBackgroundView();
    if (bg.IMAGE_URLS[url]) {
      return callback(bg.IMAGE_URLS[url], true);
    }
    $.ajax({
      url: url,
      success: function (html, status, xhr) {
        var $doc = $(html);
        var $img = $doc.find('#mainImage');
        var src = $img.attr('src'), caption = $img.attr('alt');
        if (!src) {
          return callback();
        }
        // http://s2.i1.picplzthumbs.com/upload/img/13/3d/bc/133dbcf42367a8caa25bd95758967a7c2e3f3968_wmeg_00001.jpg
        // => 
        // http://s2.i1.picplzthumbs.com/upload/img/13/3d/bc/133dbcf42367a8caa25bd95758967a7c2e3f3968_t100s_00001.jpg
        var pics = {
          thumbnail_pic: src.replace('_wmeg', '_t100s'),
          bmiddle_pic: src,
          original_pic: src
        };
        if (caption) {
          pics.caption = caption.trim();
        }
        bg.IMAGE_URLS[url] = pics;
        callback(pics);
      },
      error: function () {
        callback();
      }
    });
  }
};

// 500px.com
// <meta property="twitter:image" value="http://pcdn.500px.net/9764657/cf5ebc22afbc927a462c3f10cdf660484ebe7735/4.jpg" />
// http://pcdn.500px.net/9764657/cf5ebc22afbc927a462c3f10cdf660484ebe7735/4.jpg
// http://pcdn.500px.net/9764657/cf5ebc22afbc927a462c3f10cdf660484ebe7735/3.jpg
// http://pcdn.500px.net/9764657/cf5ebc22afbc927a462c3f10cdf660484ebe7735/2.jpg
var PX500 = {
  host: '500px.com',
  url_re: /http:\/\/(500px\.com)\/photo\/\w+/i,
  show_link: true,
  sync: true,
  get: function (url, callback) {
    var bg = getBackgroundView();
    if (bg.IMAGE_URLS[url]) {
      return callback(bg.IMAGE_URLS[url], true);
    }
    $.ajax({
      url: url,
      success: function (html, status, xhr) {
        var $doc = $(html);
        var img = $doc.find('#mainphoto');
        var caption = img.attr('alt');
        var src = img.attr('src');
        if (!src) {
          return callback();
        }
        var imageurl = src.substring(0, src.lastIndexOf('/') + 1);
        var pics = {
          thumbnail_pic: imageurl + '2.jpg',
          bmiddle_pic: src,
          original_pic: src
        };
        if (caption) {
          pics.caption = caption.trim();
        }
        bg.IMAGE_URLS[url] = pics;
        callback(pics);
      },
      error: function () {
        callback();
      }
    });
  }
};

// <meta property="og:image" content="http://media-cache-ec3.pinterest.com/upload/168392473538059182_30On7yco_c.jpg"/>
// http://media-cache-ec3.pinterest.com/upload/168392473538059182_30On7yco_b.jpg
var Pinterest = {
  host: 'pinterest.com',
  url_re: /http:\/\/(pinterest\.com)\/pin\/\w+/i,
  show_link: true,
  sync: true,
  get: function (url, callback) {
    var bg = getBackgroundView();
    if (bg.IMAGE_URLS[url]) {
      return callback(bg.IMAGE_URLS[url], true);
    }
    $.ajax({
      url: url,
      success: function (html, status, xhr) {
        var $doc = $(html);
        var caption = $doc.find('#PinCaption').text();
        var src = $doc.find('#pinCloseupImage').attr('src');
        if (!src) {
          return callback();
        }
        var pics = {
          thumbnail_pic: src.replace('_c.', '_b.'),
          bmiddle_pic: src,
          original_pic: src.replace('_c.', '.')
        };
        if (caption) {
          pics.caption = caption.trim();
        }
        bg.IMAGE_URLS[url] = pics;
        callback(pics);
      },
      error: function () {
        callback();
      }
    });
  }
};

var Vida = {
  /* 
   * http://vida.fm/activities/1015197?utm_source=weibo
   * =>
   * big: <img alt="5b1ef212-a198-11e1-b020-180373f6dd13_l" class="photo-view" src="http://pics.vida.fm/14/2310/5b1ef212-a198-11e1-b020-180373f6dd13_l" /> 
   * middle: http://pics.vida.fm/14/2310/5b1ef212-a198-11e1-b020-180373f6dd13_m
   * small: http://pics.vida.fm/14/2310/5b1ef212-a198-11e1-b020-180373f6dd13_s
   */
  host: 'vida.fm',
  url_re: /http:\/\/(vida\.fm)\/activities\/\w+/i,
  show_link: true,
  sync: true,
  get: function (url, callback) {
    var bg = getBackgroundView();
    if (bg.IMAGE_URLS[url]) {
      return callback(bg.IMAGE_URLS[url], true);
    }
    $.ajax({
      url: url,
      success: function (html, status, xhr) {
        var $doc = $(html);
        var caption = $doc.find('#activity-info .box-content').text();
        var src = $doc.find('img.photo-view').attr('src');
        if (!src) {
          return callback();
        }
        var imageurl = src.substring(0, src.length - 1);
        var pics = {
          thumbnail_pic: imageurl + 's',
          bmiddle_pic: imageurl + 'm',
          original_pic: src
        };
        if (caption) {
          pics.caption = caption.trim();
        }
        bg.IMAGE_URLS[url] = pics;
        callback(pics);
      },
      error: function () {
        callback();
      }
    });
  }
};

var ViaMe = {
  /* 
   * http://via.me/-2nk92uu
   * =>
   * big: <meta content='http://s3.amazonaws.com/com.clixtr.picbounce/photos/bed66e50-a649-012f-176e-12313813318b/s600x600.jpg' property='og:image'>
   * middle: "thumb_url":"http://img.via.me/photos/3bf36070-631f-012f-d369-12313920881f/s150x150.jpg",
   * small: "thumb_url":"http://img.via.me/photos/3bf36070-631f-012f-d369-12313920881f/s150x150.jpg",
   */
  host: 'via.me',
  url_re: /http:\/\/(via\.me)\/\-\w+/i,
  show_link: true,
  sync: true,
  IMAGE_RE: /<meta\scontent=\'([^\']+)\'\sproperty=\'og:image\'>/,
  get: function (url, callback) {
    var bg = getBackgroundView();
    if (bg.IMAGE_URLS[url]) {
      return callback(bg.IMAGE_URLS[url], true);
    }
    $.ajax({
      url: url,
      success: function (html, status, xhr) {
        var m = ViaMe.IMAGE_RE.exec(html);
        var caption = null;
        var src = m && m[1];
        if (src) {
          var imageurl = src.substring(0, src.lastIndexOf('/'));
          var ext = src.substring(src.lastIndexOf('.'));
          var original_pic = imageurl + '/r600x600' + ext;
          var pics = {
            thumbnail_pic: imageurl + '/s150x150' + ext,
            bmiddle_pic: original_pic,
            original_pic: original_pic
          };
          if (caption) {
            pics.caption = caption.trim();
          }
          bg.IMAGE_URLS[url] = pics;
          callback(pics);
        } else {
          callback();
        }
      },
      error: function () {
        callback();
      }
    });
  }
};

/**
 * Facebook photo preview
 *
 * https://www.facebook.com/photo.php?pid=10703372&l=eea56fa638&id=700845856
 * =>
 * large: https://fbcdn-sphotos-a.akamaihd.net/hphotos-ak-ash3/s720x720/553543_10151176931010857_810090458_n.jpg
 * middle: @large
 * small: https://fbcdn-sphotos-a.akamaihd.net/hphotos-ak-ash3/s720x720/553543_10151176931010857_810090458_a.jpg
 */
var FacebookPhoto = {
  host: 'www.facebook.com',
  url_re: /www\.facebook\.com\/photo\.php\?/i,
  show_link: true,
  sync: true,
  get: function (url, callback) {
    var bg = getBackgroundView();
    if (bg.IMAGE_URLS[url]) {
      return callback(bg.IMAGE_URLS[url], true);
    }
    $.ajax({
      url: url,
      success: function (html, status, xhr) {
        var $doc = $(html);
        var caption = $doc.find('.fbPhotoPageCaption').text().trim();
        var src = $doc.find('.fbPhotoImage').attr('src');
        if (!src) {
          return callback();
        }
        var pics = {
          thumbnail_pic: src.replace('_n.', '_a.'),
          bmiddle_pic: src,
          original_pic: src
        };
        if (caption) {
          pics.caption = caption;
        }
        bg.IMAGE_URLS[url] = pics;
        callback(pics);
      },
      error: function() {
        callback();
      }
    });
  }
};

// http://v.163.com/zongyi/V6LQSJ9UN/V87BC68HL.html
// <source src="http://flv.bn.netease.com/tvmrepo/2012/8/0/G/E87BC4R0G-mobile.mp4" type="video/mp4">
// coverpic=http://vimg1.ws.126.net/image/snapshot/2012/8/H/C/V87BC63HC.jpg&
var Video163 = {
  host: 'v.163.com',
  url_re: /v(?:\.2012)?\.163\.com\/.*?\/\w+\.htm/i,
  show_link: true,
  sync: true,
  get: function (url, callback) {
    var bg = getBackgroundView();
    if (bg.IMAGE_URLS[url]) {
      return callback(bg.IMAGE_URLS[url], true);
    }
    $.get(url, function (data) {
      var image_re = /coverpic=(http.*?\.(?:jpg|png|gif))/i;
      var m = image_re.exec(data);
      if (!m) {
        return callback();
      }
      var caption = $(data).find('h1').text();
      var image = m[1];
      var pics = {
        thumbnail_pic: image,
        bmiddle_pic: image,
        original_pic: image,
        caption: caption
      };
      bg.IMAGE_URLS[url] = pics;
      callback(pics);
      // var source_re = /src=["']([^"']+?\-mobile\.mp4)["']/i;
      // m = source_re.exec(data);
      // if (!m) {
      //   return callback(null, imageURL);
      // }
      // var html = '<video controls="controls" autoplay="autoplay" preload="auto"><source src="' + m[1] + '" type="video/mp4"></video>';
      // callback(html, imageURL);
    });
  }
};

// 图片服务
var Instagram = {
  /* 
   * http://instagr.am/p/BWp/ => 
   * big: <img src="http://distillery.s3.amazonaws.com/media/2010/10/03/ca65a1ad211140c8ac97e2d2439a1376_7.jpg" class="photo" /> 
   * middle: http://distillery.s3.amazonaws.com/media/2010/10/03/ca65a1ad211140c8ac97e2d2439a1376_6.jpg
   * small: http://distillery.s3.amazonaws.com/media/2010/10/03/ca65a1ad211140c8ac97e2d2439a1376_5.jpg
   * 
   * http://images.instagram.com/media/2011/05/20/c67a2c94bed9459ca2d398375b799219_5.jpg
   * http://images.instagram.com/media/2011/05/20/c67a2c94bed9459ca2d398375b799219_6.jpg
   * http://images.instagram.com/media/2011/05/20/c67a2c94bed9459ca2d398375b799219_7.jpg
   * 
   * http://instagram.com/p/JEYHD/ 
   * =>
   * http://instagr.am/p/JEYHD/ 
   * 
   */
  host: 'instagr.am',
  url_re: /http:\/\/(instagr\.am|instagram\.com)\/p\//i,
  show_link: true,
  sync: true,
  get: function (url, callback) {
    var bg = getBackgroundView();
    if (bg.IMAGE_URLS[url]) {
      return callback(bg.IMAGE_URLS[url], true);
    }
    $.ajax({
      url: url,
      success: function (html, status, xhr) {
        var $doc = $(html);
        var caption = $doc.find('.caption').text();
        var src = $doc.find('.photo').attr('src');
        if (!src) {
          return callback();
        }
        var pics = {
          thumbnail_pic: src.replace('_7.', '_5.'),
          bmiddle_pic: src.replace('_7.', '_6.'),
          original_pic: src
        };
        if (caption) {
          pics.caption = caption.trim();
        }
        bg.IMAGE_URLS[url] = pics;
        callback(pics);
      },
      error: function() {
        callback();
      }
    });
  }
};

/**
 * 直接得到图片，无需爬页面，同步版本
 */
var Instagram2 = {
  /* 
   * big: <img src="http://distillery.s3.amazonaws.com/media/2010/10/03/ca65a1ad211140c8ac97e2d2439a1376_7.jpg" class="photo" /> 
   * middle: http://distillery.s3.amazonaws.com/media/2010/10/03/ca65a1ad211140c8ac97e2d2439a1376_6.jpg
   * small: http://distillery.s3.amazonaws.com/media/2010/10/03/ca65a1ad211140c8ac97e2d2439a1376_5.jpg
   * 
   * http://images.instagram.com/media/2011/05/20/c67a2c94bed9459ca2d398375b799219_5.jpg
   * http://images.instagram.com/media/2011/05/20/c67a2c94bed9459ca2d398375b799219_6.jpg
   * http://images.instagram.com/media/2011/05/20/c67a2c94bed9459ca2d398375b799219_7.jpg
   * 
   */
  host: 'instagram.com',
  url_re: /http:\/\/images\.instagram\.com\/media\/[^\_]+(\_\d\.)\w+/i,
  sync: true,
  get: function (url, callback) {
    var m = this.url_re.exec(url);
    var pics = {
      thumbnail_pic: url.replace(m[1], '_5.'),
      bmiddle_pic: url.replace(m[1], '_6.'),
      original_pic: url.replace(m[1], '_7.')
    };
    callback(pics);
  }
};

/**
 * img.ly
 *
 *   http://img.ly/lko2 => http://img.ly/show/thumb/lko2
 *   => http://img.ly/show/large/lko2
 * @type {Object}
 */
var Imgly = {
  host: 'img.ly',
  url_re: /http:\/\/img\.ly\/([^\/]+)$/i,
  sync: true,
  show_link: true,
  get: function (url, callback) {
    var m = this.url_re.exec(url);
    var id = m[1];
    var pics = {
      thumbnail_pic: 'http://img.ly/show/thumb/' + id,
      bmiddle_pic: 'http://img.ly/show/large/' + id,
      original_pic: 'http://img.ly/show/large/' + id
    };
    callback(pics);
  }
};

var Flickr = {
  host: 'www.flickr.com',
  // http://flic.kr/p/8q4MxW
  url_re: /http:\/\/(www\.flickr\.com\/photos\/\w+\/\d+|flic\.kr\/p\/[\w\-]+)/i,
  src_re: /<link\srel\=\"image\_src\"\shref\=\"([^\"]+)\"/i,
  show_link: true,
  sync: true,
  get: function (url, callback) {
    var bg = getBackgroundView();
    if (bg.IMAGE_URLS[url]) {
      return callback(bg.IMAGE_URLS[url], true);
    }
    $.ajax({
      url: url,
      success: function (html, status, xhr) {
          // <div class="photo-div"><img src="http://farm7.static.flickr.com/6133/6014360607_366de2fabe_z.jpg" alt="photo" width="640" height="424"></div>
        // _z. => _m => _b
          //
          // view-source:http://www.flickr.com/photos/nihaoblog/69881634/in/photostream/
          // => <div class="photo-div"> <img src="http://farm1.static.flickr.com/35/69881634_7f5361cf6d.jpg" alt="photo" width="500" height="375">
          // => empty => _m => _z
        var $doc = $(html);
        var caption = $doc.find('#meta h1').text();
        var src = $doc.find('.photo-div img').attr('src');
        if (src) {
          var has_big = src.indexOf('_z.') > 0;
          var pics = null;
          if (has_big) {
            pics = {
              thumbnail_pic: src.replace('_z.', '_m.'),
              bmiddle_pic: src,
              original_pic: src.replace('_z.', '_b.')
            };
          } else {
            var index = src.lastIndexOf('.');
            var u = src.substring(0, index) + '_m' + src.substring(index);
            pics = {
              thumbnail_pic: u,
              bmiddle_pic: u.replace('_m.', '_z.'),
              original_pic: src
            };
          }
          if (caption) {
            pics.caption = caption.trim();
          }
          bg.IMAGE_URLS[url] = pics;
          callback(pics);
        } else {
          callback();
        }
      },
      error: function () {
        callback();
      }
    });
  }
};


// http://dev.twitpic.com/
// http://dev.twitpic.com/docs/thumbnails/
var Twitpic = {
  /*
   * http://twitpic.com/show/thumb/1e10q
   * http://twitpic.com/show/mini/1e10q
   */
  host: 'twitpic.com',
  url_re: /http:\/\/(twitpic\.com)\/\w+/i,
  show_link: true,
  sync: true,
  get: function(url, callback) {
    var tpl = 'http://twitpic.com/show/{{size}}/{{id}}';
    var re = /twitpic.com\/(\w+)/i;
    var results = re.exec(url);
    var pics = {
      thumbnail_pic: tpl.format({size: 'thumb', id: results[1]}),
      bmiddle_pic: tpl.format({size: 'full', id: results[1]}),
      original_pic: tpl.format({size: 'full', id: results[1]})
    };
    callback(pics);
  }
};

// http://p.twipple.jp/TxSpS => http://p.twipple.jp/data/T/x/S/p/S_s.jpg
// => http://p.twipple.jp/data/T/x/S/p/S_m.jpg
// => http://p.twipple.jp/data/T/x/S/p/S.jpg
// 直接去页面获取 http://p.twipple.jp/g7G6e
var Twipple = {
  host: 'p.twipple.jp',
  url_re: /http:\/\/p\.twipple\.jp\/\w+/i,
  get: function(url, callback) {
    $.ajax({
      url: url,
      success: function(html, status, xhr) {
        var src = $(html).find('#post_image').attr('src');
        var pics = {
          thumbnail_pic: src.replace('_m.', '_s.'),
          bmiddle_pic: src,
          original_pic: src.replace('_m.', '.')
        };
        callback(pics);
      },
      error: function() {
        callback(null);
      }
    });
  }
};

var Topit = {
    host: 'topit.me',
    url_re: /topit\.me\/item\/\w+/i,
    sync: true,
    show_link: true,
    get: function(url, callback) {
        $.ajax({
            url: url,
            success: function(html, status, xhr) {
                var $a = $(html).find('#item-tip');
                var original_pic = $a.attr('href');
                var bmiddle_pic = $a.find('img').attr('src');
                var thumbnail_pic = original_pic;
                var index = thumbnail_pic.indexOf('.me/l');
                if(index > 0) {
                    index += 4;
                    thumbnail_pic = thumbnail_pic.substring(0, index) + 't' + 
                        thumbnail_pic.substring(index + 1);
                }
                var pics = {
                    thumbnail_pic: thumbnail_pic,
                    bmiddle_pic: bmiddle_pic,
                    original_pic: original_pic
                };
                callback(pics);
            },
            error: function() {
                callback(null);
            }
        });
    }
};

// https://groups.google.com/group/plixi/web/fetch-photos-from-url
var Plixi = {
  /*
   * http://api.plixi.com/api/tpapi.svc/imagefromurl?size=thumbnail&url=http://tweetphoto.com/5527850
   * http://api.plixi.com/api/tpapi.svc/imagefromurl?size=medium&url=http://tweetphoto.com/5527850
   * http://api.plixi.com/api/tpapi.svc/imagefromurl?size=big&url=http://tweetphoto.com/5527850
   */
  host: 'plixi.com',
  url_re: /http:\/\/(plixi\.com\/p|tweetphoto\.com)\//i,
  sync: true,
  get: function(url, callback) {
    var tpl = 'http://api.plixi.com/api/tpapi.svc/imagefromurl?size={{size}}&url=' + url;
    var pics = {
      thumbnail_pic: tpl.format({size: 'thumbnail'}),
      bmiddle_pic: tpl.format({size: 'medium'}),
      original_pic: url//tpl.format({size: 'big'})
    };
    callback(pics);
  }
};

// http://code.google.com/p/falang/issues/detail?id=190#makechanges
// http://img.ph.126.net/V2mX6JSNRZu_NkqIvk_kDA==/2357634404929042613.jpg#3
var Photo163 = {
    host: 'ph.126.net',
    url_re: /\.ph\.126\.net\/[\w\-\=]+\/\w+/i,
    sync: true,
    get: function(url, callback) {
        url = url.replace('#3', '');
        var pics = {
            thumbnail_pic: 'http://oimagec6.ydstatic.com/image?w=120&h=120&url=' + url,
            bmiddle_pic: url,
            original_pic: url
        };
        callback(pics);
    }
};

// http://code.google.com/p/imageshackapi/wiki/YFROGoptimizedimages
var Yfrog = {
  /*
   * http://yfrog.com/gyunmnrj:embed
   * http://yfrog.com/gyunmnrj:small
   */
  host: 'yfrog.com',
  url_re: /http:\/\/yfrog\.com\/\w+/i,
  show_link: true,
  sync: true,
  get: function(url, callback) {
    var pics = {
      thumbnail_pic: url + ':small',
      bmiddle_pic: url + ':embed',
      original_pic: url
    };
    callback(pics);
  }
};

// http://twitgoo.com/49d => http://twitgoo.com/49d/mini , http://twitgoo.com/49d/img
var Twitgoo = {
  host: 'twitgoo.com',
  url_re: /http:\/\/twitgoo\.com\/\w+/i,
  show_link: true,
  sync: true,
  get: function(url, callback) {
    var pics = {
      thumbnail_pic: url + '/mini',
      bmiddle_pic: url + '/img',
      original_pic: url + '/img'
    };
    callback(pics);
  }
};

// Add ’:full’, ‘:square’, ‘:view’, ‘:medium’, ‘:thumbnail’, or ‘:thumb’ 
// to the moby.to short url and you will be redirected to the correct image.
// http://developers.mobypicture.com/documentation/additional/inline-thumbnails/
// moby.to/sjhjvq
var MobyPicture = {
  host: 'moby.to',
  url_re: /http:\/\/(moby\.to|www\.mobypicture\.com)\/\w+/i,
  get: function (url, callback, ele) {
    if (url.indexOf('mobypicture.com') >= 0) {
      var short_url = $(ele).html();
      if (short_url.indexOf('moby.to') < 0) {
        // 如果还是不行，则直接爬页面获取
        // ajax get: <input id="bookmark_directlink" type="text" value="http://moby.to/r2g9zv"/>
        $.get(url, function (data) {
          var new_url = $(data).find('#bookmark_directlink').val();
          callback(MobyPicture._format_urls(new_url));
        });
        return; 
      }
      url = short_url;
    }
    callback(this._format_urls(url));
  },
  _format_urls: function (url) {
    if (url.indexOf('moby.to') < 0) {
      return null;
    }
    return {
      thumbnail_pic: url + ':thumb',
      bmiddle_pic: url + ':medium',
      original_pic: url + ':full'
    };
  }
};

// http://api.imgur.com/
// http://i.imgur.com/xuCIW.png or http://imgur.com/z2pX5.png
// key: cba6198873ac20498a5686839b189fc0
var Imgur = {
  host: 'imgur.com',
  url_re: /http:\/\/(i\.)?imgur\.com\/\w+\.\w+/i,
  show_link: true,
  sync: true,
  get: function(url, callback) {
    var re = /imgur.com\/(\w+)\.(\w+)/i;
    var tpl = 'http://i.imgur.com/{{word}}.{{ext}}';
    var results = re.exec(url);
    var pics = null;
    if(results) {
      var word = results[1];
      var ext = results[2];
      pics = {
        thumbnail_pic: tpl.format({word: word + 's', ext: ext}),
        bmiddle_pic: tpl.format({word: word + 'm', ext: ext}),
        original_pic: url
      };
    }
    callback(pics);
  },
  key: 'cba6198873ac20498a5686839b189fc0',
  api: 'http://imgur.com/api/upload.json'
};

var SinaImage = {
  host: 'sinaimg.cn',
  url_re: /sinaimg\.cn\/(\w+)\/\w+/i,
  sync: true,
  get: function(url, callback, ele) {
    var m = this.url_re.exec(url);
    callback({
      thumbnail_pic: url.replace(m[1], 'thumbnail'),
      bmiddle_pic: url.replace(m[1], 'bmiddle'),
      original_pic: url.replace(m[1], 'large')
    });
  }
};

var QQImage = {
  // http://app.qpic.cn/mblogpic/19dd9c4ece7b86262466/2000
  // => 
  // http://app.qpic.cn/mblogpic/19dd9c4ece7b86262466/160
  // http://app.qpic.cn/mblogpic/19dd9c4ece7b86262466/460
  // http://app.qpic.cn/mblogpic/19dd9c4ece7b86262466/2000
  host: 'qpic.cn',
  sync: true,
  url_re: /qpic\.cn\/mblogpic\/\w+\/(\w+)/i,
  get: function(url, callback, ele) {
    var m = this.url_re.exec(url);
    callback({
      thumbnail_pic: url.replace(m[1], '160'),
      bmiddle_pic: url.replace(m[1], '460'),
      original_pic: url.replace(m[1], '2000')
    });
  }
};

var SohuImage = {
  host: 't.itc.cn',
  url_re: /t\.itc\.cn\/.+\/(\w+(\.(png|jpg|gif|jpeg)))/i,
  sync: true,
  get: function(url, callback, ele) {
      var m = this.url_re.exec(url);
      callback({
          thumbnail_pic: url.replace(m[1], 'f_' + m[1]),
          bmiddle_pic: url.replace(m[1], 'm_' + m[1]),
          original_pic: url
      });
  }
};

// 图片服务
var ImageService = exports.ImageService = {
  services: {
    SinaImage: SinaImage,
    QQImage: QQImage,
    SohuImage: SohuImage,
    Instagram: Instagram, 
    Instagram2: Instagram2,
    Plixi: Plixi,
    Imgur: Imgur,
    Twitpic: Twitpic,
    Yfrog: Yfrog,
    Twitgoo: Twitgoo,
    MobyPicture: MobyPicture,
    Twipple: Twipple,
    Flickr: Flickr,
    DoubanImage: DoubanImage,
    Immio: Immio,
    Nodebox: Nodebox,
    Yupoo: Yupoo,
    FanfouImage: FanfouImage,
    Camplus: Camplus,
    Photo163: Photo163,
    Topit: Topit,
    Picplz: Picplz,
    Vida: Vida,
    ViaMe: ViaMe,
    PX500: PX500,
    Pinterest: Pinterest,
    Imgly: Imgly,
    FacebookPhoto: FacebookPhoto,
    Video163: Video163,
  },
  
  attempt: function (url, ele) {
    var $ele = $(ele);
    if ($ele.parent().parent().find('.thumbnail_pic').length > 0) {
      // 有图片，无需解析图片链接了
      return false;
    }
    var sourcelink = null;
    if (typeof url === 'object') {
      sourcelink = url.sourcelink;
      url = url.url;
    }
    for (var name in this.services) {
      var item = this.services[name];
      if (item.url_re.test(url)) {
        var old_title = $ele.attr('title');
        var title = _u.i18n("comm_mbleft_to_preview") + ', ' + _u.i18n('comm_mbright_to_open');
        if (old_title) {
          title += ', ' + old_title;
        }
        var attrs = {
          rhref: url,
          old_title: old_title,
          title: title, 
          //href: 'javascript:;',
          service: name
        };
        if (item.show_link) {
          attrs.show_link = '1';
        }
        if (sourcelink && sourcelink !== url) {
          attrs.sourcelink = sourcelink;
        }
        $ele.attr(attrs).one('click', function () {
          var $this = $(this);
          ImageService.show(this, $this.attr('service'), 
          $this.attr('rhref'), $this.attr('sourcelink'), $this.attr('show_link') === '1');
          return false;
        });
        if (item.sync) {
          $ele.click();
        }
        return true;
      }
    }
    return false;
  },
  
  show: function (ele, service, url, sourcelink, show_link) {
    service = this.services[service];
    service.get(url, function (pics, sync) {
      if (!pics) {
        return;
      }
      sourcelink = sourcelink || url;
      var title = _u.i18n("comm_mbright_to_open_pic");
      if (pics.caption) {
        title = pics.caption + ', ' + title;
      }
      // 是否需要原生链接，如果转发带图片的时候
      var need_sourcelink = service.need_sourcelink ? '1' : '0';
      var tpl = '<div><a target="_blank" class="thumbnail_pic" ' +
        ' sourcelink="' + sourcelink + '" need_sourcelink="' + need_sourcelink + '" ' +
        ' href="javascript:void(0);" bmiddle="{{bmiddle_pic}}" original="{{original_pic}}" title="' +
        title +'"><img class="imgicon pic" src="{{thumbnail_pic}}" /></a></div>';
      var $ele = $(ele);
      if (show_link !== true) {
        $ele.hide();
      } else {
        var old_title = $ele.attr('old_title') || '';
        if (pics.caption) {
          old_title = pics.caption + (old_title? (', ' + old_title) : '');
        }
        var attrs = {
          title: old_title,
          href: $ele.attr('rhref')
        };
        $ele.attr(attrs);
      }
      $ele.parent().after(tpl.format(pics));
    }, ele);
  },
  
  upload: function (pic, callback) {
    var settings = Settings.get();
    this.services[settings.image_service].upload(pic, callback);
  }
};

var VideoService = {
  // 判断是否qq支持的视频链接 youku,tudou,ku6
  is_qq_support: function (url) {
    return this.services.youku.url_re.test(url) ||
      this.services.ku6.url_re.test(url) ||
      this.services.tudou.url_re.test(url) ||
      this.services.yinyuetai.url_re.test(url);
  },
  services: {
    youku: {
      url_re: /youku\.com\/v_show\/id_([^\.]+)\.html/i,
      tpl: '<embed src="http://player.youku.com/player.php/sid/{{id}}/v.swf" quality="high" width="460" height="400" align="middle" allowScriptAccess="sameDomain" type="application/x-shockwave-flash"></embed>'
    },
    ku6: {
      // http://v.ku6.com/special/show_3898167/rJ5BS7HWyEW4iHC3.html
      url_re: /ku6\.com\/.+?\/([^\.\/]+)\.html/i,
      tpl: '<embed src="http://player.ku6.com/refer/{{id}}/v.swf" quality="high" width="460" height="400" align="middle" allowScriptAccess="always" allowfullscreen="true" type="application/x-shockwave-flash"></embed>'
    },
    tudou: {
      url_re: /tudou\.com\/programs\/view\/([^\/]+)\/?/i,
      tpl: '<embed src="http://www.tudou.com/v/{{id}}/v.swf" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" wmode="opaque" width="460" height="400"></embed>'
    },
    '56': {
      url_re: /56\.com\/.+?\/(v_[^\.]+)\.html/i,
      tpl: '<embed src="http://player.56.com/{{id}}.swf" type="application/x-shockwave-flash" allowNetworking="all" allowScriptAccess="always" width="460" height="400"></embed>'
    },
    // http://video.sina.com.cn/playlist/4576702-1405053100-1.html#44164340 => 
    // http://you.video.sina.com.cn/api/sinawebApi/outplayrefer.php/vid=44164340_1405053100_1/s.swf
    // http://you.video.sina.com.cn/api/sinawebApi/outplayrefer.php/vid=44164340_1405053100_Z0LhTSVpCzbK+l1lHz2stqkP7KQNt6nkjWqxu1enJA5ZQ0/XM5GdZtwB5CrSANkEqDhAQJw+c/ol0x0/s.swf
    // http://you.video.sina.com.cn/b/32394075-1575345837.html =>
    // http://you.video.sina.com.cn/api/sinawebApi/outplayrefer.php/vid=32394075_1575345837/s.swf
    sina: {
      url_re: /video\.sina\.com\.cn\/.+?\/([^\.\/]+)\.html(#\d+)?/i,
      format: function (matchs) {
        var id = matchs[1];
        if (matchs[2]) {
          id = matchs[2].substring(1) + id.substring(id.indexOf('-'));
        }
        return id.replace('-', '_');
      },
      tpl: '<embed src="http://you.video.sina.com.cn/api/sinawebApi/outplayrefer.php/vid={{id}}/s.swf" type="application/x-shockwave-flash" allowNetworking="all" allowScriptAccess="always" width="460" height="400"></embed>'
    },
    // http://url.cn/2Arc4n
    // http://v.qq.com/video/play.html?vid=8snYX6VEFXq
    // http://v.qq.com/cover/x/xp5cyy8s332vn56.html?vid=8RpUd2iCw0c
    qq: {
      url_re: /v\.qq\.com\/.+?vid=(\w+)/i,
      tpl: '<embed flashvars="version=20110401&amp;vid={{id}}&amp;autoplay=1&amp;list=2&amp;duration=&amp;adplay=1&amp;showcfg=1&amp;tpid=23" src="http://static.video.qq.com/TencentPlayer.swf" quality="high" name="_playerswf" id="_playerswf" bgcolor="#000000" width="460" height="400" align="middle" allowscriptaccess="always" allowfullscreen="true" type="application/x-shockwave-flash">'
    },
    // http://www.youtube.com/v/A6vXOZbzBYY?fs=1
    // http://youtu.be/A6vXOZbzBYY
    // http://www.youtube.com/watch?v=x9S37QbWYJc&feature=player_embedded
    youtube: {
      url_re: /(?:(?:youtu\.be\/(\w+))|(?:youtube\.com\/watch\?v=(\w+)))/i,
      format: function (matchs, url, ele) {
        if (url.indexOf('youtube.com/das_captcha') >= 0) {
          matchs = this.url_re.exec($(ele).html());
        }
        var id = matchs[1] || matchs[2];
        return id;
      },
      tpl: '<embed src="http://www.youtube.com/v/{{id}}?fs=1" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" width="460" height="400"></embed>'
    },
    
    // http://www.yinyuetai.com/video/96953
    yinyuetai: {
      url_re: /yinyuetai\.com\/video\/(\w+)/i,
      tpl: '<embed src="http://www.yinyuetai.com/video/player/{{id}}/v_0.swf" quality="high" width="460" height="400" align="middle"  allowScriptAccess="sameDomain" type="application/x-shockwave-flash"></embed>'
    },
    
    // http://www.xiami.com/song/2112011
    // http://www.xiami.com/widget/1_2112011/singlePlayer.swf
    xiami: {
      append: true, // 直接添加在链接后面
      url_re: /xiami\.com\/song\/(\d+)/i,
      tpl: '<embed src="http://www.xiami.com/widget/1_{{id}}/singlePlayer.swf" type="application/x-shockwave-flash" width="257" height="33" wmode="transparent"></embed>'
    },
    
    // http://v.zol.com.cn/video105481.html
    zol: {
      url_re: /v\.zol\.com\.cn\/video(\w+)\.html/i,
      tpl: '<embed height="400" width="460" wmode="opaque" allowfullscreen="false" allowscriptaccess="always" menu="false" swliveconnect="true" quality="high" bgcolor="#000000" src="http://v.zol.com.cn/meat_vplayer323.swf?movieId={{id}}&open_window=0&auto_start=1&show_ffbutton=1&skin=http://v.zol.com.cn/skin_black.swf" type="application/x-shockwave-flash">'
    },
    // http://v.ifeng.com/his/201012/00b4cb1a-7838-4846-aeaf-9967e3cdcd99.shtml
    // http://v.ifeng.com/v/jiashumei/index.shtml#bcd47338-3558-4436-90ca-4e233fcbc37a
    ifeng: {
      url_re: /v\.ifeng\.com\/(.+?)\/([^\.\/]+)\./i,
      format: function (matchs, url, ele) {
        var re = /[A-F0-9]{8}(?:-[A-F0-9]{4}){3}-[A-Z0-9]{12}/i;
        var m = re.exec(url);
        if (m) {
          matchs = m;
        }
        return matchs[matchs.length - 1];
      },
      tpl: '<embed src="http://v.ifeng.com/include/exterior.swf?guid={{id}}&pageurl=http://www.ifeng.com&fromweb=other&AutoPlay=true" quality="high"  allowScriptAccess="always" pluginspage="http://www.macromedia.com/go/getflashplayer" type="application/x-shockwave-flash" width="460" height="400"></embed>'
    },
    // http://code.google.com/p/falang/issues/detail?id=203
    // http://mi.xiaomi.com/yuyin/w.php?s=http://fx00402.files.xiaomi.net/11061124/7e32ba2c2df34b11bc51ad310179d5ebe10bfb0acbe6
    xiaomi: {
      url_re: /mi\.xiaomi\.com\/yuyin\/w\.php\?s\=(.+)/i,
      tpl: '<object data="http://mi.xiaomi.com/flash/yuyin.swf" \
        type="application/x-shockwave-flash" width="460" height="340">\
        <param name="wmode" value="transparent">\
        <param name="flashvars" value="filepath={{id}}.mp3">\
        <param name="movie" value="http://mi.xiaomi.com/flash/yuyin.swf"></object>'
    },
  },
  
  format_flash: function (flash_url) {
    return '<div><embed src="' + flash_url +
      '" type="application/x-shockwave-flash" quality="high" width="460" height="400" align="middle" allowScriptAccess="sameDomain"></embed></div>';
  },
  
  attempt: function (urldata, ele) {
    var url = urldata.url || urldata;
    var flash = urldata.flash || '';
    var flash_title = urldata.title || '';
    var screen_pic = urldata.screen;
    for (var name in this.services) {
      var service = this.services[name];
      if (service.url_re.test(url)) {
          var $ele = $(ele);
        if (service.append) {
          // 直接添加到后面
          var flash_code = flash ? this.format_flash(flash) : this.format_tpl(service, url, ele);
          var $parent = $ele.parent();
          if ($parent.find('.embed_insert').length == 0) {
            $parent.append('<div class="embed_insert">' + flash_code + '</div>');
          }
        } else {
          var old_title = $ele.attr('title');
          var title = _u.i18n("comm_mbleft_to_preview");
          if (flash_title) {
            title += '[' + flash_title + ']';
          }
          if (old_title) {
            title += ', ' + old_title;
          }
          var attrs = {
            title: title,
            rhref: url,
            href: 'javascript:;',
            flash: flash,
            flash_title: flash_title
          };
          $ele.attr(attrs).click(function () {
            var $this = $(this);
            VideoService.show(
              $this.attr('videoType'), 
              $this.attr('rhref'), 
              $this.attr('flash'), 
              $this.attr('flash_title'),
              this
            );
          });
          if (screen_pic) {
            var img_html = '<br/><img class="video_image" title="' +
              flash_title + '" src="' + screen_pic + '" /><br/>';
            $ele.parent().append(img_html);
          }
        }
        $ele.attr('videoType', name)
          .after(' [<a onclick="VideoService.popshow(this);return false;" href="javascript:;" title="' +
            _u.i18n("comm_popup_play") + '" class="external_link">' + _u.i18n("abb_play") +'</a>]');
        return true;
      }
    }
    return false;
  },
  format_tpl: function (service, url, ele) {
    var matchs = service.url_re.exec(url);
    var id = null;
    if (service.format) {
      id = service.format(matchs, url, ele);
    } else {
      id = matchs[1];
    }
    return service.tpl.format({id: id});
  },
  show: function (name, url, flash, ele) {
    var service = this.services[name];
    var flash_code = flash ? this.format_flash(flash) : this.format_tpl(service, url, ele);
    popupBox.showVideo(url, flash_code);
  },
  popshow: function (ele) {
    var $this = $(ele).prev('a');
    var vtype = $this.attr('videoType');
    var flash = $this.attr('flash');
    var title = $this.attr('flash_title') || '';
    var shorturl = $this.html();
    var url = 'popshow.html?vtype=' + vtype + '&s=' + shorturl + '&title=' + title;
    if (flash) {
      url += '&flash=' + flash;
    } else {
      url += '&url=' + ($this.attr('rhref') || $this.attr('href'));
    }
    var l = (window.screen.availWidth - 510) / 2;
    var width_height = vtype == 'xiami' ? 'width=300,height=50': 'width=460,height=430';
    var params = 'left=' + l + ',top=30,' + width_height +
      ',menubar=no,location=no,resizable=no,scrollbars=yes,status=yes';
    window.open(url, '_blank', params);
  }
};

function showLoading() {
  // var popupView = getPopupView();
  // if (popupView && popupView._showLoading) {
  //   popupView._showLoading();
  // }
}
exports.showLoading = showLoading;

function hideLoading() {
  // var popupView = getPopupView();
  // if (popupView && popupView._hideLoading) {
  //   popupView._hideLoading();
  // }
}
exports.hideLoading = hideLoading;

/**
 * 根据maxid删除重复的数据
 *
 * @param {Array}datas
 * @param {String}max_id
 * @param {Boolean}append
 *  如果append == true, 判断最后一个等于最大id的，将它和它前面的删除，twitter很强大，id大到js无法计算
 *  否则为prepend，判断最后一个等于最大id的，将它和它后面的删除
 * @return {Object}
 * @api public
 */
function filterDatasByMaxId(datas, max_id, append) {
  var news = datas, olds = [];
  if (max_id && datas && datas.length > 0) {
    max_id = String(max_id);
    var found_index = null;
    $.each(datas, function (i, item) {
      if (max_id === String(item.id)) {
        found_index = i;
        return false;
      }
    });
    if (found_index !== null) {
      if (append) {
        // id等于最大id的数据位于found_index，所以获取found_index+1开始往后的数据
        news = datas.slice(found_index + 1);
        olds = datas.slice(0, found_index + 1);
      } else {
        // 如果不是append的，id等于最大id的数据位于found_index，
        // 只需要从开始到found_index(不包含结束边界)
        news = datas.slice(0, found_index);
        olds = datas.slice(found_index);
      }
    }
  }
  return {news: news, olds: olds};
}
exports.filterDatasByMaxId = filterDatasByMaxId;

