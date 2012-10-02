/*!
 * fawave - background.js
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var setting = require('./setting');
var Settings = setting.Settings;
var i18n = require('./i18n');
var User = require('./user');
var tapi = require('weibo');
var utils = require('./utils');
var CONST = require('./const');

var T_LIST = CONST.T_LIST;
var getUser = User.getUser;
var getUserList = User.getUserList;
var getUserByUniqueKey = User.getUserByUniqueKey;
var setUnreadTimelineCount = User.setUnreadTimelineCount;
var showLoading = utils.showLoading;
var hideLoading = utils.hideLoading;
var filterDatasByMaxId = utils.filterDatasByMaxId;
var PAGE_SIZE = CONST.PAGE_SIZE;


// window._i18n_messages = null;
// function reload_i18n_messages(language, callback) {
//   if (!language) {
//     window._i18n_messages = null;
//     return callback && callback();
//   }
//   var url = chrome.extension.getURL('/_locales/' + language + '/messages.json');
//   if (url) {
//     $.get(url, function (messages) {
//       messages = eval('[' + messages + ']')[0];
//       window._i18n_messages = messages;
//       callback && callback(messages);
//     });
//   }
// }

// 如果用户设置了默认语言，则加载相应的语言文件
(function () {
  var language = Settings.get().default_language;
  if (language) {
    // reload_i18n_messages(language);
  }
})();

var tweets = {};
var new_win_popup = {};
var MAX_MSG_ID = {};
var SHORT_URLS = {};
var IMAGE_URLS = {};
var VIEW_STATUS = {}; // 上次的浏览状态

var checking = {}; // 正在检查是否有最新微博
var paging = {}; // 正在获取分页微博

function _format_data_key(data_type, end_str, user_uniquekey) {
  if (!user_uniquekey) {
    user_uniquekey = getUser().uniqueKey;
  }
  return user_uniquekey + data_type + end_str;
}

function get_view_status(data_type, user_uniquekey) {
  var key = _format_data_key(data_type, '_status', user_uniquekey);
  var status = VIEW_STATUS[key];
  if (!status) {
    status = {
      index: 0,
      size: 0,
      scrollTop: 0,
      clean_cache: false // 是否需要清除缓存
    };
    VIEW_STATUS[key] = status;
  }
  return  status;
}
exports.get_view_status = get_view_status;

function set_last_data_type(data_type, user_uniquekey) {
  VIEW_STATUS[user_uniquekey + '_last_tab'] = data_type;
}

function set_view_status(data_type, status, user_uniquekey) {
  if (!user_uniquekey) {
    user_uniquekey = getUser().uniqueKey;
  }
  var key = _format_data_key(data_type, '_status', user_uniquekey);
  VIEW_STATUS[key] = status;
  set_last_data_type(data_type, user_uniquekey);
}
exports.set_view_status = set_view_status;

// 获取上次当前用户正在访问的data_type
function get_last_data_type(user_uniquekey) {
  return VIEW_STATUS[user_uniquekey + '_last_tab'] || 'friends_timeline';
}
exports.get_last_data_type = get_last_data_type;

/**
 * 获取指定数据类型的本地缓存
 *
 * @param {String}user_uniqueKey
 * @param {String}data_type, like friends_timeline, mentions and os on.
 *  See utili.js / T_LIST.all define.
 * @return {Array}
 * @api public
 */
function get_data_cache(data_type, user_uniquekey) {
  var key = _format_data_key(data_type, '_tweets', user_uniquekey);
  return tweets[key];
}
exports.get_data_cache = get_data_cache;

function set_data_cache(cache, data_type, user_uniquekey) {
  var key = _format_data_key(data_type, '_tweets', user_uniquekey);
  tweets[key] = cache;
}

// 上次id参数缓存
function setLastMsgId(id, t, user_uniqueKey) {
  localStorage.setObject(user_uniqueKey + t + CONST.LAST_MSG_ID, id);
}

function getLastMsgId(t, user_uniqueKey) {
  return localStorage.getObject(user_uniqueKey + t + CONST.LAST_MSG_ID);
}

/**
 * 获取本地数据中最后一条记录的id标识值，用于分页和过滤数据
 *
 * @param String}data_type
 * @param {String}user_uniqueKey
 * @return last_id when cache is not empty, otherwise null.
 * @api public|private
 */
function getMaxMsgId(data_type, user_uniquekey) {
  var cache = get_data_cache(data_type, user_uniquekey);
  if (cache && cache.length > 0) {
    // 兼容网易的cursor_id
    // 兼容腾讯的PageTime
    var last_index = cache.length - 1;
    var last_id = cache[last_index].timestamp || 
      cache[last_index].cursor_id || 
      cache[last_index].id;
    if (typeof last_id === 'number') {
      last_id--;
    }
    return last_id;
  }
  return null;
}

var BlockingUser = {
  list: function (user, page, count, callback) {
    page = page || 1;
    var params = {user: user, page: page, count: count};
    tapi.blocks_blocking(params, function (users, textStatus, statuCode) {
      callback(users || []);
    });
  },
  _op: function (method, user_id, callback) {
    var user = getUser();
    var params = {user: user, user_id: user_id};
    tapi[method](params, function (result, textStatus, statuCode) {
      callback(result);
    });
  },
  create: function (user_id, callback) {
    this._op('blocks_create', user_id, callback);
  },
  destroy: function (user_id, callback) {
    this._op('blocks_destroy', user_id, callback);
  },
  exists: function (user_id, callback) {
    this._op('blocks_exists', user_id, callback);
  }
};

// 用户跟随放到background view这里处理
var friendships = {
  fetch_cursors: {},
  fetch_times: {}, // 上次爬取时间
  friend_data_type: 'user_friends',
  create: function (user_id, screen_name, callback) { //更随某人
    var user = getUser();
    var params = {id: user_id, user: user};
    tapi.friendships_create(params, function (user_info, textStatus, statuCode) {
      var message = '';
      if (user_info === true || user_info.id || user_info.success) {
        if (user_info.screen_name) {
          screen_name = user_info.screen_name;
        }
        message = i18n.get("msg_f_create_success").format({name: screen_name});
        if (user_info !== true && user_info.message) {
          message += ', ' + user_info.message;
        }
      } else {
        user_info = null;
        message = i18n.get("msg_f_create_fail").format({name: screen_name});
        if (user_info && user_info.message) {
          message += ', ' + user_info.message;
        }
      }
      // window.showMsg(message);
      if (callback) { 
        callback(user_info, textStatus, statuCode); 
      }
      // window.hideLoading();
    });
  },
  destroy: function (user_id, screen_name, callback) { //取消更随某人
    var user = getUser();
    var params = {id: user_id, user: user};
    tapi.friendships_destroy(params, function (user_info, textStatus, statuCode) {
      if (user_info === true || user_info.id) {
        if (user_info.screen_name) {
          screen_name = user_info.screen_name;
        }
        // window.showMsg(i18n.get("msg_f_destroy_success").format({name: screen_name}));
      } else {
        user_info = null;
      }
      if (callback) { 
        callback(user_info, textStatus, statuCode); 
      }
      // window.hideLoading();
    });
  },
  show: function (user_id) { //查看与某人的跟随关系
    var user = getUser();
    var params = {id: user_id, user: user};
    tapi.friendships_show(params, function () {});
  },
  fetch_friends: function (user_uniquekey, callback, context) {
    var user = null;
    if (user_uniquekey) {
      user = User.getUserByUniqueKey(user_uniquekey, 'all');
    }
    if (!user) {
      user = getUser();
    }
    var friend_data_type = this.friend_data_type;
    var count = 200;
    // 上次爬取的结果
    var fetch_cursor = friendships.fetch_cursors[user_uniquekey];
    var append = true;
    if (!fetch_cursor) {
      // 第一次获取
      fetch_cursor = '-1';
    } else if (String(fetch_cursor) === '0') {
      if (Date.now() - friendships.fetch_times[user_uniquekey] < 60000) {
        // 上次爬取时间和这次间隔在60秒以内的，直接返回空，不爬取
        callback.call(context, []);
        return;
      }
      // 已经全部爬取，现在只获取最近的即可
      // 为了省流量，只获取最近50
      count = 50;
      fetch_cursor = '-1';
      append = false;
    }
    var params = {
      user: user,
      user_id: user.id,
      cursor: fetch_cursor, 
      count: count
    };
    tapi.friends(params, function (data) {
      var friends = null;
      if (data) {
        friends = data.users || data.items || data;
      }
      // 重新获取一次cache，防止期间cache被更新了，之前的引用就失效了
      var cache = get_data_cache(friend_data_type, user.uniqueKey) || [];
      if (friends && friends.length > 0) {
        var max_id = null;
        if (cache.length > 0) {
          if (append) {
            max_id = cache[cache.length - 1].id;
          } else {
            max_id = cache[0].id;
          }
        }
        var result = filterDatasByMaxId(friends, max_id, append);
        friends = result.news;
        if (friends.length > 0) {
          var rt_at_name = tapi.get_config(user).rt_at_name;
          for (var i = 0, len = friends.length; i < len; i++) {
            var friend = friends[i];
            if (!friend) {
              continue;
            }
            // 只保存最简单的数据，减少内存占用
            friends[i] = {id: friend.id, screen_name: friend.screen_name};
            if (rt_at_name) {
              friends[i].name = friend.name;
            }
          }
          if (append) {
            cache = cache.concat(friends);
          } else {
            cache = friends.concat(cache);
          }
          set_data_cache(cache, friend_data_type, user.uniqueKey);
        }
      }
      if (data && String(friendships.fetch_cursors[user_uniquekey]) !== '0') {
        friendships.fetch_cursors[user_uniquekey] = String(data.next_cursor);
      }
      friendships.fetch_times[user_uniquekey] = new Date().getTime();
      callback.call(context, friends || []);
    });
  }
};

function merge_direct_messages(user_uniquekey, new_messages) {
  // 对私信进行合并排序
  var messages = get_data_cache('messages', user_uniquekey);
  if (!messages) {
    messages = [];
  }
  if (new_messages && new_messages.length > 0) {
    for (var i = 0; i < new_messages.length; i++) {
      new_messages[i].sort_value = new Date(new_messages[i].created_at).getTime();
    }
    var need_sort = messages.length > 0;
    messages = messages.concat(new_messages);
    if (need_sort) {
      messages.sort(function (a, b) {
        if (a.sort_value < b.sort_value) {
          return 1;
        }
        return -1;
      });
    }
  }
  set_data_cache(messages, 'messages', user_uniquekey);
}

// 获取最新的(未看的)微博
// @t : 获取timeline的类型
function checkTimeline(t, user_uniqueKey) {
  var c_user = null;
  if (!user_uniqueKey) {
    c_user = getUser();
    user_uniqueKey = c_user.uniqueKey;
  } else {
    c_user = getUserByUniqueKey(user_uniqueKey);
  }
  if (!c_user) {
    return;
  }
  if (isDoChecking(user_uniqueKey, t, 'checking')) { 
    return; 
  }
  var config = tapi.get_config(c_user);
  if (t === 'direct_messages' && config.support_sent_direct_messages) {
    // 私信，则同时获取自己发送的
    checkTimeline('sent_direct_messages', user_uniqueKey);
  }
  setDoChecking(user_uniqueKey, t, 'checking', true);
  var _key = user_uniqueKey + t + '_tweets';
  var params = { count: PAGE_SIZE };
  var last_id = null;
  if (tweets[_key] && tweets[_key].length > 0) {
    last_id = getLastMsgId(t, user_uniqueKey);
  }
  if (last_id) {
    params.since_id = last_id;
  }
  if (c_user.blogtype === 'tqq' && !last_id) {
    // 腾讯微博的第一次获取加pageflag=0，获取第一页
    params.pageflag = 0;
    params.since_id = 0;
  }
  showLoading();
  tapi[t](c_user, params, function (err, result) {
    hideLoading();
    if (err) {
      // 有错误，返回
      setTimeout(function () {
        // 停顿一小段时间再获取
        setDoChecking(user_uniqueKey, t, 'checking', false);
      }, 10000);
      return;
    }
    var data = result || {};
    var sinaMsgs = data.items || data;
    console.log(c_user.screen_name + ':' + t + ' items ' + sinaMsgs.length);
    var popupView = null;
    // var popupView = window;
    // var popupView = getPopupView();
    if (!tweets[_key]) {
      tweets[_key] = [];
    }
    if (!sinaMsgs || !sinaMsgs.length) {
      sinaMsgs = [];
    }
    var msg_len = sinaMsgs.length;
    // 避免插件启动的时候，无法获取出现的问题
    var isFirstTime = false;
    if (tweets[_key].length === 0) {
      isFirstTime = true;
      last_id = getLastMsgId(t, user_uniqueKey);
    }
    if (last_id && sinaMsgs.length > 0) {
      if (c_user.blogType === 't163' && last_id.indexOf(':') > 0) { // 兼容网易的id
        last_id = last_id.split(':', 1)[0];
      } else if (c_user.blogType === 'tqq') {
          // tqq 重现修改last_id为id
          //last_id = tweets[_key][0].id;
        last_id = getLastMsgId(t + '_real_id', user_uniqueKey);
      }
      var result = filterDatasByMaxId(sinaMsgs, last_id, false);
      if (tweets[_key].length === 0) {
        tweets[_key] = result.olds; // 填充旧的数据
        if (t === 'direct_messages' || t === 'sent_direct_messages') {
          // 将私信合并显示
          merge_direct_messages(user_uniqueKey, result.olds);
        }
        if (popupView) {
          popupView.addTimelineMsgs(result.olds, t, user_uniqueKey, isFirstTime, true);
        }
      }
      sinaMsgs = result.news;
    }
    if (sinaMsgs.length > 0) {
      // 保存最新的id，用于过滤数据和判断
      // 兼容网易的cursor_id
      // 兼容腾讯的pagetime
      var new_last_id = sinaMsgs[0].timestamp || sinaMsgs[0].cursor_id || sinaMsgs[0].id;
//            console.log(t, last_id, sinaMsgs[0].id, new_last_id, sinaMsgs[0], sinaMsgs);
      setLastMsgId(new_last_id, t, user_uniqueKey);
      if (c_user.blogType === 'tqq') {
          //qq的last_id保存的是timestamp，但是在过滤重复信息的时候需要用到id，所以再保存一个ID
        setLastMsgId(sinaMsgs[0].id, t + '_real_id', user_uniqueKey);
      }
      tweets[_key] = sinaMsgs.concat(tweets[_key]);
      if (t === 'direct_messages' || t === 'sent_direct_messages') {
          // 将私信合并显示
        merge_direct_messages(user_uniqueKey, sinaMsgs);
      }
      var _unreadCount = 0, _msg_user = null, c_user_id = String(c_user.id);
      for (var i = 0, len = sinaMsgs.length; i < len; i++) {
        _msg_user = sinaMsgs[i].user || sinaMsgs[i].sender;
        if (_msg_user && String(_msg_user.id) !== c_user_id) {
          _unreadCount += 1;
        }
      }
      var insert_success = false; // 是否成功添加新数据
      if (popupView) {
        // 判断是否还是当前用户
        if (!popupView.addTimelineMsgs(sinaMsgs, t, user_uniqueKey, isFirstTime)) {
          setUnreadTimelineCount(_unreadCount, t, user_uniqueKey);
          popupView.updateDockUserUnreadCount(user_uniqueKey);
        } else {
          insert_success = true;
          if (getUser().uniqueKey === user_uniqueKey) {
            popupView._showMsg(i18n.get("msg_has_new_tweet"));
          } else {
            setUnreadTimelineCount(_unreadCount, t, user_uniqueKey);
            popupView.updateDockUserUnreadCount(user_uniqueKey);
          }
        }
      } else { //在页面显示新消息，桌面提示
        setUnreadTimelineCount(_unreadCount, t, user_uniqueKey);
        showNewMsg(sinaMsgs, t, c_user);
        if (_unreadCount > 0) {
          NotificationsManager.show(c_user, t);
          playSound(t);
        }
      }
      var view_status;
      if (!insert_success) {
          // 如果未能成功插入数据，则记录下当前索引开始的位置
        if (setting.isNotAutoInsertMode()) {
          view_status = get_view_status(t, user_uniqueKey);
          view_status.index = view_status.index || 0;
          view_status.index += sinaMsgs.length;
          set_view_status(t, view_status, user_uniqueKey);
        }
      }
      // 一次超过分页数据，需要清空旧数据，否则会丢失中间数据，导致分页数据不正确
      if (!isFirstTime && sinaMsgs.length >= PAGE_SIZE) {
        // 清除缓存
        view_status = get_view_status(t, user_uniqueKey);
        var now_pos = view_status.index + view_status.size;
        if (now_pos <= sinaMsgs.length) {
          // 查看数据小于数据长度，则直接删除
          tweets[_key] = sinaMsgs;
        } else {
          // 清空旧数据标致位
          if (tweets[_key][sinaMsgs.length - 1]) {
            tweets[_key][sinaMsgs.length - 1].__clean_cache_status = true;
          }
          view_status.clean_cache = true;
          set_view_status(t, view_status, user_uniqueKey);
        }
        msg_len = sinaMsgs.length;
      }
    }
    if (data.next_cursor !== undefined && msg_len > 0) {
      // 保存最新的cursor，用于分页
      if (tweets[_key][msg_len - 1]) {
        tweets[_key][msg_len - 1].__pagging_cursor = data.next_cursor;
      }
    }
    // 判断是否需要清除多余的缓存数据，释放内存
    var max_len = PAGE_SIZE * 4;
    if (tweets[_key].length > max_len) {
      var i = max_len - 1;
      if (config.support_cursor_only) {
        // 找到最后带有分页cursor的位置
        var items = tweets[_key];
        for (; i > 0; i--) {
          if (items[i].__pagging_cursor !== undefined) {
            break;
          }
        }
      }
      var view_status = get_view_status(t, user_uniqueKey);
      var now_pos = view_status.index + view_status.size - 1;
      if (now_pos <= i) {
        // 查看数据小于数据长度，则直接删除
        tweets[_key] = tweets[_key].slice(0, i + 1);
      } else {
        // 清空旧数据标致位
        tweets[_key][i].__clean_cache_status = true;
        view_status.clean_cache = true;
        set_view_status(t, view_status, user_uniqueKey);
      }
    }
    setDoChecking(user_uniqueKey, t, 'checking', false);
    if (popupView) {
      popupView.showReadMore(t);
      popupView.hideReadMoreLoading(t);
    }
  });
}
exports.checkTimeline = checkTimeline;

// 如果获取新数据超过分页数，或大于特定数，则清空旧数据，只保存最近的一批数据
function clean_timeline_cache_data(t, user_uniqueKey) {
  if (!user_uniqueKey) {
    user_uniqueKey = getUser().uniqueKey;
  }
  var _key = user_uniqueKey + t + '_tweets';
  var items = tweets[_key], i = 0;
  if (!items) {
    return;
  }
  for (var len = items.length; i < len; i++) {
    if (items[i].__clean_cache_status) {
      break;
    }
  }
//    console.log('clean_timeline_cache_data', t, user_uniqueKey, index);
  tweets[_key] = tweets[_key].slice(0, i + 1);
}

//分页获取以前的微博
// @t : 获取timeline的类型
function getTimelinePage(user_uniqueKey, t) {
  var c_user = null;
  if (!user_uniqueKey) {
    c_user = getUser();
    user_uniqueKey = c_user.uniqueKey;
  } else {
    c_user = getUserByUniqueKey(user_uniqueKey);
  }
  if (!c_user) {
    return;
  }
  // if(t == 'followers'){ log('The Wrong Page Fetch: ' + t);return; } //忽略粉丝列表
  if (isDoChecking(user_uniqueKey, t, 'paging')) { return; }
  var config = tapi.get_config(c_user);
  if (t === 'direct_messages' && config.support_sent_direct_messages) {
    // 私信，则同时获取自己发送的
    getTimelinePage(user_uniqueKey, 'sent_direct_messages');
  }
  var t_key = user_uniqueKey + t + '_tweets';
  if (!tweets[t_key]) {
    tweets[t_key] = [];
  }
  var params = {user: c_user, count: PAGE_SIZE};
  if (config.support_cursor_only) { 
    // 只支持cursor分页
    // 先去tweets[t_key]获取最后一个数据是否带cursor，带则使用他，不带则使用last_cursor
    // 这是最巧妙的地方。。。
    var length = tweets[t_key].length || 0;
    if (length > 0 && tweets[t_key][length - 1].__pagging_cursor) {
      var cursor = null;
      cursor = String(tweets[t_key][length - 1].__pagging_cursor);
      if (cursor === '0') { // 再无数据
        return;
      }
      params.cursor = cursor;
    } 
  } else if (config.support_max_id) {
    // 判断是否支持max_id形式获取数据
    // 获取最旧的数据id
    var max_id = getMaxMsgId(t, user_uniqueKey);
    if (max_id) {
      params.max_id = max_id;
    }
  } else {
    // count, page 形式
    var page = Math.round(tweets[t_key].length / PAGE_SIZE);
    params.page = page + 1;
  }

  setDoChecking(user_uniqueKey, t, 'paging', true);
  
  showLoading();
//    console.log('bg_pagging', t, params.user.screen_name, 'cursor:', params.cursor, 'max_id:', params.max_id, 'page:', params.page);
  tapi[t](params, function (data, textStatus) {
    hideLoading();
    var sinaMsgs = null;
    if (data && !data.error && textStatus !== 'error') {
      sinaMsgs = data.items || data;
      if ($.isArray(sinaMsgs)) {
        if (sinaMsgs.length > 0) {
          var max_id = null;
          if (c_user.blogType === 'tqq' && tweets[t_key].length > 0) {
            max_id = tweets[t_key][0].id; // tqq 重现修改last_id为id
          } else {
            max_id = getMaxMsgId(t, user_uniqueKey);
          }
          var result = filterDatasByMaxId(sinaMsgs, max_id, true);
          sinaMsgs = result.news;
          for (var i = 0, len = sinaMsgs.length; i < len; i++) {
            sinaMsgs[i].readed = true;
          }
          tweets[t_key] = tweets[t_key].concat(sinaMsgs);
          if (t === 'direct_messages' || t === 'sent_direct_messages') {
            // 将私信合并显示
            merge_direct_messages(user_uniqueKey, sinaMsgs);
          }
        }
      }
      if (data.next_cursor && tweets[t_key].length > 0) {
        // 保存paging cursor信息
        tweets[t_key][tweets[t_key].length - 1].__pagging_cursor = String(data.next_cursor);
      }
    }
    setDoChecking(user_uniqueKey, t, 'paging', false);
    // 设置翻页和填充新数据到ui列表的后面显示
    _showReadMore(t, user_uniqueKey, sinaMsgs);
  });
}

// 设置可以继续翻页
// 如果datas是数组类型，则根据长度是否大于页数的一半判断是否可以继续翻页
function _showReadMore(t, user_uniqueKey, datas) {
  var current_user = getUser();
  //防止获取分页内容后已经切换了用户
  if (current_user.uniqueKey === user_uniqueKey) { 
    // TODO:更详细逻辑有待改进
    var popupView = getPopupView();
    if (popupView) {
      if ($.isArray(datas)) {
        popupView.addPageMsgs(datas, t, true);
        if (datas.length >= (PAGE_SIZE / 2)) {
          popupView.showReadMore(t);
        } else {
          popupView.hideReadMore(t, true);
        }
      } else { // 获取数据异常
        popupView.hideReadMoreLoading(t);
        setTimeout(function () {
          popupView = getPopupView();
          return popupView && popupView.showReadMore(t);
        }, 10000);
      }
    }
  }
}

//检查是否正在获取
//@t: timeline类型
//@c_t: checking or paging
function isDoChecking(user_uniqueKey, t, c_t) {
  if (!user_uniqueKey) {
    user_uniqueKey = getUser().uniqueKey;
  }
  // if (window[c_t][user_uniqueKey + t]) {
  //   var d = new Date().getTime();
  //   var _d = d - window[c_t][user_uniqueKey + t + '_time'];
  //   if (_d < 60 * 1000) { //如果还没有超过一分钟
  //     return true;
  //   }
  // }
  return false;
}

function setDoChecking(user_uniqueKey, t, c_t, v) {
  if (!user_uniqueKey) {
    user_uniqueKey = getUser().uniqueKey;
  }
  // window[c_t][user_uniqueKey + t] = v;
  // window[c_t][user_uniqueKey + t + '_time'] = new Date().getTime();
}

//在页面显示提示信息
//@user: 当前用户
function showNewMsg(msgs, t, user) {
  return;
  if (getAlertMode() === 'dnd') { return; } //免打扰模式
  if (Settings.get().isShowInPage[t]) {
    chrome.tabs.getSelected(null, function (tab) {
      if (!tab) {
        return;
      }
      chrome.tabs.sendRequest(tab.id, {
        method: 'showNewMsgInPage', 
        msgs: msgs, 
        t: t, 
        user: user
      }, function handler() {});
    });
  }
}

//播放声音提醒
var AlertaAudioFile = null;
// try {
//   AlertaAudioFile = new Audio(); //因为有一个Chrome的新版本居然没有Audio这个
// } catch (err) {
//   console.log('Not Support Audio: ' + err.message);
// }
function playSound(t) {
  if (!AlertaAudioFile) {
    return;
  }
  if (getAlertMode() !== 'dnd' && Settings.get().isEnabledSound[t]) {
    if (!AlertaAudioFile.src) {
      AlertaAudioFile.src = Settings.get().soundSrc;
    }
    AlertaAudioFile.play();
  }
}

//桌面信息提醒
var NotificationsManager = {
  tp: '<script> uniqueKey = "{{user.uniqueKey}}"; Timeout = {{timeout}};</script>' + 
    '<div class="item">' +
        '<div class="usericon"><img src="{{user.profile_image_url}}" class="face"/><img src="images/blogs/{{user.blogType}}_16.png" class="blogType"/></div>' + 
        '<div class="info"><span class="username">{{user.screen_name}}</span><br/>' + 
            '<span class="unreads">' + 
                '<span id="unr_friends_timeline"><span>{{unreads.friends_timeline}}</span>' +
                i18n.get("abb_friends_timeline") + '</span> &nbsp;&nbsp; <span id="unr_mentions"><span>{{unreads.mentions}}</span>@</span> <br/>' + 
                '<span id="unr_comments_timeline"><span>{{unreads.comments_timeline}}</span>' +
                i18n.get("abb_comment") + '</span> &nbsp;&nbsp; <span id="unr_direct_messages"><span>{{unreads.direct_messages}}</span>' +
                i18n.get("abb_direct_message") + '</span> ' + 
            '</span>' + 
        '</div>' + 
    '</div>' + 
    '<script> removeHighlight(); TIME_LINE = "{{t}}"; highlightTimeline();</script>',
  
  cache: {}, //存放要显示的账号
  isEnabled: function (t) {
    return getAlertMode() !== 'dnd' && Settings.get().isDesktopNotifications[t];
  },
  /*
  * 先检查cache中有account有没存在，如果存在，则说明正在创建Notifications窗口
  * 如果不存在，则缓存，并创建Notifications窗口。
  * 这样是为了避免Notifications窗口还在创建中，这时chrome.extension.getViews({type:"notification"})还不能获取到该窗口，则会造成重复创建
  */
  show: function (account, t) {
    if (!this.isEnabled(t)) { return; }
    
    if (this.cache[account.uniqueKey]) {
      this.cache[account.uniqueKey].timelines.push(t);
      return;
    } //如果缓存的还没显示

    var _nf = false;
    var nfViews = chrome.extension.getViews({type: 'notification'});
    for (var i in nfViews) {
      if (nfViews[i].uniqueKey === account.uniqueKey) { //如果已经存在，则直接更新内容
        var unreads = {};
        unreads.friends_timeline = getUnreadTimelineCount('friends_timeline', account.uniqueKey);
        unreads.mentions = getUnreadTimelineCount('mentions', account.uniqueKey);
        unreads.comments_mentions = getUnreadTimelineCount('comments_mentions', account.uniqueKey);
        unreads.comments_timeline = getUnreadTimelineCount('comments_timeline', account.uniqueKey);
        unreads.direct_messages = getUnreadTimelineCount('direct_messages', account.uniqueKey);
        nfViews[i].updateInfo(t, unreads);
        _nf = true;
      }
    }

    if (!_nf) { //如果还没存在，则通知创建
      account.timelines = [t];
      this.cache[account.uniqueKey] = account;
      var ntf = webkitNotifications.createHTMLNotification('/destop_alert.html' + '#' + account.uniqueKey);
      ntf.show();
    }
  },
  //Notifications窗口创建完后，调用该方法获取信息
  getShowHtml: function (uniqueKey) {
    var account = this.cache[uniqueKey];

    var unreads = {};
    unreads.friends_timeline = getUnreadTimelineCount('friends_timeline', account.uniqueKey);
    unreads.mentions = getUnreadTimelineCount('mentions', account.uniqueKey);
    unreads.comments_mentions = getUnreadTimelineCount('comments_mentions', account.uniqueKey);
    unreads.comments_timeline = getUnreadTimelineCount('comments_timeline', account.uniqueKey);
    unreads.direct_messages = getUnreadTimelineCount('direct_messages', account.uniqueKey);

    account.unreads = unreads;
    var timeout = Settings.get().desktopNotificationsTimeout;
    var data = this.tp.format({
      user: account, 
      unreads: unreads, 
      t: account.timelines.join(','), 
      timeout: timeout
    });
    delete this.cache[uniqueKey];
    return data;
  }
};

function refreshAccessToken(uniqueKey) {
  var user = getUserByUniqueKey(uniqueKey, 'all');
  if (!user) {
    return;
  }
  tapi.refresh_access_token(user, function (result) {
    if (!result) {
      return;
    }
    // 重新获取一次，防止用户信息被更新
    user = getUserByUniqueKey(uniqueKey, 'all');
    var userList = getUserList('all');
    $.extend(user, result);
    // 删除旧数据，替换新的
    $.each(userList, function (i, item) {
      if (item.uniqueKey === uniqueKey) {
        userList[i] = user;
        return false;
      }
    });
    saveUserList(userList);
    // 如果是当前用户，需要更新
    if (getUser().uniqueKey === user.uniqueKey) {
      setUser(user);
    }
  });
}

var RefreshManager = {
  itv: {},
  /*
  * 启动定时器
  * @getFirst: 如果为true， 则先发送一次请求，再启动定时器.
  */
  start: function (getFirst) {
    var userList = getUserList(), refTime = 90;
    for (var j = 0, jlen = userList.length; j < jlen; j++) {
      var user = userList[j], timeline_types = T_LIST[user.blogType];
      for (var i = 0, len = timeline_types.length; i < len; i++) {
        var uniqueKey = user.uniqueKey, t = timeline_types[i];
        refTime = Settings.getRefreshTime(user, t) * 1000;
        if (getFirst) { 
          checkTimeline(t, uniqueKey); 
        }
        this.itv[uniqueKey + t] = setInterval(checkTimeline, refTime, t, uniqueKey);
      }
      if (user.oauth_refresh_token && user.oauth_expires_in) {
        // 需要刷新 access token
        if (getFirst) {
          refreshAccessToken(user.uniqueKey);
        }
        refTime = (user.oauth_expires_in - 120) * 1000;
        this.itv[user.uniqueKey + 'refresh_access_token'] =
          setInterval(refreshAccessToken, refTime, user.uniqueKey);
      }
    }
  },
  stop: function () {
    for (var k in this.itv) {
      clearInterval(this.itv[k]);
    }
  },
  restart: function (getFirst) {
    this.stop();
    this.start(getFirst);
  },
  refreshUser: function (user) {
    var timeline_types = T_LIST[user.blogType];
    var key, refTime;
    for (var i = 0, len = timeline_types.length; i < len; i++) {
      var uniqueKey = user.uniqueKey, t = timeline_types[i];
      refTime = Settings.getRefreshTime(user, t) * 1000;
      key = uniqueKey + t;
      clearInterval(this.itv[key]); //重新计时
      checkTimeline(t, uniqueKey);
      this.itv[key] = setInterval(checkTimeline, refTime, t, uniqueKey);
    }
    if (user.oauth_refresh_token && user.oauth_expires_in) {
      // 需要刷新 access token
      key = user.uniqueKey + 'refresh_access_token';
      refTime = (user.oauth_expires_in - 120) * 1000;
      clearInterval(this.itv[key]);
      refreshAccessToken(user.uniqueKey);
      this.itv[key] = setInterval(refreshAccessToken, refTime, user.uniqueKey);
    }
  }
};
exports.RefreshManager = RefreshManager;

setUnreadTimelineCount(0, 'friends_timeline'); //设置提示信息（上次关闭前未读）

setTimeout(function () {
  refreshAccountInfo(function () {
    RefreshManager.start(true);
  }); //每次启动的时候都刷新一下用户信息
}, 1000);

function checkNewMsg(t, uniqueKey) {
  try {
    checkTimeline(t, uniqueKey);
  } catch (err) {
  }
}
exports.checkNewMsg = checkNewMsg;

exports._currentUser = null;
function onChangeUser() {
  exports._currentUser = null;
  var c_user = getUser();
  if (c_user) {
    exports._currentUser = c_user;
  }
}
exports.onChangeUser = onChangeUser;

// emotions
var Emotions = {
  weibo: {},
  loadWeibo: function () {
    var urls = [
      'http://api.t.sina.com.cn/emotions.json?&source=3538199806&language=cnname',
      'http://api.t.sina.com.cn/emotions.json?&source=3538199806&language=twname'
    ];
    var that = this;
    urls.forEach(function (url) {
      $.getJSON(url, function (items) {
        items = items || [];
        for (var i = items.length; i--;) {
          var item = items[i];
          that.weibo[item.phrase.substring(1, item.phrase.length - 1)] = item.url;
        }
      });
    });
  },
  loadAll: function () {
    this.loadWeibo();
  }
};
// Emotions.loadAll();
// setInterval(function () {
//   Emotions.loadAll();
// }, 3600000 * 6); // 6小时更新一次

// AD
var ADs = {
  adlist: null,
  currentIndex: -1,
  fetchAds: function () {
    $.getJSON("http://api.yongwo.de/fawave/adlist/", function (ads) {
      if (ads) {
        ADs.adlist = ads;
        ADs.currentIndex = -1;
      }
    });
  },
  getNext: function () {
    if (!ADs.adlist || ADs.currentIndex >= ADs.adlist.length) {
      ADs.fetchAds();
    } else {
      ADs.currentIndex++;
      return ADs.adlist[ADs.currentIndex];
    }
    return null;
  }
};
ADs.fetchAds();

var Beaut = {
  fetch: function () {
    if (Beaut.data) { return; }
    $.ajax({
      url: 'http://api.yongwo.de/beaut.html',
      type: 'GET',
      dataType: 'json',
      cache: false,
      success: function (r) {
        if (r) {
          Beaut.data = r;
        }
      },
      error: function (xhr, textStatus, err) {
          // console.log('Beaut load error: ' + (textStatus || err) );
      }
    });
  },
  ensure: function () {
    clearTimeout(Beaut.timeout);
    if (!Beaut.data) {
      Beaut.fetch();
      Beaut.timeout = setTimeout(Beaut.ensure, 30 * 60 * 1000);
    }
  }
};
//Beaut.ensure();

function refreshAccountWarp(user, stat, callback) {
  tapi.verify_credentials(user, function (data, textStatus, errorCode) {
    user.blogType = user.blogType || 'tsina'; //兼容单微博版
    user.authType = user.authType || 'baseauth'; //兼容单微博版
    if (errorCode) {
      stat.errorCount++;
    } else {
      $.extend(user, data); //合并，以data的数据为准
      user.uniqueKey = user.blogType + '_' + user.id;
      stat.successCount++;
    }
    if ((stat.errorCount + stat.successCount) === stat.userList.length) {
      // 全部刷新完，更新
      // 为防止在刷新用户信息的过程中，修改了用户信息
      var userlist = getUserList('all');
      $.extend(userlist, stat.userList);
      User.saveUserList(userlist);
      var c_user = getUser();
      if (c_user) {
        if (!c_user.uniqueKey) { //兼容单微博版本
          c_user.uniqueKey = (c_user.blogType || 'tsina') + '_' + c_user.id;
        }
        $.each(userlist, function (index, item) {
          if (c_user.uniqueKey.toLowerCase() === item.uniqueKey.toLowerCase()) {
            c_user = item;
            return false;
          }
        });
        User.setUser(c_user);
      }
    }
    callback && callback();
  });
}

// 刷新账号信息
function refreshAccountInfo(callback) {
  var stat = {errorCount: 0, successCount: 0};
  // 获取用户列表
  stat.userList = getUserList('all');
  $("#refresh-account").attr("disabled", true);
  var count = 0;
  stat.userList.forEach(function (item) {
    refreshAccountWarp(item, stat, function () {
      count++;
      if (count === stat.userList.length) {
        callback && callback();
      }
    });
  });
}

// 更新用户的地理位置信息（笔记本位置可能会变）
function updateGeoInfo() {
  if (Settings.get().isGeoEnabled) {
    if (Settings.get().isGeoEnabledUseIP) {
      get_location(function (geo, error) {
        if (geo) {
          Settings.get().geoPosition = geo;
        }
      });
    } else {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
          var p = { latitude: position.coords.latitude, longitude: position.coords.longitude };
          Settings.get().geoPosition = p;
        }, function (msg) {});
      }
    }
  }
}

try {
  updateGeoInfo();
} catch (err) {
}

// contextMenus, 右键快速发送微博
var sharedContextmenuId = null;
function createSharedContextmenu() {
  // if (!sharedContextmenuId) {
  //   sharedContextmenuId = chrome.contextMenus.create({
  //     title: i18n.get("comm_share_whit_fawave"), 
  //     contexts: ['all'],
  //     onclick: function (info, tab) {
  //       var text = info.selectionText;
  //       text = text || tab.title;
  //       var link = info.linkUrl || info.frameUrl || info.pageUrl;
  //       var image_rex = /\.(jpg|png|gif|bmp)$/ig;
  //       if (link.toLowerCase().indexOf('javascript') === 0 ||
  //           link === info.srcUrl || image_rex.test(link)) { // 如果等于图片本身，则使用当前页面url
  //         link = info.frameUrl || info.pageUrl;
  //       }
  //       chrome.tabs.sendRequest(tab.id, {
  //         method: 'showSendQuickMessage',
  //         text: text,
  //         link: link,
  //         info: info
  //       });
  //     }
  //   });
  // }
}

function removeSharedContextmenu() {
  // if (sharedContextmenuId) {
  //   chrome.contextMenus.remove(sharedContextmenuId);
  //   sharedContextmenuId = null;
  // }
}

// if (Settings.get().enableContextmenu) {
//   createSharedContextmenu();
// }

var r_method_manager = {
  test: function (request, sender, sendResponse) {
    sendResponse({ farewell: "goodbye" });
  },
  activelog: function (request, sender, sendResponse) {
    var active = request.active;
    var params = request.params;
    ActiveLog.log(active, params, sendResponse);
  },
  getLookingTemplate: function (request, sender, sendResponse) {
    var _l_tp = Settings.get().lookingTemplate;
    sendResponse({ lookingTemplate: _l_tp });
  },
  shortenUrl: function (request, sender, sendResponse) {
    var longurl = request.long_url;
    if (Settings.get().isSharedUrlAutoShort && 
      longurl.indexOf('chrome-extension://') !== 0 && 
      longurl.replace(/^https?:\/\//i, '').length > Settings.get().sharedUrlAutoShortWordCount) {
      ShortenUrl.short(longurl, function (shorturl) {
        sendResponse({ short_url: shorturl });
      });
    } else {
      sendResponse({ short_url: '' });
    }
  },
  getQuickSendInitInfos: function (request, sender, sendResponse) {
    var settings = Settings.get();
    var hotkeys = settings.quickSendHotKey;
    var c_user = getUser();
    var userList = getUserList('send');
    sendResponse({
      hotkeys: hotkeys, 
      c_user: c_user, 
      userList: userList,
      selectedAllAcounts: settings.sendAccountsDefaultSelected === 'all'
    });
  },
  publicQuickSendMsg: function (request, sender, sendResponse) {
    var msg = request.sendMsg;
    var user = request.user;
    var imageUrl = request.imageUrl;
    var pic = imageUrl ? getImageBlob(imageUrl) : null;
    var config = tapi.get_config(user);
    if (!config.support_upload) {
      pic = null;
    }
    var callback = function (sinaMsg, textStatus) {
      if (sinaMsg.id) {
        setTimeout(checkNewMsg, 1000, 'friends_timeline');
      }
      sendResponse({ msg: sinaMsg, textStatus: textStatus });
    };
    var data;
    if (pic) {
      data = { status: msg };
      pic = { file: pic };
      tapi.upload(user, data, pic, function () {}, function () {}, callback);
    } else {
      data = { status: msg, user: user };
      tapi.update(data, callback);
    }
  },
  uploadImage: function (req, sender, sendResponse) {
    var imageUrl = req.imageUrl;
    var pic = imageUrl ? getImageBlob(imageUrl) : null;
    if (pic) {
      Immio.upload({}, pic, function (error, info) {
        var url = null;
        if (info && info.link) {
          url = info.link;
        }
        sendResponse({ url: url });
      });
    } else {
      sendResponse({});
    }
  },
  notifyCheckNewMsg: function (request, sender, sendResponse) {
    setTimeout(checkNewMsg, 1000, 'friends_timeline');
  },
  captureVisibleTab: function (request, sender, sendReponse) {
    chrome.tabs.captureVisibleTab(null, {format: 'png'}, function (dataUrl) {
      sendReponse({dataUrl: dataUrl});
    });
  },
  getBeautData: function (request, sender, sendResponse) {
    sendResponse({data: Beaut.data});
  }
};

// 与page.js通讯
// chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
//   // sender.tab ? sender.tab.url
//   if (request.method) {
//     r_method_manager[request.method](request, sender, sendResponse);
//   }
// });
