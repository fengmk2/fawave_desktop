/*!
 * fawave - settings.js
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var CONST = require('./const');
var weibo = require('weibo');
var fs = require('fs');
var path = require('path');

var appkeyFile = path.join(path.dirname(__dirname), 'appkey.json');

exports.apps = {
  weibo: {
    appkey: '1759110853',
    secret: 'fb2f52866dde46ac7dccda7b1a550324',
    oauth_callback: 'http://nodeweibo.org/fawave/oauth/callback'
  },
  tqq: {
    appkey: '801196838',
    secret: '9f1a88caa8709de7dccbe3cae4bdc962',
    oauth_callback: 'http://nodeweibo.org/fawave/oauth/callback'
  }
};

if (fs.existsSync(appkeyFile)) {
  var appkeys = require(appkeyFile);
  for (var k in appkeys) {
    exports.apps[k] = appkeys[k];
  }
}

for (var blogtype in exports.apps) {
  // init appkey
  var app = exports.apps[blogtype];
  weibo.init(blogtype, app.appkey, app.secret, app.oauth_callback);
}

// 获取上次选择的发送账号
exports.getLastSendAccounts = function getLastSendAccounts() {
  return localStorage.getObject(CONST.LAST_SELECTED_SEND_ACCOUNTS) || '';
};

//-- 信息提示模式 (alert or dnd ) --
exports.getAlertMode = function getAlertMode() {
  var mode = localStorage.getObject(CONST.ALERT_MODE_KEY);
  return mode || 'alert';
};

exports.setAlertMode = function setAlertMode(mode) {
  localStorage.setObject(CONST.ALERT_MODE_KEY, mode);
};

//-- 新信息是否自动插入，默认不自动插入 --
exports.getAutoInsertMode = function getAutoInsertMode() {
  var mode = localStorage.getObject(CONST.AUTO_INSERT_MODE_KEY);
  return mode || 'notautoinsert';
};

// 判断是否非自动插入模式
exports.isNotAutoInsertMode = function isNotAutoInsertMode() {
  return exports.getAutoInsertMode() === 'notautoinsert';
};

exports.setAutoInsertMode = function setAutoInsertMode(mode) {
  localStorage.setObject(CONST.AUTO_INSERT_MODE_KEY, mode);
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

var Settings = exports.Settings = {
  defaults: {
    twitterEnabled: true,
    t_taobaoEnabled: false,
    globalRefreshTime: { //全局的刷新间隔时间
      friends_timeline: 90,
      mentions: 120,
      comments_mentions: 120,
      comments_timeline: 120,
      direct_messages: 120
    },
    isSetBadgeText: { //是否提醒未读信息数
      friends_timeline: true,
      mentions: true,
      comments_mentions: true,
      comments_timeline: true,
      direct_messages: true
    },
    isShowInPage: { //是否在页面上提示新信息
      friends_timeline: false,
      mentions: false,
      comments_mentions: true,
      comments_timeline: true,
      direct_messages: true
    },
    isEnabledSound: { //是否开启播放声音提示新信息
      friends_timeline: false,
      mentions: false,
      comments_mentions: false,
      comments_timeline: false,
      direct_messages: false
    },
    soundSrc: 'sound/d.mp3',
    isDesktopNotifications: { //是否在桌面提示新信息
      friends_timeline: false,
      mentions: false,
      comments_mentions: false,
      comments_timeline: false,
      direct_messages: false
    },
    desktopNotificationsTimeout: 5, //桌面提示的延迟关闭时间
//  isSyncReadedToSina: false, //已读消息是否和新浪微博页面同步
    isSyncReadedCount: true, // 同步已读数据
    isSharedUrlAutoShort: true, //分享正在看的网址时是否自动缩短
    sharedUrlAutoShortWordCount: 15, //超过多少个字则自动缩短URL
    quickSendHotKey: '113', //快速发送微博的快捷键。默认 F2。保存的格式为： 33,34,35 用逗号分隔的keycode
    isSmoothScroller: false, //是否启用平滑滚动
    smoothTweenType: 'Quad', //平滑滚动的动画类型
    smoothSeaeType: 'easeOut', //平滑滚动的ease类型
    sendAccountsDefaultSelected: 'current', //多账号发送的时候默认选择的发送账号
    enableContextmenu: true, //启用右键菜单

    font: 'Arial', //字体
    fontSite: 12, //字体大小
    popupWidth: 550, //弹出窗大小
    popupHeight: 550, 
    theme: 'pip_io', //主题样式
    translate_target: 'zh', // 默认翻译语言
    shorten_url_service: 't.cn', // 默认缩址服务
    image_service: 'Imgur', // 默认的图片服务
    enable_image_service: true, // 默认开启图片服务
    isGeoEnabled: false, //默认不开启上报地理位置信息
    isGeoEnabledUseIP: false, //true 使用ip判断， false 使用浏览器来判断
    geoPosition: null, //获取到的地理位置信息，默认为空
    sent_success_auto_close: true, // 弹出窗口全部发送成功自动关闭
    remember_view_status: true, // 记住上次浏览状态
    
    default_language: null, // 默认语言，如果没有设置，则使用i18n自动根据浏览器判断语言
    __allow_select_all: true, // 是否允许同时选择新浪和其他微博
    show_network_error: true, // 是否显示网络错误信息
    lookingTemplate: '{{title}} {{url}} '
  },
  init: function () { // 只在background载入的时候调用一次并给 _settings 赋值就可以
    var _sets = localStorage.getObject(CONST.SETTINGS_KEY);
    _sets = _sets || {};
    // 兼容不支持的缩址
    // if (_sets.shorten_url_service && !ShortenUrl.services[_sets.shorten_url_service]) {
    //   delete _sets.shorten_url_service;
    // }
    _sets = $.extend({}, this.defaults, _sets);
    
    if (!CONST.THEME_LIST[_sets.theme]) {
      _sets.theme = this.defaults.theme;
    }

    return _sets;
  },
  get: function () {
    var settings = localStorage.getObject(CONST.SETTINGS_KEY) || Settings.init();
    // console.log('settings: ' + JSON.stringify(settings));
    return settings;
  },
  save: function () {
    var _sets = this.get();
    localStorage.setObject(CONST.SETTINGS_KEY, _sets);
  },
  /*
  * 获取刷新间隔时间
  */
  getRefreshTime: function (user, t) {
    var r = 60;
    if (user && user.refreshTime && user.refreshTime[t]) {
      r = user.refreshTime[t];
    } else {
      r = this.get().globalRefreshTime[t];
    }
    if (refreshTimeLimit[user.blogType] &&
        refreshTimeLimit[user.blogType][t] &&
        refreshTimeLimit[user.blogType][t] > r) {
      r = refreshTimeLimit[user.blogType][t];
    }
    if (isNaN(r)) {
      r = 60;
    } else if (r < 30) {
      r = 30;
    } else if (r > 24 * 60 * 60) {
      r = 24 * 60 * 60;
    }
    return r;
  }
};
