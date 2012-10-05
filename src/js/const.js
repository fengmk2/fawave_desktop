/*!
 * fawave - const.js
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var i18n = require('./i18n');

exports = module.exports = {
  PAGE_SIZE: 20,
  COMMENT_PAGE_SIZE: 10,
  SETTINGS_KEY: 'fawave_SETTINGS_KEY',

  UNSEND_TWEET_KEY: 'idi_UNSEND_TWEET_KEY', //未发送的tweet，保存下次显示
  UNSEND_REPLY_KEY: 'idi_UNSEND_REPLY_KEY', //未发送的回复，评论，转发，保存下次显示

  FRIENDS_TIMELINE_KEY: 'idi_friends_timeline',
  REPLIES_KEY: 'idi_replies',
  MESSAGES_KEY: 'idi_messages',

  USER_LIST_KEY: 'idi_userlist',
  CURRENT_USER_KEY: 'idi_current_user',

  LAST_MSG_ID: 'idi_last_msg_id',
  LAST_CURSOR: '_last_cursor',

  LAST_SELECTED_SEND_ACCOUNTS: 'LAST_SELECTED_SEND_ACCOUNTS',

  LOCAL_STORAGE_NEW_TWEET_LIST_KEY: 'idi_LOCAL_STORAGE_NEW_TWEET_LIST_KEY',
  LOCAL_STORAGE_TWEET_LIST_HTML_KEY: 'idi_LOCAL_STORAGE_TWEET_LIST_HTML_KEY',

  UNREAD_TIMELINE_COUNT_KEY: 'idi_UNREAD_TIMELINE_COUNT_KEY',

  IS_SYNC_TO_PAGE_KEY: 'idi_IS_SYNC_TO_PAGE_KEY', //已读消息是否和新浪微博页面同步

  ALERT_MODE_KEY: 'idi_ALERT_MODE_KEY', //信息提醒模式key
  AUTO_INSERT_MODE_KEY: 'idi_AUTO_INSERT_MODE_KEY', //新信息是否自动插入
  INCLUDE_ORIGINAL_COMMENT: 'idi_INCLUDE_ORIGINAL_COMMENT', // 回复评论的时候，是否带上原评论
};

exports.TIMELINE_LIST = [
  'friends_timeline', 'mentions', 'comments_mentions', 'comments_timeline',
  'direct_messages', 'favorites',
];

//需要不停检查更新的timeline的分类列表
var T_LIST = exports.T_LIST = {
  all: ['friends_timeline', 'mentions', 'comments_timeline', 'direct_messages'],
  weibo: [
    'friends_timeline', 
    // 'mentions', 'comments_mentions', 'comments_timeline',
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

exports.unreadDes = {
  'friends_timeline': i18n.get('abb_friends_timeline'), 
  'mentions': '@', 
  'comments_timeline': i18n.get('abb_comments_timeline'), 
  'direct_messages': i18n.get('abb_direct_message'),
  'comments_mentions': i18n.get('abb_comments_mentions'),
};

exports.tabDes = {
  'friends_timeline': i18n.get('comm_TabName_friends_timeline'), 
  'mentions': i18n.get('comm_TabName_mentions'), 
  'comments_mentions': i18n.get('comm_TabName_comments_mentions'),
  'comments_timeline': i18n.get('comm_TabName_comments_timeline'), 
  'direct_messages': i18n.get('comm_TabName_direct_messages')
};

exports.THEME_LIST = {
  'default': 'default', 
  'simple': 'simple', 
  'pip_io': 'pip_io', 
  'work': 'work'
};  //主题列表