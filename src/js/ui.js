/*!
 * fawave - ui.js
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var i18n = require('./i18n');
var User = require('./user');
var setting = require('./setting');
var tapi = require('weibo');
var getUser = User.getUser;
var Settings = setting.Settings;
var format = require('weibo/lib/utils').format;
var moment = require('moment');


//格式化时间输出。示例：new Date().format("yyyy-MM-dd hh:mm:ss");
Date.prototype.format = function (format) {
  var o = {
    "M+" : this.getMonth() + 1, //month
    "d+" : this.getDate(),    //day
    "h+" : this.getHours(),   //hour
    "m+" : this.getMinutes(), //minute
    "s+" : this.getSeconds(), //second
    "q+" : Math.floor((this.getMonth() + 3) / 3), //quarter
    "S" : this.getMilliseconds() //millisecond
  };
  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  }

  for (var k in o) {
    if (new RegExp("(" + k + ")").test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
    }
  }
  return format;
};

var Shotenjin = require('./lib/shotenjin');
var provinces = require('./provinces');

function endswith(s, suffix) {
  return s.indexOf(suffix, s.length - suffix.length) !== -1;
}

var _BUTTON_TPLS = {
  showMapBtn: '<a class="geobtn" href="javascript:" onclick="showGeoMap(\'{{user.profile_image_url}}\', {{geo.coordinates[0]}}, {{geo.coordinates[1]}});" title="' +
    i18n.get("btn_geo_title") + '"><img src="images/mapspin2a.png"/></a>',
  delTweetBtn: '<a class="deltweet" href="javascript:void(0);" data-id="{{id}}" title="' +
    i18n.get("btn_del_tweet_title") + '">' + i18n.get("abb_delete") + '</a>',
  replyBtn: '<a class="replytweet" href="javascript:void(0);" onclick="javascript:doReply(this,\'{{user.screen_name}}\',\'{{id}}\');" title="' +
    i18n.get("btn_mention_title") + '">@</a>',
  oretweetBtn: '<a class="oretweet ort" href="javascript:void(0);" onclick="javascript:sendOretweet(this,\'{{user.screen_name}}\',\'{{id}}\');" title="' +
    i18n.get("btn_rt_title") + '"></a>',
  retweetBtn: '<a class="rtweet" href="javascript:void(0);" onclick="doRT(this);" title="' +
    i18n.get("btn_old_rt_title") + '">RT</a>',
  repostBtn: '<a class="reposttweet" href="javascript:void(0);" ' +
    ' data-id="{{id}}" title="' + i18n.get("btn_repost_title") + '">' + i18n.get("abb_repost") + '</a>',
  repostCounts: '<span class="repostCounts">({{reposts_count}})</span>',
  commentBtn: '<a class="commenttweet" href="javascript:void(0);" ' +
    ' data-id="{{id}}" data-uid="{{user.id}}" data-screen_name="{{user.screen_name}}" ' +
    ' title="' + i18n.get("btn_comment_title") + '">' + i18n.get("abb_comment") + '</a>',
  commentCounts: '<span class="commentCounts">({{comments_btn}})</span>',
  delCommentBtn: '<a class="delcommenttweet" href="javascript:void(0);" ' +
    ' data-cid="{{id}}" title="' + i18n.get("btn_del_comment_title") + '">' + i18n.get("abb_delete") + '</a>',
  new_msgBtn: '<a class="newMessage" href="javascript:void(0);" onclick="doNewMessage(this,\'{{user.screen_name}}\',\'{{user.id}}\');" title="' +
    i18n.get("btn_direct_message_title") + '">' + i18n.get("abb_send_direct_message") + '</a>',
  delDirectMsgBtn: '<a class="newMessage" href="javascript:void(0);" onclick="delDirectMsg(this,\'{{user.screen_name}}\',\'{{id}}\');" title="' +
    i18n.get("btn_del_direct_message_title") + '">' + i18n.get("abb_delete") + '</a>',
  addFavoritesMsgBtn: '<a class="add_favorite_btn" data-id="{{id}}" title="' +
    i18n.get("btn_add_favorites_title") + '" href="javascript:void(0)"><img src="images/favorites_2.gif" /></a>',
  delFavoritesMsgBtn: '<a class="del_favorite_btn" data-id="{{id}}" title="' +
    i18n.get("btn_del_favorites_title") + '" href="javascript:void(0)"><img src="images/favorites.gif"/></a>',
  
  // rt
  rtShowMapBtn: '<a class="geobtn" href="javascript:" onclick="showGeoMap(\'{{retweeted_status.user.profile_image_url}}\', {{retweeted_status.geo.coordinates[0]}}, {{retweeted_status.geo.coordinates[1]}});" title="' +
    i18n.get("btn_geo_title") + '"><img src="images/mapspin2a.png"/></a>',
  rtRepostBtn: '<a class="reposttweet" href="javascript:void(0);" ' +
    ' data-id="{{retweeted_status.id}}" title="' + i18n.get("btn_repost_title") + '">' + i18n.get("abb_repost") + '</a>',
  rtRetweetBtn: '<a class="rtweet" href="javascript:void(0);" onclick="doRT(this, true);" title="' +
    i18n.get("btn_old_rt_title") + '">RT</a>',
  rtOretweetBtn: '<a class="oretweet ort" href="javascript:void(0);" onclick="javascript:sendOretweet(this,\'{{retweeted_status.user.screen_name}}\',\'{{retweeted_status.id}}\');" title="' +
    i18n.get("btn_rt_title") + '"></a>',
  rtCommentBtn: '<a class="commenttweet" href="javascript:void(0);" ' +
    ' data-id="{{retweeted_status.id}}" data-uid="{{retweeted_status.user.id}}" data-screen_name="{{retweeted_status.user.screen_name}}" ' +
    ' title="' + i18n.get("btn_comment_title") + '">' + i18n.get("abb_comment") + '</a>',
  rtCommentCounts: '<span class="commentCounts">({{rt_comments_count}})</span>',
  rtReplyBtn: '<a class="replytweet" href="javascript:void(0);" onclick="javascript:doReply(this,\'{{retweeted_status.user.screen_name}}\',\'{{retweeted_status.id}}\');" title="' +
    i18n.get("btn_mention_title") + '">@</a>',
  rtAddFavoritesMsgBtn: '<a class="newMessage" href="javascript:void(0);" onclick="addFavorites(this,\'{{retweeted_status.user.screen_name}}\',\'{{retweeted_status.id}}\');" title="' +
    i18n.get("btn_add_favorites_title") + '"><img width="11px" src="images/favorites_2.gif"/></a>',
  rtRepostCounts: '<span class="repostCounts">({{retweeted_status.reposts_count}})</span>',
    
    // rt rt
  rtrtShowMapBtn: '<a class="geobtn" href="javascript:" onclick="showGeoMap(\'{{retweeted_status.retweeted_status.user.profile_image_url}}\', {{retweeted_status.retweeted_status.geo.coordinates[0]}}, {{retweeted_status.retweeted_status.geo.coordinates[1]}});" title="' +
    i18n.get("btn_geo_title") + '"><img src="images/mapspin2a.png"/></a>',
  rtrtOretweetBtn: '',
  rtrtRetweetBtn: '<a class="rtweet" href="javascript:void(0);" onclick="doRT(this, false, true);" title="' +
    i18n.get("btn_old_rt_title") + '">RT</a>',
  rtrtRepostBtn: '<a class="reposttweet" href="javascript:void(0);" ' +
    ' data-id="{{retweeted_status.retweeted_status.id}}" title="' + i18n.get("btn_repost_title") + '">' + i18n.get("abb_repost") + '</a>',
  rtrtCommentBtn: '<a class="commenttweet" href="javascript:void(0);" ' +
    ' data-id="{{retweeted_status.retweeted_status.id}}" data-uid="{{retweeted_status.retweeted_status.user.id}}" data-screen_name="{{retweeted_status.retweeted_status.user.screen_name}}" ' +
    ' title="' + i18n.get("btn_comment_title") + '">' + i18n.get("abb_comment") + '</a>',
  rtrtCommentCounts: '<span class="commentCounts">({{rtrt_comments_count}})</span>',
  rtrtReplyBtn: '<a class="replytweet" href="javascript:void(0);" onclick="javascript:doReply(this,\'{{retweeted_status.retweeted_status.user.screen_name}}\',\'{{retweeted_status.retweeted_status.id}}\');" title="' +
    i18n.get("btn_mention_title") + '">@</a>',
  rtrtAddFavoritesMsgBtn: '<a class="newMessage" href="javascript:void(0);" onclick="addFavorites(this,\'{{retweeted_status.retweeted_status.user.screen_name}}\',\'{{retweeted_status.retweeted_status.id}}\');" title="' +
    i18n.get("btn_add_favorites_title") + '"><img width="11px" src="images/favorites_2.gif"/></a>',
  rtrtRepostCounts: '<span class="repostCounts">({{retweeted_status.retweeted_status.reposts_count}})</span>'
};

function buildStatusHtml(statuses, t, c_user) {
  var htmls = [];
  if (!statuses || statuses.length === 0) { 
    return htmls; 
  }
  if (!c_user) {
    c_user = getUser();
  }
  var theme = Settings.get().theme;
  var rt_replace_pre = null, rt_rt_replace_pre = null;
  rt_replace_pre = '<!-- {{retweeted_status_out}} -->';
  rt_rt_replace_pre = '<!-- {{retweeted_retweeted_status_out}} -->';
  // if (theme === 'pip_io' || theme === 'work') {
  //   rt_replace_pre = '<!-- {{retweeted_status_out}} -->';
  //   rt_rt_replace_pre = '<!-- {{retweeted_retweeted_status_out}} -->';
  // } else {
  //   rt_replace_pre = '<!-- {{retweeted_status_in}} -->';
  //   rt_rt_replace_pre = '<!-- {{retweeted_retweeted_status_in}} -->';
  // }
  
  var config = tapi.get_config(c_user);
  var support_do_comment = config.support_do_comment;
  var support_do_favorite = config.support_do_favorite;
  var show_fullname = config.show_fullname;
  var need_set_readed = false; // 必须设置为已读
  // if (t === 'user_timeline' || t === 'favorites') {
  //   need_set_readed = true;
  // }
  var BUTTON_TPLS = $.extend({}, _BUTTON_TPLS);

  // 不支持收藏
  if (!support_do_favorite) {
    BUTTON_TPLS.addFavoritesMsgBtn = BUTTON_TPLS.delFavoritesMsgBtn = '';
  }
  // 不支持repost(转发)
  // if (!config.support_repost) {
  //     BUTTON_TPLS.repostCounts = BUTTON_TPLS.rtRepostCounts = 
  //         BUTTON_TPLS.rtrtRepostCounts = BUTTON_TPLS.repostBtn = 
  //         BUTTON_TPLS.rtRepostBtn = BUTTON_TPLS.rtrtRepostBtn = '';
  // }
  // if (!config.support_counts) {
  //     BUTTON_TPLS.repostCounts = BUTTON_TPLS.rtRepostCounts = 
  //         BUTTON_TPLS.rtrtRepostCounts = '';
  // }
  // 不支持删除私信
  if (!config.support_destroy_msg) {
    BUTTON_TPLS.delDirectMsgBtn = '';
  }
// 不支持私信
  if (!config.support_direct_messages) {
    BUTTON_TPLS.delDirectMsgBtn = '';
    BUTTON_TPLS.new_msgBtn = '';
  }
  // 不支持评论
  if (!support_do_comment) {
    BUTTON_TPLS.commentBtn = BUTTON_TPLS.commentCounts = 
    BUTTON_TPLS.rtCommentCounts = BUTTON_TPLS.rtCommentBtn = '';
  }
  
  // 支持转发列表
  var tpl;
  // if (config.support_repost && config.support_repost_timeline) {
  tpl = '<span class="repostCounts">(<a href="javascript:void(0);" title="' + 
    i18n.get("comm_show_repost_timeline") + '" data-type="repost">{{reposts_count}}</a>)</span>';
  BUTTON_TPLS.repostCounts = tpl;
  BUTTON_TPLS.rtRepostCounts = tpl.replace(/\{\{reposts_count\}\}/g, '{{retweeted_status.reposts_count}}')
    .replace(/\{\{id\}\}/g, '{{retweeted_status.id}}');
  BUTTON_TPLS.rtrtRepostCounts = tpl.replace(/\{\{reposts_count\}\}/g, 
    '{{retweeted_status.retweeted_status.reposts_count}}')
    .replace(/\{\{id\}\}/g, '{{retweeted_status.retweeted_status.id}}');
// }
  var messageReplyToBtn = '';
  var support_instapaper = !!Settings.get().instapaper_user;
  var support_readitlater = !!Settings.get().readitlater_user;
  switch (t) {
  case 'friends_timeline':
  case 'favorites':
  case 'mentions':
  case 'user_timeline':
    BUTTON_TPLS.delDirectMsgBtn = BUTTON_TPLS.delCommentBtn = '';
    break;
  case 'comments_mentions':
  case 'comments_timeline':
    BUTTON_TPLS.repostBtn = BUTTON_TPLS.repostCounts = 
    BUTTON_TPLS.commentCounts = BUTTON_TPLS.delTweetBtn = 
    BUTTON_TPLS.delDirectMsgBtn = BUTTON_TPLS.addFavoritesMsgBtn = 
    BUTTON_TPLS.delFavoritesMsgBtn = '';
    BUTTON_TPLS.commentBtn = '<a class="commenttweet" href="javascript:void(0);" ' +
      ' data-id="{{status.id}}" data-uid="{{status.user.id}}" data-screen_name="{{status.user.screen_name}}" ' +
      ' data-cid="{{id}}" data-cuid="{{user.id}}" data-csn="{{user.screen_name}}" ' +
      ' title="' + i18n.get("btn_reply_comment_title") + '">' + i18n.get("abb_reply") + '</a>';
    break;
  case 'comments_by_me':
    BUTTON_TPLS.delDirectMsgBtn = BUTTON_TPLS.addFavoritesMsgBtn = 
    BUTTON_TPLS.delFavoritesMsgBtn = '';
    break;
  case 'direct_messages':
    BUTTON_TPLS.repostBtn = BUTTON_TPLS.oretweetBtn = 
    BUTTON_TPLS.repostCounts = BUTTON_TPLS.commentBtn = 
    BUTTON_TPLS.commentCounts = BUTTON_TPLS.delCommentBtn = 
    BUTTON_TPLS.delTweetBtn = BUTTON_TPLS.addFavoritesMsgBtn = 
    BUTTON_TPLS.retweetBtn = BUTTON_TPLS.replyBtn = 
    BUTTON_TPLS.delFavoritesMsgBtn = '';
    BUTTON_TPLS.new_msgBtn = BUTTON_TPLS.new_msgBtn.replace('>' + 
      i18n.get("abb_send_direct_message") + '<', '>' + i18n.get("abb_reply") + '<');
//        BUTTON_TPLS.replyBtn = '<a class="replytweet" href="javascript:void(0);" onclick="javascript:doReply(this,\'{{user.screen_name}}\',\'\');" title="'
//          + i18n.get("btn_mention_title") +'">@</a>';
    messageReplyToBtn = '回复给 <a class="newMessage" href="javascript:void(0);" ' + 
      ' onclick="doNewMessage(this,\'{{recipient.screen_name}}\',\'{{recipient.id}}\');" title="' + 
      i18n.get("btn_direct_message_title") + '">{{recipient.screen_name}}</a>';
    support_instapaper = support_readitlater = false;
    break;
  default:
    break;
  }
  if (c_user.blogtype !== 'twitter' && c_user.blogtype !== 'identi_ca') {
    BUTTON_TPLS.rtOretweetBtn = BUTTON_TPLS.oretweetBtn = '';
  }
  switch (c_user.blogtype) {
  case 'digu':
    if (t === 'mentions') {
      BUTTON_TPLS.replyBtn = BUTTON_TPLS.replyBtn.replace('>@<', '>' + i18n.get("abb_reply") + '<');
    }
    break;
  case 'renjian':
  case 'fanfou':
    BUTTON_TPLS.repostCounts = BUTTON_TPLS.rtRepostCounts = 
    BUTTON_TPLS.rtrtRepostCounts = '';
    break;
  case 'douban':
    BUTTON_TPLS.replyBtn = BUTTON_TPLS.rtReplyBtn = BUTTON_TPLS.rtrtReplyBtn = '';
    break;
  case 'renren':
    BUTTON_TPLS.delCommentBtn = BUTTON_TPLS.delTweetBtn =
      BUTTON_TPLS.replyBtn = BUTTON_TPLS.rtReplyBtn = BUTTON_TPLS.rtrtReplyBtn = '';
    break;
  case 'facebook':
    BUTTON_TPLS.replyBtn = BUTTON_TPLS.rtReplyBtn = 
    BUTTON_TPLS.rtrtReplyBtn = BUTTON_TPLS.new_msgBtn = BUTTON_TPLS.commentCounts = '';
    break;
  default:
    break;
  }
  var comments_count_tpl = '<a href="javascript:void(0);" title="' +
    i18n.get("btn_show_comments_title") + '"">{{comments_count}}</a>';
  var support_follow = c_user.blogtype !== 'douban' && c_user.blogtype !== 'renren';
  var isFavorited = t === 'favorites';
  for (var i = 0, len = statuses.length; i < len; i++) {
    var status = statuses[i];
    status.reposts_count = status.reposts_count || 0;
    status.user = status.user || status.sender || {};
    var rt_status = status.retweeted_status = status.retweeted_status || status.status;
    if (status.retweeted_status) {
      status.retweeted_status.user = status.retweeted_status.user || {};
    }
    status.comments_count = status.comments_count || 0;
    var comments_btn = format(comments_count_tpl, status);
    status.comments_btn = comments_btn;
    status.rt_comments_count = status.rtrt_comments_count = '-';
    var rtrt_status = null;
    if (rt_status && rt_status.user) {
      rt_status.reposts_count = rt_status.reposts_count || 0;
      rt_status.comments_count = rt_status.comments_count || 0;
      status.retweeted_status_screen_name = rt_status.user.screen_name;
      status.retweeted_status_id = rt_status.id;
      status.rt_comments_count = format(comments_count_tpl, rt_status);
      rtrt_status = rt_status.retweeted_status;
      if (rtrt_status && !rtrt_status.user) {
        rtrt_status.user = {};
      }
      if (rtrt_status && rtrt_status.user) {
        rtrt_status.reposts_count = rtrt_status.reposts_count || 0;
        rtrt_status.comments_count = rtrt_status.comments_count || 0;
        status.rtrt_comments_count = format(comments_count_tpl, rtrt_status);
      }
    } else {
      status.retweeted_status_id = status.retweeted_status_screen_name = '';
    }
    var buttons = {};
    for (var key in BUTTON_TPLS) {
      tpl = BUTTON_TPLS[key];
      var map_status = status;
      if (key.substring(0, 4) === 'rtrt') {
        map_status = status.retweeted_status ? status.retweeted_status.retweeted_status: null;
        if (!map_status) {
          tpl = '';
        }
      } else if (key.substring(0, 2) === 'rt') {
        map_status = status.retweeted_status;
        if (!map_status) {
          tpl = '';
        }
      }

      if (tpl && endswith(key, 'MapBtn') &&
        (!map_status.geo || !map_status.geo.coordinates || map_status.geo.coordinates[0] === '0.0')) {
        tpl = '';
      }
      if (tpl) {
        tpl = format(tpl, status);
      }
      buttons[key] = tpl;
    }
    if (status.favorited_at) {
      buttons.addFavoritesMsgBtn = '';
    } else {
      buttons.delFavoritesMsgBtn = '';
    }
    if (c_user && status.user && c_user.id === status.user.id) {
      status.myTweet = true;
      buttons.new_msgBtn = '';
      buttons.rtOretweetBtn = buttons.oretweetBtn = '';
    } else {
      buttons.delTweetBtn = '';
    }
    // 不支持评论
    if (status.hide_comments === true) {
      buttons.commentBtn = buttons.commentCounts =
        buttons.rtCommentCounts = buttons.rtCommentBtn = '';
    }
    if (rt_status && rt_status.retweeted) {
      buttons.rtOretweetBtn = '<a class="oretweet ort orted" href="javascript:void(0);" title="' + 
        i18n.get("btn_rted_title") + '"></a>';
    }
    if (status.retweeted) {
      buttons.oretweetBtn = '<a class="oretweet ort orted" href="javascript:void(0);" title="' + 
        i18n.get("btn_rted_title") + '"></a>';
    }
    var status_type = status.status_type || t;
    if (need_set_readed) {
      status.readed = true;
    }
    var context = {
      provinces: provinces,
      tType: status_type,
      getUserCountsInfo: getUserCountsInfo,
      buildTipboxUserInfo: buildTipboxUserInfo,
      processMsg: tapi.process_text.bind(tapi),
      user: status.user,
      account: c_user,
      tweet: status,
      is_rt_rt: false,
      support_follow: support_follow,
      show_fullname: show_fullname,
      support_instapaper: support_instapaper,
      support_readitlater: support_readitlater,
      btn: buttons
    };
    if (messageReplyToBtn && status.recipient && status.recipient.id !== c_user.id) {
      buttons.messageReplyToBtn = format(messageReplyToBtn, status);
    }
    try {
      var html = Shotenjin.render(window.TEMPLATE, context);
      if (rt_status) {
        rt_status.user = rt_status.user || {};
        html = html.replace(rt_replace_pre, Shotenjin.render(window.TEMPLATE_RT, context));
        if (rt_status.retweeted_status) {
          context.is_rt_rt = true;
          context.retweeted_status_user = rt_status.user || {};
          rt_status.retweeted_status.user = rt_status.retweeted_status.user || {};
          html = html.replace(rt_rt_replace_pre, Shotenjin.render(window.TEMPLATE_RT_RT, context));
        }
      }
      htmls.push(html);
    } catch (err) {
      // throw err;
      console.error(err);
    }
    status.readed = true;
  }
  return htmls;
}
exports.buildStatusHtml = buildStatusHtml;

function buildUsersHtml(users, t, c_user) {
  var htmls = [];
  if (!users || users.length === 0) { 
    return htmls; 
  }
  if (!c_user) {
    c_user = getUser();
  }
  var config = tapi.get_config(c_user);
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    var context = {
      provinces: provinces,
      tType: t,
      getUserCountsInfo: getUserCountsInfo,
      buildTipboxUserInfo: buildTipboxUserInfo,
      processMsg: tapi.process_text.bind(tapi),
      user: user,
      account: c_user,
      support_blocking: config.support_blocking,
      support_follow: !user.blocking && c_user.blogtype !== 'douban' && c_user.blogtype !== 'renren'
    };
    try {
      htmls.push(Shotenjin.render(TEMPLATE_FANS, context));
    } catch (err) {
      console.error(err);
    }
  }
  return htmls;
}

// 生成Tipbox用户信息(鼠标移到用户头像时显示的用户信息)
function buildTipboxUserInfo(user, show_fullname) {
  var context = {
    provinces: provinces,
    user: user,
    show_fullname: show_fullname
  };
  return Shotenjin.render(window.TEMPLATE_TIPBOX_USER_INFO, context);
}

// 生成用户信息
function buildUserInfo(user) {
  var c_user = getUser();
  var config = tapi.get_config(c_user);
  var context = {
    provinces: provinces,
    getUserCountsInfo: getUserCountsInfo,
    user: user,
    show_fullname: config.show_fullname,
    support_blocking: config.support_blocking,
    support_follow: !user.blocking && c_user.blogtype !== 'douban' && c_user.blogtype !== 'renren'
  };
  return Shotenjin.render(window.TEMPLATE_USER_INFO, context);
}
exports.buildUserInfo = buildUserInfo;

//生成粉丝信息
function buildFansLi(user, t) {
  var context = {
    t: t,
    provinces: provinces,
    getUserCountsInfo: getUserCountsInfo,
    user: user
  };
  return Shotenjin.render(TEMPLATE_FANS, context);
}
exports.buildFansLi = buildFansLi;

/**
 * 生成评论列表 / 转发列表
 * timeline_type: repost, comment
 */
function buildComment(user, comment) {
  var datetime = moment(comment.created_at).format("YYYY-MM-DD HH:mm:ss");
  var comment_btn = format('<a class="commenttweet replyComment" href="javascript:void(0);" title="' +
    i18n.get("btn_reply_comment_title") + '" ' +
    ' data-id="{{status.id}}" data-uid="{{status.user.id}}" data-screen_name="{{status.user.screen_name}}" ' +
    ' data-cid="{{id}}" data.cuid="{{user.id}}" data-csn="{{user.screen_name}}" ' + '>' +
    i18n.get("abb_reply") + '</a>', comment);
  if (comment.user.verified) {
    comment.user.verified = '<img title="' + i18n.get("comm_verified") + '" src="images/verified' +
      (comment.user.verified_type && comment.user.verified_type > 0 ? '_blue.png' : '.gif') + '" />';
  } else {
    comment.user.verified = '';
  }
  var reply_user = format('<a target="_blank" title="' + i18n.get("btn_show_user_title") +
    '">@{{screen_name}}{{verified}}</a>', comment.user);
  return '<li><span class="commentContent">' +
    reply_user + ': ' + tapi.process_text(user, comment) +
    '</span><span class="msgInfo">(' + datetime + ')</span>' +
    comment_btn + '</li>';
}
exports.buildComment = buildComment;

exports.buildRepost = function (user, status) {
  var datetime = moment(status.created_at).format("YYYY-MM-DD HH:mm:ss");
  var repost_btn = format('<a class="reposttweet replyComment" href="javascript:void(0);" ' +
    ' data-id="{{id}}" data-uid="{{user.id}}" data-screen_name="{{user.screen_name}}" ' +
    ' title="' + i18n.get("btn_repost_title") + '">' + i18n.get("abb_repost") + '</a>', status);
  var btns = format('<a class="commenttweet replyComment" href="javascript:void(0);" ' +
    ' data-id="{{id}}" data-uid="{{user.id}}" data-screen_name="{{user.screen_name}}" ' +
    ' title="' + i18n.get("btn_comment_title") + '">&nbsp;&nbsp;' +    
    i18n.get("abb_comment") + '</a>', status);
  btns += repost_btn;
  datetime = '<a href="' + status.t_url + '">' + datetime + '</a> ' + i18n.get('comm_post_by') +
    ' ' + status.source + ' ' + i18n.get('comm_repost');
  if (status.user.verified) {
    status.user.verified = '<img title="' + i18n.get("comm_verified") + '" src="images/verified' +
      (status.user.verified_type && status.user.verified_type > 0 ? '_blue.png' : '.gif') + '" />';
  } else {
    status.user.verified = '';
  }
  var reply_user = format('<a target="_blank" title="' + i18n.get("btn_show_user_title") +
    '">@{{screen_name}}{{verified}}</a>', status.user);
  return '<li id="tweet' + status.id + '"><span class="commentContent">' +
    reply_user + ': ' + tapi.process_text(user, status) +
    '</span><span class="msgInfo">(' + datetime + ')</span>' +
    btns + '</li><div class="clearFix"/>';
};

function getUserCountsInfo(user) {
  if (user.statuses_count === undefined) {
    return '';
  }
  return i18n.get("comm_follow") + '：' + user.friends_count + '\r\n' +
    i18n.get("comm_fans") + '：' + user.followers_count + '\r\n' +
    i18n.get("comm_tweet") + '：' + user.statuses_count + '';
}


// getPageScroll() by quirksmode.com
function getPageScroll() {
  var xScroll, yScroll;
  if (window.pageYOffset) {
    yScroll = window.pageYOffset;
    xScroll = window.pageXOffset;
  } else if (document.documentElement && document.documentElement.scrollTop) {   // Explorer 6 Strict
    yScroll = document.documentElement.scrollTop;
    xScroll = document.documentElement.scrollLeft;
  } else if (document.body) {// all other Explorers
    yScroll = document.body.scrollTop;
    xScroll = document.body.scrollLeft; 
  }
  return new Array(xScroll, yScroll);
}

  // Adapted from getPageSize() by quirksmode.com
function getPageHeight() {
  var windowHeight;
  if (window.innerHeight) { // all except Explorer
    windowHeight = window.innerHeight;
  } else 
  if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
    windowHeight = document.documentElement.clientHeight;
  } else if (document.body) { // other Explorers
    windowHeight = document.body.clientHeight;
  }
  return windowHeight;
}

var popupBox = exports.popupBox = {
  tp: '<div id="popup_box">' +
    '<div class="pb_title clearFix"><span class="t"></span><a href="javascript:" onclick="popupBox.close()" class="pb_close">' +
    i18n.get("comm_close") + '</a></div>' +
    '<div class="pb_content"></div>' +
  '</div>' +
  '<div id="popup_box_overlay"></di>',
  box: null,
  checkBox: function () {
    this.box = $("#popup_box");
    if (this.box.length === 0) {
      $("body div:eq(0)").append(this.tp);
      this.box = $("#popup_box");
      // init buttons events
      $(document).on('click', '.left_rotate_btn', function () {
        $('#facebox_see_img').rotateLeft(90);
        popupBox.show();
      });
      $(document).on('click', '.right_rotate_btn', function () {
        $('#facebox_see_img').rotateRight(90);
        popupBox.show();
      });
    }
    this.overlay = $("#popup_box_overlay ");
  },
  close: function () {
    this.box.hide();
    this.overlay.hide();
  },
  show: function (img_width, img_height) {
    this.overlay.show();
    var w = img_width;
    if (w) {
      var max_w = Number($("#facebox_see_img").css('max-width').replace('px', '')) + 10;
      w = Math.min(w, max_w);
    } else {
      w = this.box.width();
    }
    var h = img_height;
    if (!h) {
      h = this.box.height();
    }
    this.box.css({
      top: getPageScroll()[1] + (Math.max(10, $("body").height() / 2 - h / 2)),
      // top: Math.max(10, $("body").height() / 2 - h / 2),
      left: $("body").width() / 2 - w / 2 - 2
    }).show();
    $("body").scrollTop(1); //防止图片拉到底部关闭再打开无法滚动的问题
  },
  showOverlay: function () {},
  showImg: function (imgSrc, original, callbackFn) {
    this.checkBox();
    var image = $('<img />');
    image.on('load', function () {
      image.off('load error');
      popupBox.showOverlay();
      if (original) {
        popupBox.box.find('.pb_title .t, .pb_footer .t')
        .html('<a target="_blank" href="' + original + '">' + i18n.get("comm_show_original_pic") + '</a>');
      } else {
        popupBox.box.find('.pb_title .t, .pb_footer .t').html('');
      }
      popupBox.box.find('.pb_content')
      .html('<div class="image"><span class="rotate_btn"> \
        <a class="left_rotate_btn" href="javascript:void(0);"><img src="images/rotate_l.png"></a> \
        <a class="right_rotate_btn" href="javascript:void(0);" style="margin-left:10px;"><img src="images/rotate_r.png"></a></span>' +
        '<img id="facebox_see_img" src="' + image.attr('src') +
        '" class="cur_min" onclick="popupBox.close()" /></div>');
      popupBox.show(image.width(), image.height());
      image = null;
      callbackFn && callbackFn('success');
    }).on('error', function () {
      image.off('load error');
      image = null;
      callbackFn && callbackFn('error');
    });
    image.attr('src', imgSrc);
  },
  // showMap: function (user_img, myLatitude, myLongitude, geo_info) {
  //   this.checkBox();
  //   var latlng = new google.maps.LatLng(myLatitude, myLongitude);
  //   var myOptions = {
  //     zoom: 13,
  //     center: latlng,
  //     mapTypeId: google.maps.MapTypeId.ROADMAP
  //   };
  //   var map_canvas = $("#pb_map_canvas");
  //   if(!map_canvas.length){
  //       this.box.find('.pb_content').html('<div id="pb_map_canvas"></div>');
  //       map_canvas = $("#pb_map_canvas");
  //   }
  //   popupBox.show();
  //   var map = new google.maps.Map(map_canvas[0], myOptions);
  //   var marker = new google.maps.Marker({map: map, position:latlng});
    

  //   var geocoder = new google.maps.Geocoder();
  //   geocoder.geocode({'latLng': latlng}, function(results, status) {//根据经纬度查找地理位置
  //       if (status == google.maps.GeocoderStatus.OK) {//判断查找状态
  //           if (results[0]) {//查找成功
                
  //                   InfoWindow 信息窗口类。显示标记位置的信息
                
  //             var address = results[0].formatted_address;
  //             if(geo_info) {
  //               if(geo_info.ip) {
  //                 address += '<br/>IP: ' + geo_info.ip;
  //               }
  //               if(geo_info.more) {
  //                 address += '<br/>ISP: ' + geo_info.more;
  //               }
  //             }
  //               var infowindow = new google.maps.InfoWindow({
  //                   content: '<img class="map_user_icon" src="'+user_img+'" />' + address,
  //                   maxWidth: 60
  //               });
  //               infowindow.open(map, marker);//打开信息窗口。一般与map和标记关联
  //               google.maps.event.addListener(marker, 'click', function() {
  //                 infowindow.open(map,marker);
  //               });
  //           }
  //       } else {
  //           showMsg("Geocoder failed due to: " + status, true);
  //       }
  //   });
  // },
  showVideo: function (url, playcode) {
    this.checkBox();
    popupBox.box.find('.pb_title .t, .pb_footer .t')
    .html('<a target="_blank" href="' + url + '">' + i18n.get("comm_show_original_vedio") + '</a>');
    popupBox.box.find('.pb_content').html(playcode);
    popupBox.show();
  },
  showHtmlBox: function (title, content) {
    this.checkBox();
    popupBox.box.find('.pb_title .t, .pb_footer .t').html(title);
    popupBox.box.find('.pb_content').html(content);
    popupBox.show();
  }
};

function showTips(message) {
  var tip = $('#msgInfoWarp .messageInfo');
  if (tip.length === 0) {
    $('<div class="messageInfo"></div>')
    .appendTo('#msgInfoWarp');
    tip = $('#msgInfoWarp .messageInfo');
  }
  tip.html(message);
  if (tip.is(':hidden')) {
    tip.fadeIn('slow')
    .animate({opacity: 1.0}, 3000)
    .fadeOut('slow');
  }
}
exports.showTips = showTips;

function showErrorTips(err) {
  var message = err.name + ': ' + err.message;
  showTips(message);
}
exports.showErrorTips = showErrorTips;

