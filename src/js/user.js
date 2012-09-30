var utils = require('./utils');
var setting = require('./setting');
var Settings = setting.Settings;
var CONST = require('./const');

/**
 * 获取所有用户列表
 *
 * @param {String} t, all: 全部， send:用于发送的用户列表， show:正常显示的用户。默认为show
 * @return {Array} user list.
 */
function getUserList(t) {
  t = t || 'show'; // 默认，获取用于显示的列表
  var users = localStorage.getObject(CONST.USER_LIST_KEY) || [];
  if (t === 'all' && users.length !== undefined) { // 兼容旧格式
    return users;
  }
  var items = [], user = null;
  for (var i = 0, l = users.length; i < l; i++) {
    user = users[i];
    if (!user.disabled) {
      if (t === 'show' && user.only_for_send) { 
        continue; 
      }
      items.push(users[i]);
    }
  }
  return items;
}
exports.getUserList = getUserList;

/**
 * 保存用户列表
 * @param {Array} users
 */
function saveUserList(users) {
  localStorage.setObject(CONST.USER_LIST_KEY, users);
}
exports.saveUserList = saveUserList;

/**
 * 获取当前登录用户
 * @return {Object} current user.
 */
function getUser() {
  var user = localStorage.getObject(CONST.CURRENT_USER_KEY);
  if (!user || !user.uniqueKey) {
    var users = getUserList() || [];
    for (var i = 0; i < users.length; i++) {
      user = users[i];
      if (user) {
        setUser(user);
        break;
      }
    }
  }
  return user;
}
exports.getUser = getUser;

function setUser(user) {
  localStorage.setObject(CONST.CURRENT_USER_KEY, user);
}
exports.setUser = setUser;


//根据uniqueKey获取用户
//@t: all: 全部， send:用于发送的用户列表， show:正常显示的用户。默认为show
function getUserByUniqueKey(uniqueKey, t) {
  if (!uniqueKey) {
    return null;
  }
  var userList = getUserList(t);
  for (var i = 0, l = userList.length; i < l; i++) {
    if (userList[i].uniqueKey === uniqueKey) {
      return userList[i];
    }
  }
  return null;
}
exports.getUserByUniqueKey = getUserByUniqueKey;

// 获取用户的某一timeline的未读信息数
function getUnreadTimelineCount(t, user_uniqueKey) {
  if (!user_uniqueKey) {
    var _user = getUser();
    if (_user) {
      user_uniqueKey = _user.uniqueKey;
    } else {
      return 0;
    }
  }
  //key 大概如： tsina#11234598_friends_timeline_UNREAD_TIMELINE_COUNT_KEY
  var key = user_uniqueKey + t + CONST.UNREAD_TIMELINE_COUNT_KEY;
  return localStorage.getObject(key) || 0;
}
exports.getUnreadTimelineCount = getUnreadTimelineCount;

// @count: 增加的未读数
// @t: timeline的类型
function setUnreadTimelineCount(count, t, user_uniqueKey) {
  if (!user_uniqueKey) {
    var _user = getUser();
    if (_user) {
      user_uniqueKey = _user.uniqueKey;
    } else {
      return;
    }
  }
  count = count || 0;
  var setBadgeText = Settings.get().isSetBadgeText[t];
  count += getUnreadTimelineCount(t, user_uniqueKey);
  localStorage.setObject(user_uniqueKey + t + CONST.UNREAD_TIMELINE_COUNT_KEY, count);
  // if (getAlertMode() === 'dnd') { 
  //   //免打扰模式
  //   chrome.browserAction.setBadgeText({text: ''});
  //   chrome.browserAction.setIcon({path: 'icons/icon48-dnd.png'});
  // } else {
  //   chrome.browserAction.setIcon({path: 'icons/icon48.png'});
  //   if (setBadgeText) {
  //     var total = 0;
  //     var userList = getUserList();
  //     for (var j = 0, jl = userList.length; j < jl; j++) {
  //       var user = userList[j];
  //       var timelines = T_LIST[user.blogType];
  //       for (var i = 0, l = timelines.length; i < l; i++) {
  //         var name = timelines[i];
  //         if (Settings.get().isSetBadgeText[name]) {
  //           total += getUnreadTimelineCount(name, user.uniqueKey);
  //         }
  //       }
  //     }
  //     if (total > 0) {
  //       chrome.browserAction.setBadgeText({text: '' + total});
  //     } else {
  //       chrome.browserAction.setBadgeText({text: ''});
  //     }
  //   }
  // }
  // chrome.browserAction.setTitle({title: getTooltip()});
}
exports.setUnreadTimelineCount = setUnreadTimelineCount;

exports.at_user_autocomplete = at_user_autocomplete;
// match_all_text 是否匹配全部内容
function at_user_autocomplete(ele_id, match_all_text, select_callback) {
  return;
  // support @ autocomplete
  var $tip_div = $('<div ele_id="' + ele_id +
    '" style="z-index: 2000; position: absolute;display:none; " class="at_user"><ul></ul></div>');
  $(document.body).append($tip_div);
  var ele = $(ele_id).get(0);
  ele.select_callback = select_callback;
  ele.match_all_text = match_all_text;
  $(ele_id).keyup(function (event) {
      if (!this._at_key_loading && // 不是正在加载
        event.keyCode != '13' && event.keyCode != '38' && event.keyCode != '40') {
        var key_index = 0, key = null;
        if (!match_all_text) {
          var value = $(this).val().substring(0, this.selectionStart);
          key_index = value.search(/@[^@\s]{1,20}$/g);
          if (key_index >= 0) {
                key = value.substring(key_index + 1);
                if (!/^[a-zA-Z0-9\u4e00-\u9fa5_]+$/.test(key)){
                  key = null;
                }
              }
        } else {
          key = $(this).val();
        }
          var $text_tip = $('#text_tip');
          if (key) {
            // http://xiaocai.info/2011/03/js-textarea-body-offset/
            this._at_key = key;
            this._at_key_index = key_index;
            this._at_key_loading = true;
            at_user_search(key, function (names) {
              this._at_key_loading = false;
              var html = '';
                for (var user_id in names) {
                  var item = names[user_id];
                  var showname = item[1];
                  if (item[0] !== item[1]) {
                      showname += '(' + item[0] + ')';
                  }
                  html += '<li name="' + item[0] + '" user_id="' + user_id + '">' + showname + '</li>';
                }
                if (!html) {
                  $tip_div.hide();
                  return;
                }
                $tip_div.find('ul').html(html).find('li:first').addClass('cur');
                _bind_tip_items($tip_div);
                
                var $this = $(this);
                var ele_offset = $this.offset();
                if ($text_tip.length === 0) {
                  $text_tip = $('<div id="text_tip" style="z-index:-1000;position:absolute;opacity:0;overflow:auto;display:inline;word-wrap:break-word;"></div>');
                  $(document.body).append($text_tip);
                }
                $text_tip.css({
                left: ele_offset.left, 
                top: ele_offset.top, 
                height: $this.height,
                width: $this.width(),
                'font-family': $this.css('font-family'),
                'font-size': $this.css('font-size')
              });
                var text = $this.val().substring(0, this.selectionStart);
                function _format(s) {
                  return s.replace(/</ig, '&lt;').replace(/>/ig, '&gt;')
                    .replace(/\r/g, '').replace(/ /g, '&nbsp;').replace(/\n/g, '<br/>');
                }
                $text_tip.html(_format(text) + '<span>&nbsp;</span>');
                var $span = $text_tip.find('span');
                var offset = $span.offset();
                var left = offset.left - $span.width();
                if ((left + $tip_div.width()) > (ele_offset.left + $this.width())) {
                  left -= $tip_div.width();
                }
                var top = Math.min(offset.top + $span.height(), ele_offset.top + $this.height());
                $tip_div.css({ left: left, top: top }).show();
            }, this);
          } else {
            $tip_div.hide();
          }
      }
    }).keydown(function (){
      if ($tip_div.css('display') !== 'none') {
//        keycode 38 = Up 
//        keycode 40 = Down
        if (event.keyCode === 13) {
          $tip_div.find('li.cur').click();
            return false;
          } else if (event.keyCode == 38) {
            var $prev = $tip_div.find('li.cur').prev();
            if ($prev.length == 1) {
              $tip_div.find('li.cur').removeClass('cur');
              $prev.addClass('cur');
            }
            return false;
          } else if (event.keyCode === 40) {
            var $next = $tip_div.find('li.cur').next();
            if ($next.length === 1) {
              $tip_div.find('li.cur').removeClass('cur');
              $next.addClass('cur');
            }
            return false;
          }
      }
    }).focusout(function () {
      // 延时隐藏，要不然点击选择的时候，已经被隐藏了，无法选择
      setTimeout(function () {
        $tip_div.hide();
      }, 100);
    }).click(function () {
      $(this).keyup();
    });
  $tip_div.click(function () {
      var $select_li = $(this).find('li.cur:first');
      var $text = $($tip_div.attr('ele_id'));
      var value = $text.val();
      var ele = $text.get(0);
      var user_name = $select_li.attr('name');
      if (ele.match_all_text) {
        $text.val(user_name);
        $text.focus();
      } else {
        var new_value = value.substring(0, ele._at_key_index + 1);
          new_value += user_name + ' ' + value.substring(ele.selectionStart);
          $text.focus().val(new_value);
          // 设置光标位置
          ele.selectionStart = ele.selectionEnd = ele._at_key_index + user_name.length + 2;
      }
      if (ele.select_callback) {
        ele.select_callback({
          id: $select_li.attr('user_id'),
          name: user_name,
          screen_name: $select_li.html()
        });
      }
      setTimeout(function () {
        $tip_div.hide();
      }, 100);
    });
};


//@user search
function at_user_search(query, callback, context) {
  var query_regex = new RegExp(query, 'i');
  var current_user = null;
  // 当前不是对话框回复的话，则代表是发微博
  if ($("#ye_dialog_window").is(':hidden')) {
      // 根据当前选择的用户来获取at数据
      // 如果只选择了一个用户，则使用选择的用户
      // 如果没有选择或者选择大于1人，则使用当前用户
      var $selected = $('#accountsForSend li.sel:last');
      if ($selected.length > 0) {
          current_user = getUserByUniqueKey($selected.attr('uniquekey'), 'all');
      } 
  }
  if (!current_user) {
      current_user = getUser();
  }
  var b_view = getBackgroundView();
  var hits = {}, hit_count = 0;
  var config = tapi.get_config(current_user);
  var data_types = [b_view.friendships.friend_data_type].concat(T_LIST.all);
  for (var index=0, index_len = data_types.length; index < index_len; index++) {
    var tweets = b_view.get_data_cache(data_types[index], current_user.uniqueKey) || [];
      for (var i = 0, len = tweets.length; i < len; i++){
        var tweet = tweets[i];
        var items = [tweet.user || tweet];
        var rt = tweet.retweeted_status || tweet.status;
        if (rt) {
          items.push(rt.user);
          if (rt.retweeted_status) {
            items.push(rt.retweeted_status.user);
          }
        }
        for (var j = 0, jlen = items.length; j < jlen; j++) {
          var user = items[j];
          if (_check_name(user, query_regex)) {
                if (!hits[user.id]) {
                        if (current_user.blogType === 'renren') {
                            hits[user.id] = [ user.screen_name + '(' + user.id + ')', user.screen_name ];
                        } else {
                            if (config.rt_at_name) {
                                hits[user.id] = [ user.name, user.screen_name ];
                            } else {
                                hits[user.id] = [ user.screen_name, user.screen_name ];
                            }
                        }
                  hit_count++;
                }
              }
        }
          if (hit_count >= 10) {
            return callback.call(context, hits);
        }
      }
  }
  if (hit_count < 2) {
    // 命中太少，则尝试获取最新的
    b_view.friendships.fetch_friends(current_user.uniqueKey, function (friends) {
      for (var i = 0, len = friends.length; i < len; i++) {
        user = friends[i];
        if (_check_name(user, query_regex)) {
                if (!hits[user.id]) {
                  if (config.rt_at_name) {
                    hits[user.id] = [ user.name, user.screen_name ];
                  } else {
                    hits[user.id] = [ user.screen_name, user.screen_name ];
                  }
                  hit_count++;
                  if (hit_count >= 10) {
                        break;
                    }
                }
              }
      }
      return callback.call(context, hits);
    });
  } else {
    return callback.call(context, hits);
  }
};

function removeUnreadTimelineCount(t, user_uniqueKey) {
  return;
  if (!user_uniqueKey) {
    user_uniqueKey = getUser().uniqueKey;
  }
  var unread = getUnreadTimelineCount(t, user_uniqueKey);
  if (unread && Settings.get().isSyncReadedCount) { // 如果同步未读数
    syncUnreadCountToSinaPage(t, user_uniqueKey);
  }
  localStorage.setObject(user_uniqueKey + t + UNREAD_TIMELINE_COUNT_KEY, 0);
  if (getAlertMode() === 'dnd') { //免打扰模式
    chrome.browserAction.setBadgeText({text: ''});
    chrome.browserAction.setIcon({path: 'icons/icon48-dnd.png'});
  } else {
    chrome.browserAction.setIcon({path: 'icons/icon48.png'});
    var total = 0;
    var userList = getUserList();
    for (var j = 0, jl = userList.length; j < jl; j++) {
      var user = userList[j], timelines = T_LIST[user.blogType];
      for (var i = 0, l = timelines.length; i < l; i++) {
        if (Settings.get().isSetBadgeText[timelines[i]]) {
          total += getUnreadTimelineCount(timelines[i], user.uniqueKey);
        }
      }
    }
    if (total > 0) {
      chrome.browserAction.setBadgeText({text: '' + total});
    } else {
      chrome.browserAction.setBadgeText({text: ''});
    }
  }
  chrome.browserAction.setTitle({title: getTooltip()});
}
exports.removeUnreadTimelineCount = removeUnreadTimelineCount;


