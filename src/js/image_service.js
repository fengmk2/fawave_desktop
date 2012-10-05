/*!
 * fawave - lib/image_service.js
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var Nodebox = require('./service').Nodebox;

var ImageService = module.exports = {
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

var FanfouImage = {
  host: 'fanfou.com',
  url_re: /fanfou\.com\/photo\/\w+/i,
  cache: {},
  get: function (url, callback) {
    if (this.cache[url]) {
      return callback(this.cache[url], true);
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
        this.cache[url] = pics;
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

