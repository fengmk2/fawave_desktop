/*!
 * fawave - lib/video_service.js
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

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