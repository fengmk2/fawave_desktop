/*!
 * fawave - main.js
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var EventEmitter = require('events').EventEmitter;
var weibo = require('weibo');
var i18n = require('./js/i18n');
var utils = require('./js/utils');
var User = require('./js/user');
var CONST = require('./js/const');
var setting = require('./js/setting');
var ui = require('./js/ui');
var inherits = require('util').inherits;
var format = require('weibo/lib/utils').format;
var Nodebox = require('./js/service').Nodebox;

// TODO: need to remove
var getUser = User.getUser;
var setUser = User.setUser;
var getUserList = User.getUserList;
var getUnreadTimelineCount = User.getUnreadTimelineCount;
var getUserByUniqueKey = User.getUserByUniqueKey;
var tapi = weibo;
var PAGE_SIZE = CONST.PAGE_SIZE;
var T_LIST = CONST.T_LIST;
var ActionCache = utils.ActionCache;
var removeUnreadTimelineCount = User.removeUnreadTimelineCount;
var buildStatusHtml = ui.buildStatusHtml;
var ShortenUrl = utils.ShortenUrl;
var showLoading = utils.showLoading;
var hideLoading = utils.hideLoading;
var unreadDes = CONST.unreadDes;
var popupBox = ui.popupBox;
var display_size = utils.display_size;

var fawave = {};
function getTimelineOffset(t) {
  return $("#" + t + "_timeline ul.list > li").length;
}

var POPUP_CACHE = {};
// 方便根据不同用户获取缓存数据的方法
function get_current_user_cache(cache, t) {
  var c_user = User.getUser();
  var key = c_user.uniqueKey;
  if (t) {
    key += '_' + t;
  }
  if (!cache) {
    cache = POPUP_CACHE;
  }
  var _cache = cache[key];
  if (!_cache) {
    _cache = {};
    cache[key] = _cache;
  }
  return _cache;
}

// var isNewTabSelected = window.is_new_win_popup ? true : false; // 如果是弹出窗，则激活新打开的标签

// selected => http://code.google.com/chrome/extensions/tabs.html#method-create
function openTab(url) {
  if (url) {
    url = url.trim();
  }
  if (!url || url.indexOf('javascript') === 0) {
    return false;
  }
  // window.open(url, '_blank');
  return true;
}

function StatusController() {
  this.events = [
    { events: 'mousedown', selecter: '.thumbnail_pic', handler: this.previewImage },
  ];
  StatusController.super_.call(this);
}
inherits(StatusController, Controller);

StatusController.prototype.previewImage = function (event) {
  var self = event.data.controller;
  var img = $(this);
  var originalURL = img.attr('original').trim();
  if (!originalURL) {
    return;
  }
  if (event.which === 3) { // 右键点击直接打开原图
    openTab(originalURL);
    this.oncontextmenu = function () { return false; };
    return false;
  } else if (event.which === 1) { // 左键点击查看图片
    if (img.find('.img_loading').length === 0) {
      img.append('<img class="img_loading" src="images/loading.gif" />');
    } else {
      img.find('.img_loading').show();
    }
    popupBox.showImg(img.attr('bmiddle'), originalURL, function () {
      img.find('.img_loading').hide();
    });
    return false;
  }
};

function initEvents() {
  $(document).delegate('a', 'click', function (event) {
    var $this = $(this);
    var url = $this.attr('href');
    var opened = openTab(url);
    if (opened) {
      event.preventDefault();
      return false;
    }
  }).delegate('a', 'mousedown', function (event) {
    if (event.which === 3) {
      var $this = $(this);
      var url = $this.attr('rhref') || $this.attr('href');
      var opened = openTab(url);
      if (opened) {
        // 禁用右键菜单
        this.oncontextmenu = function () {
          return false;
        };
        return false;
      }
    }
  });

  // 注册 查看原始围脖的按钮事件
  $(document).delegate('.show_source_status_btn', 'click', function (event) {
    var $this = $(this);
    var user = User.getUser();
    var t = getCurrentTab().replace('#', '').replace(/_timeline$/i, '');
    var params = {id: $(this).attr('status_id'), user: user};
    $this.hide();
    tapi.status_show(params, function (data) {
      if (data && data.id) {
        var html = buildStatusHtml([data], t, user).join('');
        $this.parents('.mainContent').after(html);
        // 处理缩址
        ShortenUrl.expandAll();
      } else {
        $this.show();
      }
    });
  });
}

function init() {
  var c_user = User.getUser();
  if (!c_user) {
    window.location = 'options.html#user_set';
    // window.open('options.html#user_set', '_blank');
    // window.open('options.html', '_blank');
    // chrome.tabs.create({url: 'options.html#user_set'});
    return;
  }
  
  // initEvents();

  // changeAlertMode(setting.getAlertMode());
  // changeAutoInsertMode(setting.getAutoInsertMode());

  // $('#ye_dialog_close').click(function () {
  //   hideReplyInput();
  // });
  
  // initTabs();
  // initTxtContentEven();

  // initChangeUserList();
  
  // 显示上次打开的tab
  // var last_data_type = getBackgroundView().get_last_data_type(c_user.uniqueKey) || 'friends_timeline';
  // var last_data_type = 'friends_timeline';
  // _change_tab(last_data_type);
  
  // addUnreadCountToTabs();
  // initIamDoing();

  // initScrollPaging();
  
  // support @ autocomplete
  // at_user_autocomplete("#txtContent", false, function () {
  //   // 计数
  //   countInputText();
  // });
  // at_user_autocomplete("#replyTextarea", false, function () {
  //   countReplyText();
  // });
  // at_user_autocomplete("#direct_message_user", true, function (user) {
  //   // 选中则发私信
  //   doNewMessage($("#direct_message_user").get(0), user.screen_name, user.id);
  // });
  
  // adShow();
  
  // restoreActionCache();
  
  // 绑定缩短网址事件
  // var $urlshorten_span = $("#urlShortenInp").parent();
  // if ($urlshorten_span.length > 0) {
  //   $urlshorten_span.mouseenter(function () {
  //     $("#urlShortenInp").addClass('long').select();
  //   }).mouseleave(function () {
  //     $("#urlShortenInp").removeClass('long');
  //   }).keypress(function (event) {
  //     if (event.which === 13) {
  //       addShortenUrl();
  //     }
  //   });
  // }

  // 评论是否带上原评论
  // $("#chk_originalComment, #txt_originalComment").hide();
  // $("#chk_originalComment").click(function () {
  //   if ($(this).attr("checked")) {
  //     localStorage.setObject(INCLUDE_ORIGINAL_COMMENT, 1);
  //   } else {
  //     localStorage.setObject(INCLUDE_ORIGINAL_COMMENT, "");
  //   }
  //   var action_args = ActionCache.get('doComment');
  //   if (action_args) {
  //     $('#replyTextarea').val('');
  //     action_args[0] = window._currentCommentElement;
  //     window.doComment.apply(this, action_args);
  //   }
  // });
  
  // $(window).unload(function () {
  //   initOnUnload();
  // }); 
  
  //google map api，为了不卡，最后才载入
  // var script = document.createElement("script"); 
  // script.type = "text/javascript"; 
  // script.src = "http://maps.google.com/maps/api/js?sensor=false&callback=initializeMap"; 
  // document.body.appendChild(script);
}

var currentTab = '#friends_timeline_timeline';

function _get_clipboard_file(e, callback) {
  var f = null, items = e.clipboardData && e.clipboardData.items;
  items = items || [];
  for (var i = 0; i < items.length; i++) {
    if (items[i].kind === 'file') {
      f = items[i].getAsFile();
      break;
    }
  }
  if (f) {
    var reader = new FileReader();
    reader.onload = function (event) {
      callback(f, event.target.result);
    };
    reader.readAsDataURL(f);
  } else {
    callback();
  }
}

function _init_image_preview(image_src, size, preview_id, btn_id, top_padding, left_padding) {
  $("#" + preview_id + " .img").html('<img class="pic" src="' + image_src + '" />');
  left_padding = left_padding || -30;
  top_padding = top_padding || 20;
  var offset = $('#' + btn_id).offset();
  $("#" + preview_id).data('uploading', false).css({
    left: offset.left + left_padding, 
    top: offset.top + top_padding
  }).show()
  .find('.loading_bar div').css({'border-left-width': '0px'})
  .find('span').html(display_size(size));
}

function TextContentController() {
  // status content
  this.$textContent = $('#txtContent');
  this.$textContent.on('keydown', { controller: this, action: this.send.bind(this) }, this.keypress)
    .on('input focus', { controller: this }, this.count);
  this.$textContent[0].onpaste = this.paste;

  $('#btnSend').click(this.send.bind(this));
  $('#btnClearText').click(this.clearText.bind(this));
  $('#show_status_input').on('click', { controller: this }, this.toggleTextInput);

  // reply
  this.$replyText = $("#replyTextarea");
  this.$replyText.on('keydown', {
    controller: this,
    action: this.sendReply.bind(this),
    close: function () {
      $('.close_dialog:first').click();
    }
  }, this.keypress)
    .on('input focus', { controller: this }, this.count);
  $("#replySubmit").click(this.sendReply.bind(this));
  $('.close_dialog').click(this.hideReply);
  this.$replyText[0].onpaste = this.pasteOnReply;

  this.loadStates();
}

TextContentController.prototype.hideReply = function (event) {
  var dialog = $('#ye_dialog_window');
  fawave.face.hide();
  dialog.hide();
  dialog.find('input[type="hidden"], input[type="checkbox"], textarea').val('');
  window.imgForUpload_reply = null;
  $('#upImgPreview_reply').hide().find('.img').html('');
  // 隐藏带上原评论选项
  $("#chk_originalComment, #txt_originalComment").hide();
  cleanActionCache();
};

TextContentController.prototype.loadStates = function () {
  var unsendText = localStorage.getObject(CONST.UNSEND_TWEET_KEY);
  if (unsendText) {
    this.$textContent.val(unsendText);
  }

  var unsendReply = localStorage.getObject(CONST.UNSEND_REPLY_KEY);
  if (unsendReply) {
    this.$replyText.val(unsendReply);
  }
};

TextContentController.prototype.paste = function (event) {
  _get_clipboard_file(event, function (file, image) {
    if (file) {
      window.imgForUpload = file;
      window.imgForUpload.fileName = 'fawave.png';
      _init_image_preview(image, file.size, 'upImgPreview', 'btnUploadPic');
    }
  });
};

TextContentController.prototype.pasteOnReply = function (event) {
  _get_clipboard_file(event, function (file, image) {
    if (file) {
      window.imgForUpload_reply = file;
      window.imgForUpload_reply.fileName = 'fawave_reply.png';
      _init_image_preview(image, file.size, 'upImgPreview_reply', 'btnAddReplyEmotional', 60);
    }
  });
};

TextContentController.prototype.toggleTextInput = function (event) {
  var self = event.data.controller;
  if ($("#submitWarp").data('status') !== 'show') {
    self.showTextInput();
    if (window.imgForUpload) {
      setTimeout(function () {
        $("#upImgPreview").show();
      }, 500);
    }
  } else {
    $("#upImgPreview").hide();
    self.hideTextInput();
  }
};

TextContentController.prototype.showTextInput = function () {
  var $submitWarp = $("#submitWarp");
  if ($submitWarp.data('status') !== 'show') {
    initSelectSendAccounts();
    var h_submitWrap = $submitWarp.find(".w").height();
    var h = window.innerHeight - 70 - h_submitWrap;
    $(".list_warp").css('height', h);
    $submitWarp.data('status', 'show').css('height', h_submitWrap);
    $("#header .write").addClass('active').find('b').addClass('up');
    $("#doing").appendTo('#doingWarp');
    ActionCache.set('showMsgInput', []);
  }
  var $text = $("#txtContent");
  var value = $text.val();
  $text.focus().val('').val(value); //光标在最后面
  countInputText();
};

TextContentController.prototype.hideTextInput = function () {
  fawave.face.hide();
  var h = window.innerHeight - 70;
  $(".list_warp").css('height', h);
  $("#submitWarp").data('status', 'hide').css('height', 0);
  $("#header .write").removeClass('active').find('b').removeClass('up');
  $("#doing").prependTo('#tl_tabs .btns');
  ActionCache.set('showMsgInput', null);
};

TextContentController.prototype.send = function () {
  var text = this.$textContent.val().trim();
  if (!text) {
    showMsg(i18n.get("msg_need_content"));
  }
  sendMsg(text);
};

TextContentController.prototype.sendReply = function () {
  sendMsgByActionType(this.$replyText.val().trim());
};

TextContentController.prototype.clearText = function () {
  this.$textContent.val('').focus();
};

TextContentController.prototype.keypress = function (event) {
  // ctrl + enter || cmd + enter || alt + s
  if (((event.ctrlKey || event.metaKey) && event.keyCode === 13) || (event.altKey && event.which === 83)) {
    event.data.action();
    return false;
  }
  if (event.which === 27) {
    // esc, close
    event.data.close && event.data.close();
  }
};

TextContentController.prototype.count = function (event) {
  var input = $(this);
  var value = input.val();
  var max_length = parseInt(input.data('max_text_length'), 10) || 140;
  var len = max_length - (input.data('support_double_char') ? value.len() : value.length);
  // return [value, len, max_length];

  var values = _countText('txtContent', 'wordCount');
  if (len === max_length) {
    $("#btnSend").attr('disabled', 'disabled');
  } else {
    $("#btnSend").removeAttr('disabled');
  }
  var text = value;
  var wlength = text.len();
  $('#wordCount_double').html(140 - wlength);
  $('#wordCount').html(values[1]);
};

function sendMsgByActionType(c) { // c:要发送的内容
  if (!c) {
    return ui.showTips(i18n.get("msg_need_content"));
  }
  $("#replySubmit, #replyTextarea").attr('disabled', true);
  if (window.imgForUpload_reply) {
    // 增加图片链接
    Nodebox.upload({}, window.imgForUpload_reply, function (err, info) {
      if (info && (info.link || info.url)) {
        var picurl = info.link || info.url;
        if ($('#repostTweetId').val()) {
          // repost
          c = picurl + ' ' + c; // 图片放前面
        } else {
          c += ' ' + picurl;
        }
      }
      __sendMsgByActionType(c);
    }, function (rpe) {
      // progress
      var $loading_bar = $('#upImgPreview_reply .loading_bar');
      var html = display_size(rpe.loaded) + "/" + display_size(rpe.total);
      var width = parseInt((rpe.loaded / rpe.total) * $loading_bar.width(), 10);
      $loading_bar.find('div').css({'border-left-width': width + 'px'}).find('span').html(html);
    });
  } else {
    __sendMsgByActionType(c);
  }
}

function __sendMsgByActionType(c) {
  var actionType = $('#actionType').val();
  switch (actionType) {
  case 'newmsg': // 私信
    sendWhisper(c);
    break;
  case 'repost': // 转
    sendRepost(c);
    break;
  case 'comment': // 评
    sendComment(c);
    break;
  case 'reply': // @
    sendReplyMsg(c);
    break;
  default:
    ui.showTips('Wrong Send Type');
    $("#replySubmit, #replyTextarea").attr('disabled', false);
    break;
  }
}

// return text, left_length, max_length
function _countText(text_id) {
  var $text = $("#" + text_id);
  var value = $text.val();
  var max_length = parseInt($text.data('max_text_length'), 10) || 140;
  var len = max_length - ($text.data('support_double_char') ? value.len() : value.length);
  return [value, len, max_length];
}

function countReplyText(){
    var values = _countText('replyTextarea'), len = values[1], html = null;
    if (window.imgForUpload_reply) {
        // 有图片，则自动增加20字符
        len -= 20;
    }
    if(len > 0){
        html = i18n.get("msg_word_count").format({len: len});
    }else{
        html = '(<em style="color:red;">'+ i18n.get("msg_word_overstep").format({len:len}) +'</em>)';
    }
    $('#replyInputCount').html(html);
}


// 封装重用的判断是否需要自动缩址的逻辑
function _shortenUrl(longurl, settings, callback) {
    if (longurl.indexOf('chrome-extension://') === 0) { // 插件地址就不处理了
        return;
    }
    settings = settings || setting.Settings.get();
    if (settings.isSharedUrlAutoShort && 
        longurl.replace(/^https?:\/\//i, '').length > settings.sharedUrlAutoShortWordCount) {
        ShortenUrl.short(longurl, callback);
    }
}

// 添加缩短url
function addShortenUrl() {
    var $btn = $("#urlShortenBtn");
    var status = $btn.data('status');
    switch (status) {
        case 'shorting':
            showMsg(i18n.get("msg_shorting_and_wait"));
            break;
        default:
            var $text = $("#urlShortenInp");
            var long_url = $text.addClass('long').val();
            if(!long_url) {
                $text.focus();
                return;
            }
            $btn.data('status', 'shorting');
            $text.val(i18n.get("msg_shorting")).attr('disabled', true);
            ShortenUrl.short(long_url, function(shorturl){
                if(shorturl){
                    var $content = $("#txtContent");
                    $content.val($content.val() + ' ' + shorturl + ' ');
                    $text.val('');
                }else{
                    showMsg(i18n.get("msg_shorten_fail"));
                    $text.val(long_url);
                }
                $btn.data('status', null);
                $text.removeAttr('disabled');
            });
            break;
    }
}

//我正在看
function initIamDoing() {
    function shareDoing(capture) {
        return function () {
            var params = decodeForm(window.location.search);
            if (params.windowId) {
                params.windowId = parseInt(params.windowId, 10);
            }
            chrome.tabs.getSelected(params.windowId, function (tab) {
                var loc_url = tab.url;
                if(loc_url){
                    var title = tab.title || '';
                    var $txt = $("#txtContent");
                    var value = $txt.val();
                    if(value) {
                        value += ' ';
                    }
                    var settings = setting.Settings.get();
                    $txt.val(value + formatText(settings.lookingTemplate, {title: title, url: loc_url}))
                        .data({source_url: '', short_url: ''});
                    showMsgInput();
                    _shortenUrl(loc_url, settings, function(shorturl){
                        if(shorturl) {
                            $txt.val($txt.val().replace(loc_url, shorturl))
                                .data({source_url: loc_url, short_url: shorturl}); // 记录下原始url
                            countInputText();
                        }
                    });
                    if(capture) {
                        chrome.tabs.captureVisibleTab(tab.windowId, {format: 'png'}, function(dataurl) {
                            var file = window.imgForUpload = dataUrlToBlob(dataurl);
                            _init_image_preview(dataurl, file.size, 'upImgPreview', 'btnUploadPic');
                        });
                    }
                } else {
                    showMsg(i18n.get("msg_wrong_page_url"));
                }
            });
        };
    }
    $("#doing").click(shareDoing(false));
    // 分享正在查看，并带上截图
    $("#doingWithCapture").click(shareDoing(true));
}

function setUserTimelineParams(params) {
  var user = User.getUser();
  // var bg = getBackgroundView();
  var key = '__LastUserTimelineParams_' + user.blogType;
  // bg[key] = params;
}

function getUserTimelineParams() {
  var user = User.getUser();
  // var bg = getBackgroundView();
  var key = '__LastUserTimelineParams_' + user.blogType;
  // return bg[key];
}

// 搜索
var Search = {
    current_search: '', // 默认当前搜索类型 search, search_user
    current_keyword: '',
    toggleInput: function(ele) {
        $('.searchWrap').hide();
        var $search_wrap = $(ele).nextAll('.searchWrap');
        var search_type = $search_wrap.hasClass('searchUserWrap') ? 'search_user' : 'search';
        if (search_type === Search.current_search) {
            Search.current_search = '';
            return;
        }
        Search.current_search = search_type;
        $search_wrap.toggle();
        var $text = $search_wrap.find(".txtSearch").focus().keyup(function (event) {
            Search.current_keyword = $(this).val();
            if (event.keyCode === 13) {
                Search.search();
            }
        });
        Search.current_keyword = $text.val();
    },
    search: function (read_more) {
        var c_user = User.getUser();
        var q = $.trim(Search.current_keyword);
        if (!q) {
            return;
        }
        // http://www.google.com/search?q=twitter&source=fawave&tbs=mbl:1
        // if(c_user.blogType == 'twitter') {
        //      chrome.tabs.create({url: 'http://www.google.com/search?q=' + q + '&source=fawave&tbs=mbl:1', selected: false});
        //   return;
        //  }
        var $tab = $("#tl_tabs .tab-user_timeline");
        $tab.attr('statusType', 'search');

        var $ul = $("#user_timeline_timeline ul.list");
        var max_id = null;
        var page = 1;
        var cursor = null;
        var config = tapi.get_config(c_user);
        var support_search_max_id = config.support_search_max_id;
        var support_cursor_only = config.support_cursor_only;
        if (read_more) {
            // 滚动的话，获取上次的参数
            max_id = $tab.attr('max_id');
            cursor = $tab.attr('cursor');
            page = Number($tab.attr('page') || 1);
        }  else {
            // 第一次搜索
            $ul.html('');
        }
        var params = { count: CONST.PAGE_SIZE, q: q, user: c_user };
        if (support_cursor_only) { // 只支持cursor方式分页
            if (cursor) {
                params.cursor = cursor;
            }
        } else {
            if (support_search_max_id) {
                if (max_id) {
                    params.max_id = max_id;
                }
            } else {
                params.page = page;
            }
        }
        showLoading();
        var timeline_type = 'user_timeline';
        var method = 'search';
        var data_type = 'status';
        if (Search.current_search === 'search_user') {
            method = 'user_search';
            data_type = 'user';
        }
        setUserTimelineParams({
            type: method,
            q: q
        });
        hideReadMore(timeline_type);
        tapi[method](params, function (data, textStatus) {
            hideLoading();
            hideReadMoreLoading(timeline_type);
            // 如果用户已经切换，则不处理
            var now_user = getUser();
            if (now_user.uniqueKey !== c_user.uniqueKey) {
                return;
            }
            var statuses = data.results || data.items || data;
            if (!statuses) { // 异常
                return;
            }
            if (data.next_cursor !== undefined) {
                $tab.attr('cursor', data.next_cursor);
            }
            if (statuses.length > 0){
                var c_tb = getCurrentTab();
                var want_tab = "#" + timeline_type + "_timeline";
                if (c_tb !== want_tab) {
                    //添加当前激活的状态
                    $tab.siblings().removeClass('active').end().addClass('active');
                    //切换tab前先保护滚动条位置
                    var old_t = c_tb.replace('#','').replace(/_timeline$/i,'');
                    saveScrollTop(old_t);
                    //切换tab
                    $('.list_p').hide();
                    
                    $(want_tab).show();
                    $ul.html('');

                    currentTab = want_tab;
                }
                statuses = addPageMsgs(statuses, timeline_type, true, data_type);
                // 保存数据，用于翻页
                $tab.attr('page', page + 1);
            }
            if (statuses.length >= PAGE_SIZE / 2) {
                max_id = data.max_id || String(statuses[statuses.length - 1].id);
                $tab.attr('max_id', max_id);
                showReadMore(timeline_type);
            } else {
                hideReadMore(timeline_type, true); //没有分页了
            }
            checkShowGototop();
        });
    }
};

//隐藏那些不支持的Timeline Tab
function checkSupportedTabs(user) {
  if (!user) {
    user = getUser();
  }
  var config = tapi.get_config(user);
  var checks = {
    support_comment: ['#tl_tabs .tab-comments_timeline, #comments_timeline_timeline', // 需要隐藏的
                      '#tl_tabs .tab-comments_timeline'], // 需要显示的
    support_favorites: ['#tl_tabs .tab-favorites, #favorites_timeline',
                        '#tl_tabs .tab-favorites'],
    support_direct_messages: ['#tl_tabs .tab-direct_messages, #direct_messages_timeline',
                        '#tl_tabs .tab-direct_messages'],
    support_mentions: ['#tl_tabs .tab-mentions, #mentions_timeline',
                        '#tl_tabs .tab-mentions'],
    support_comments_mentions: ['#tl_tabs .tab-comments_mentions, #comments_mentions_timeline',
                        '#tl_tabs .tab-comments_mentions'],
    support_search: ['.search_span', '.search_span'],
    support_user_search: ['.user_search_span', '.user_search_span'],
    support_followers: ['#tl_tabs .tab-followers, #followers_timeline',
                        '#tl_tabs .tab-followers'],
  };
  for (var key in checks) {
    if (!config[key]) {
      $(checks[key][0]).hide();
    } else {
      $(checks[key][1]).show();
    }
  }
  // 如果是buzz，则隐藏评论tab，但是它可以评论
  if (user.blogType === 'buzz') {
    $('#tl_tabs .tab-comments_timeline, #comments_timeline_timeline').hide();
  }
}

// 初始化用户选择视图
function initSelectSendAccounts() {
    var settings = setting.Settings.get();
    var afs = $("#accountsForSend");
    var c_user = getUser();
    if (afs.data('inited')) {
        if(settings.sendAccountsDefaultSelected === 'current' && afs.find('li.sel').length < 2){
            afs.find('li').removeClass('sel');
            $("#accountsForSend li[uniqueKey='" + c_user.uniqueKey +"']").addClass('sel');
        }
        shineSelectedSendAccounts(afs.find('li.sel'));
        return;
    }
    var userList = getUserList('send');
    if (userList.length < 2) { return; } //多个用户才显示
    var li_tpl = '<li class="{{sel}}" uniqueKey="{{uniqueKey}}" blogType="{{blogType}}" onclick="toggleSelectSendAccount(this)">' +
        '<img src="{{profile_image_url}}" />' +
        '{{screen_name}}' +
        '<img src="images/blogs/{{blogType}}_16.png" class="blogType" /></li>';
    var li = [];
    var has_sina = false, has_other = false;
    for (var i = 0, len = userList.length; i < len; i++) {
        var user = userList[i];
        user.sel = '';
        var is_sina = user.blogType === 'tsina';
        if(!has_sina && is_sina) {
            has_sina = true;
        }
        if(!has_other && !is_sina) {
            has_other = true;
        }
        switch(settings.sendAccountsDefaultSelected){
            case 'all':
                user.sel = 'sel';
                break;
            case 'current':
                if (user.uniqueKey === c_user.uniqueKey) {
                    user.sel = 'sel';
                }
                break;
            case 'remember':
                var lastSend = getLastSendAccounts();
                if(lastSend && lastSend.indexOf('_'+ user.uniqueKey + '_') >= 0){
                    user.sel = 'sel';
                }
                break;
            default:
                break;
        }
        li.push(li_tpl.format(user));
    }
    if(has_sina && has_other) {
        // 只有同时有新浪微博和其他类型，才显示保留数据的选项
        var $keep_data_btn = $('<span id="remember_send_data_ctr"><input type="checkbox" id="remember_send_data" /><label for="remember_send_data">' 
            + i18n.get("abb_keep_send_data") + '</label></span>');
        var $sendBtn = $('#btnSend');
        $sendBtn.before($keep_data_btn.css({right: ($sendBtn.width() + 30) + 'px'}));
    }
    afs.html('TO(<a class="all" href="javascript:" onclick="toggleSelectAllSendAccount()">' + i18n.get("abb_all") +'</a>): ' + li.join(''));
    afs.data('inited', 'true');
    shineSelectedSendAccounts();
}

function shineSelectedSendAccounts(sels) {
    if (!sels){
        sels = $("#accountsForSend li.sel");
    }
    sels.css('-webkit-transition', 'none').removeClass('sel');
    function _highlightSels(){
        sels.css('-webkit-transition', 'all 0.8s ease').addClass('sel');
    }
    setTimeout(_highlightSels, 150);
}

function toggleSelectSendAccount(ele){
    var _t = $(ele);
    var is_tsina = (_t.attr('blogType') || 'tsina') === 'tsina';
    if(_t.hasClass('sel')){
        _t.removeClass('sel');
    }else{
        var settings = setting.Settings.get();
        if(false && settings.__allow_select_all !== true) {
            if(is_tsina) {
                _t.siblings().each(function() {
                    var $this = $(this);
                    if($this.attr('blogType') !== 'tsina') {
                        $this.removeClass('sel');
                    }
                });
             } else {
                 _t.siblings().each(function() {
                     var $this = $(this);
                     if($this.attr('blogType') === 'tsina') {
                         $this.removeClass('sel');
                     }
                 });
             }
        }
        _t.addClass('sel');
    }
}

function toggleSelectAllSendAccount() {
    var $selected = $("#accountsForSend .sel");
    if($selected.length === 0) {
        $selected = $("#accountsForSend li[uniqueKey=" + getUser().uniqueKey +"]");
    }
    var $sinas = $('#accountsForSend li[blogType="tsina"]');
    var $others = $('#accountsForSend li[blogType!="tsina"]');
    var is_tsina = $selected.attr('blogType') === 'tsina';
    if(is_tsina) {
        if($selected.length < $sinas.length) {
            return $sinas.addClass('sel') && $others.removeClass('sel');
        }
        if($others.length > 0) {
            return $sinas.removeClass('sel') && $others.addClass('sel');
        }
    }
    if($selected.length < $others.length) {
        return $sinas.removeClass('sel') && $others.addClass('sel');
    }
    $("#accountsForSend li").removeClass('sel');
    var c_user = getUser();
    $("#accountsForSend li[uniqueKey=" + c_user.uniqueKey +"]").addClass('sel');
}
// <<-- 多用户 END

// 用户关系：跟随、取消跟随
function f_create(user_id, ele, screen_name) {
  var $ele = $(ele);
  $ele.hide();
  showLoading();
  var b_view = getBackgroundView();
  b_view.friendships.create(user_id, screen_name, function (user_info, textStatus, statuCode) {
    if (!user_info){
      $ele.show();
    } else {
      $ele.parent().find('.follow_button_destroy').show();
    }
  });
}

function f_destroy(user_id, ele, screen_name) {
  var $ele = $(ele);
  $ele.hide();
  showLoading();
  var b_view = getBackgroundView();
  b_view.friendships.destroy(user_id, screen_name, function (user_info, textStatus, statuCode) {
    if (!user_info){
      $ele.show();
    } else {
      var $parent = $ele.parent();
      $parent.find('.followed').hide();
      $parent.find('.follow_button_create').show();
    }
  });
}
//====>>>>>>>>>>>>>>>>>>>>>>

// 显示粉丝列表
function showFollowers(to_t, screen_name, user_id) {
  //添加当前激活的状态
  $t = $('#tl_tabs .tab-followers');
  $t.siblings().removeClass('active').end().addClass('active');
  //切换tab
  $('.list_p').hide();
  $($t.attr('href')).show();
  to_t = to_t || $("#fans_tab .active").attr('t');
  if (screen_name) {
    $('#followers_timeline').attr('screen_name', screen_name);
  } else {
    $('#followers_timeline').removeAttr('screen_name');
  }
  if (user_id) {
    $('#followers_timeline').attr('user_id', user_id);
  } else {
    $('#followers_timeline').removeAttr('user_id');
  }
  $("#fans_tab span").unbind('click').click(function () {
    _getFansList($(this).attr('t'));
  }).each(function () {
    var $this = $(this);
    $this.removeAttr('loading');
    $this.removeAttr('cursor'); // 删除游标
    if ($this.attr('t') === to_t) {
      $this.click();
    }
  });
  var html_cache = get_current_user_cache(FANS_HTML_CACHE);
  for (var k in html_cache) {
    delete html_cache[k];
  }
}

/*
* 粉丝列表
*/
var NEXT_CURSOR = {};
var FANS_HTML_CACHE = {};
//获取用户的粉丝列表
function _getFansList(to_t, read_more) {
    to_t = to_t || $("#fans_tab .active").attr('t');
    var c_user = getUser();
    if(!c_user){
        return;
    }
    var $followers_timeline = $('#followers_timeline');
    var screen_name = $followers_timeline.attr('screen_name');
    var user_id = $followers_timeline.attr('user_id');
    var get_c_user_fans = false;
    if(screen_name === undefined) {
        screen_name = c_user.screen_name;
        user_id = c_user.id;
        get_c_user_fans = true;
        $("#fans_tab span font").html(i18n.get("comm_my"));
    }
    if(!get_c_user_fans) {
        $("#fans_tab span font").html(screen_name + i18n.get("comm_de"));
    }
    var params = {user:c_user, count:PAGE_SIZE, screen_name: screen_name};
    if(user_id) {
        params.user_id = user_id;
    }
    var $list = $("#followers_timeline .list");
    var $active_t = $("#fans_tab .active");
    var active_t = $active_t.attr('t');
    var $to_t = $("#fans_tab .tab_" + to_t);
    var cursor = $to_t.attr('cursor') || '-1';
    var last_user = $followers_timeline.attr('last_user');
    if (c_user.uniqueKey !== last_user) { // 用户切换了
        cursor = '-1';
    }
    $followers_timeline.attr('last_user', c_user.uniqueKey);
    // 各微博自己cache
    var html_cache = get_current_user_cache(FANS_HTML_CACHE);
    if($to_t.attr('loading') !== undefined) {
        return;
    }
    if (!read_more) { // 点击tab
        if(active_t !== to_t) { // 切换
            html_cache[active_t] = $list.html();
            $("#fans_tab span").removeClass('active');
            $to_t.addClass('active');
            if(html_cache[to_t]) {
                $list.html(html_cache[to_t]);
                return;
            }
        } else if (cursor != '-1') { // 点击当前tab
            return;
        }
        cursor = '-1';
        $list.html('');
    }
    if (cursor == '0') {
        hideReadMore(to_t, true);
        return;
    }
    params.cursor = cursor;
    hideReadMore(to_t);
    currentTab = to_t;
    showLoading();
    $to_t.attr('loading', true);
//    log(c_user.uniqueKey + ': ' + cursor + ' ' + read_more);
    tapi[to_t](params, function(data, textStatus, statuCode){
        // 如果用户已经切换，则不处理
        var now_user = getUser();
        if (now_user.uniqueKey !== c_user.uniqueKey) {
            return;
        }
        if(data){
            var users = data.users || data.items || data;
            var next_cursor = data.next_cursor;
//            log(c_user.uniqueKey + ': next_cursor ' + next_cursor);
            var $last_item = $("#followers_timeline ul.list .user_info:last");
            var max_id = $last_item.attr('did');
            var result = utils.filterDatasByMaxId(users, max_id, true);
            users = result.news;
            if(users && users.length > 0) {
                var html = '';
                for(var i in users){
                    if(!get_c_user_fans) {
                        // 查看其他用的粉丝，无法判断关系，全部默认为未关注
                        users[i].unfollow = true;
                    }
                }
                html = buildUsersHtml(users, to_t).join('');
                if (to_t === $("#fans_tab .active").attr('t')) {
                    // 还是当前页
                    $list.append(html);
                }
                html_cache[to_t] += html;
            }
            if(users && users.length > 0) {
                showReadMore(to_t);
            } else {
                hideReadMore(to_t, true);
            }
            // 设置游标，控制翻页
            if(next_cursor !== undefined) {
                $to_t.attr('cursor', next_cursor);
            }
        } else {
            // 异常
            showReadMore(to_t);
        }
        $to_t.removeAttr('loading');
    });
}

// 获取用户收藏
var FAVORITE_HTML_CACHE = {};
function getFavorites(is_click) {
  var c_user = getUser();
  if (!c_user) {
    return;
  }
  var list = $("#favorites_timeline .list");
  var cursor = list.attr('cursor');
  var max_id = list.attr('max_id');
  var page = list.attr('page');
  var t = 'favorites';
  var user_cache = get_current_user_cache();
  var config = tapi.get_config(c_user);
  var support_cursor_only = config.support_cursor_only; // 只支持游标方式翻页
  if (!is_click) {
    is_click = support_cursor_only ? !cursor : !page;
  }
  if (is_click) { // 点击或第一次加载
    if (user_cache[t]) {
      list.html(user_cache[t]);
      return;
    } else {
      list.html('');
      page = 1;
    }
  }
  var params = {count: CONST.PAGE_SIZE};
  var support_favorites_max_id = config.support_favorites_max_id; // 支持max_id方式翻页
  if (!is_click) {
    if (support_cursor_only) {
      if (String(cursor) === '0') {
        return;
      }
      if (cursor) {
        params.cursor = cursor;
      }
    } else if (support_favorites_max_id) { // 163
      if (max_id) {
        params.max_id = max_id;
      }
    } else {
      if (page) {
        params.page = page;
      }
    }
  }
  showLoading();
  hideReadMore(t);
  tapi[t](c_user, params, function (err, result) {
    if (err) {
      console.error(err);
      showReadMore(t);
      return;
    }
    if (c_user.uniqueKey !== getUser().uniqueKey) {
      showReadMore(t);
      return;
    }
    var favorites = result.items;
    var statuses = [];
    for (var i = 0; i < favorites.length; i++) {
      var item = favorites[i];
      item.status.favorited_at = item.created_at;
      statuses.push(item.status);
    }
    // if (data.next_cursor >= 0) {
    //   list.attr('cursor', data.next_cursor);
    // }
    list.attr('page', Number(page) + 1);
    statuses = addPageMsgs(statuses, t, true);
    if (statuses.length > 0){
      var index = statuses.length - 1;
      list.attr('max_id', statuses[index].id);
      showReadMore(t);
      user_cache[t] = list.html();
    } else {
      hideReadMore(t, true);
    }
  });
}

function CommentListController() {
  this.events = [
    { events: 'click', selecter: '.commentCounts a', handler: this.show },
    { events: 'click', selecter: '.comment_hide_list_btn', handler: this.hide },
    { events: 'click', selecter: '.comments .pre_page', handler: this.prevPage },
    { events: 'click', selecter: '.comments .next_page', handler: this.nextPage },
  ];
  CommentListController.super_.call(this);
}
inherits(CommentListController, Controller);

CommentListController.prototype.hide = function (event) {
  var btn = $(this);
  btn.closest('.comments').hide();
};

CommentListController.prototype.show = function (event) {
  var btn = $(this);
  var self = event.data.controller;
  var wrap = btn.closest('.commentWrap').find('.comments');
  self.showPage(wrap, 'first');
}

CommentListController.prototype.prevPage = function (event) {
  var btn = $(this);
  var self = event.data.controller;
  var wrap = btn.parents('.comments');
  self.showPage(wrap, 'prev');
};

CommentListController.prototype.nextPage = function (event) {
  var btn = $(this);
  var self = event.data.controller;
  var wrap = btn.parents('.comments');
  self.showPage(wrap, 'next');
};

CommentListController.prototype.showPage = function (wrap, action) {
  var sid = wrap.data('id');
  var user = User.getUser();
  var list = wrap.find('.comment_list');
  var params = {
    count: CONST.COMMENT_PAGE_SIZE
  };
  if (action === 'next') {
    var max_id = wrap.data('max_id');
    var max_time = wrap.data('max_time');
    if (max_id) {
      params.max_id = max_id;
      if (max_time) {
        params.max_time = max_time;
      }
    }
  } else if (action === 'prev') {
    var since_id = wrap.data('since_id');
    var since_time = wrap.data('since_time');
    if (since_id) {
      params.since_id = since_id;
      if (since_time) {
        params.since_time = since_time;
      }
    }
  }
  console.log(sid + ' params: ' + JSON.stringify(params));
  var loading = $('#loading').show();
  weibo.comments(user, sid, params, function (err, result) {
    loading.hide();
    if (err) {
      return ui.showErrorTips(err);
    }
    var nextBtn = wrap.find('.next_page');
    var preBtn = wrap.find('.pre_page');
    var comments = result.items;
    if (comments.length === 0) {
      if (action === 'next') {
        nextBtn.hide();
      } else if (action === 'prev') {
        preBtn.hide();
      }
      return ui.showTips('没有了');
    }
    var html = '';
    for (var i = 0; i < comments.length; i++) {
      html += ui.buildComment(user, comments[i]);
    }
    list.html(html);
    nextBtn.show();
    preBtn.show();
    if (action === 'first') {
      preBtn.hide();
    }
    wrap.show();
    var first = comments[0];
    wrap.data('since_id', first.id);
    if (first.timestamp) {
      wrap.data('since_time', first.timestamp);
    }
    var last = comments[comments.length - 1];
    wrap.data('max_id', last.id);
    if (last.timestamp) {
      wrap.data('max_time', last.timestamp);
    }
  });
}

//======>>>>>>> 查看评论 / 转发列表 <<<<<<<
//@ele: 触发该事件的元素, 如果ele的timeline_type == 'repost'，则代表是转发列表
//@tweetId: 微博ID
//@page: 分页
//@notHide: 不要隐藏评论列表
function showComments(ele, tweetId, page, notHide, page_params){
  if (!tweetId) {
    return;
  }
  var $ele = $(ele);
  // 获取status的screen_name
  var comment_p = $ele.closest('.commentWrap');
  var $user_info = comment_p.find('.userName a:first');
  var screen_name = $user_info.attr('user_screen_name');
  var user_id = $user_info.attr('user_id');
  
  var commentWrap = comment_p.children('.comments');
  var $comment_list = commentWrap.children('.comment_list');
  var current_type = comment_p.attr('timeline_type') || 'comment';
  var timeline_type = $ele.attr('timeline_type') || current_type;
  if (current_type !== timeline_type) {
      // 切换，清空目前的数据
      commentWrap.hide();
      $comment_list.html('');
      comment_p.attr('timeline_type', timeline_type);
  }
  if (!notHide && commentWrap.css('display') !== 'none'){
      commentWrap.hide();
      return;
  } else if(!notHide && $comment_list.html()){
      commentWrap.show();
      return;
  }
  var hide_btn_text = timeline_type === 'comment' ? 
    i18n.get("btn_hide_comments") : i18n.get("btn_hide_repost_timeline");
  commentWrap.find('.comment_hide_list_btn').html(hide_btn_text);
  showLoading();
  var user = getUser();
  var params = {id:tweetId, count:CONST.COMMENT_PAGE_SIZE, user:user};
  if(page) {
      if(page_params) {
          for(var k in page_params) {
              params[k] = page_params[k];
          }
      } else {
          params.page = page;
      }
  } else {
      page = 1;
  }
  var config = tapi.get_config(user);
  if(config.comments_need_status) {
      var sid = $ele.closest('li').attr('did');
      params.status = ui.TWEETS[sid];
  }
  var method = timeline_type === 'comment' ? 'comments' : 'repost_timeline';
  tapi[method](params, function(data, textStatus){
      data = data || {};
      var comments = data.items || data;
      if(comments){
          if(comments.length && comments.length>0){
              
          } else {
              if (page===1){
                  commentWrap.find('.comment_paging').hide();
              }else{
                  commentWrap.find('.comment_paging a:eq(1)').hide();
              }
          }
      }
      if (!comments || !comments.length) {
          $ele.parent().html('(0)');
      }
      hideLoading();
  });
}

function commentPage(ele, tweetId, is_pre){
    var $this = $(ele);
    var page_wrap = $this.parent();
    var page = Number(page_wrap.attr('page'));
    if (isNaN(page)){
        page = 1;
    }
    if (page === 1 && is_pre) {
        $this.hide();
        return;
    }
    page = is_pre ? page - 1 : page + 1;
    page_wrap.hide();
    var user = getUser();
    var page_params = null;
    if (page) {
        if (user.blogType === 't163') {
            // 163只支持 since_id和max_id翻页
            if(is_pre) {
                page_params = {since_id: page_wrap.attr('first_id')};
            } else {
                page_params = {max_id: page_wrap.attr('last_id')};
            }
        } else if (user.blogType === 'tqq') {
            // PageFlag：（根据dwTime），0：第一页，1：向下翻页，2向上翻页；
            // tqq: TwitterId: 第一页 时填0,继续向下翻页，填上一次请求返回的最后一条记录ID，翻页用
            if (is_pre) {
                // 必须+1，否则会带上第一天记录
                page_params = { since_id: parseInt(page_wrap.attr('first_id'), 10) + 1};
            } else {
                page_params = {max_id: page_wrap.attr('last_id')};
            }
        }
    }
    showComments(ele, tweetId, page, true, page_params);
}

//发送 @回复
function sendReplyMsg(msg) {
    var btn = $("#replySubmit");
    var txt = $("#replyTextarea");
    var screen_name = $("#ye_dialog_title").text();
    var user = getUser();
    var config = tapi.get_config(user);
    var tweetId = $("#replyTweetId").val();
    // 判断是否需要填充 @screen_name
    if (config.reply_dont_need_at_screen_name !== true || !tweetId) {
        if (config.rt_at_name) {
            // 需要使用name替代screen_name
            msg = '@' + $('#replyUserName').val() + ' ' + msg;
        } else {
            msg = screen_name + ' ' + msg;
        }
    }
    if (tweetId) {
        data = { sina_id: tweetId }; // @回复
    } else {
        data = {};
    }
    btn.attr('disabled','true');
    txt.attr('disabled','true');
    data['status'] = msg;
    data['user'] = user;
    tapi.update(data, function (sinaMsg, textStatus) {
        if (sinaMsg.id) {
            hideReplyInput();
            txt.val('');
            // setTimeout(callCheckNewMsg, 1000, 'friends_timeline');
            showMsg(screen_name + ' ' + i18n.get("comm_success"));
        } else if (sinaMsg.error) {
           showMsg('error: ' + sinaMsg.error);
        }
        btn.removeAttr('disabled');
        txt.removeAttr('disabled');
    });
};

//发送微博
function sendMsg(msg){
    var btn = $("#btnSend"),
        txt = $("#txtContent"),
        source_url = txt.data('source_url'),
        short_url = txt.data('short_url');
        
    btn.attr('disabled','true');
    txt.attr('disabled','true');
    
    var users = [], selLi = $("#accountsForSend .sel"), current_user = getUser();
    if(selLi.length){
        selLi.each(function(){
            var uniqueKey = $(this).attr('uniqueKey');
            var _user = getUserByUniqueKey(uniqueKey, 'send');
            if(_user){
                users.push(_user);
            }
        });
    }else if(!$("#accountsForSend li").length){
        users.push(getUser());
    }else{
        showMsg(i18n.get("msg_need_select_account"));
        btn.removeAttr('disabled');
        txt.removeAttr('disabled');
        return;
    }
    var stat = {image_urls: []};
    stat.userCount = users.length;
    stat.sendedCount = 0;
    stat.successCount = 0;
    stat.uploadCount = 0;
    stat.unsupport_uploads = []; // 不支持发送图片的，则等待支持发送图片的获取到图片后，再发送
    var use_source_url = source_url && short_url;
    var pic = window.imgForUpload;
    stat.pic = pic;
//    var matchs = tapi.findSearchText(current_user, msg);
    for(var i = 0, len = users.length; i < len; i++) {
        var status = msg, user = users[i];
        // 判断是否使用缩短网址
        if(use_source_url) {
            var config = tapi.get_config(user);
            if(config.support_auto_shorten_url) {
                status = status.replace(short_url, source_url);
            }
        }
        // 处理主题转化
//      if(matchs.length > 0 && current_user.blogType !== user.blogType) {
//          for(var j = 0, jlen = matchs.length; j < jlen; j++) {
//              var match = matchs[j];
//              status = status.replace(match[0], tapi.formatSearchText(user, match[1]));
//          }
//      }
        var config = tapi.get_config(user);
        if(pic && (!config.support_upload || user.apiProxy)) { // twitter代理不兼容图片上传
            stat.unsupport_uploads.push([status, user, stat, selLi]);
        } else {
            stat.uploadCount++;
            _sendMsgWraper(status, user, stat, selLi, pic);
        }
    }
    _start_updates(stat);
};

function _get_image_url(stat, callback, onprogress, context) {
    // 都没有url，则只能发普通微博了
    var image_url = null;
    for(var i = 0, len = stat.image_urls.length; i < len; i++) {
        // 优先获取sinaimg
        if(stat.image_urls[i].indexOf('sinaimg') > 0) {
            image_url = stat.image_urls[i];
            break;
        }
    }
    if(!image_url) {
        image_url = stat.image_urls[0];
    }
    if(!image_url && stat.pic) {
        if(!onprogress) {
            var $loading_bar = $('#upImgPreview .loading_bar');
            if($loading_bar.length > 0) {
                onprogress = function(rpe) {
                    // progress
                    var html = display_size(rpe.loaded) + "/" + display_size(rpe.total);
                    var width = parseInt((rpe.loaded / rpe.total) * $loading_bar.width());
                    $loading_bar.find('div').css({'border-left-width': width + 'px'}).find('span').html(html);
                };
            }
        }
        Nodebox.upload({}, stat.pic, function(error, info) {
            if(info && (info.link || info.url)) {
                image_url = info.link || info.url;
            }
            callback.call(context, image_url);
        }, onprogress, context);
    } else {
        callback.call(context, image_url);
    }
}

function _start_updates(stat) {
  if (stat.uploadCount === 0 && stat.unsupport_uploads && stat.unsupport_uploads.length > 0) {
    var unsupport_uploads = stat.unsupport_uploads;
    delete stat.unsupport_uploads;
    _get_image_url(stat, function (image_url) {
      if (image_url) {
        stat.select_image_url = image_url;
      }
      for (var i = 0, len = unsupport_uploads.length; i < len; i++) {
        if (image_url) {
          unsupport_uploads[i][0] += ' ' + image_url;
        }
        _sendMsgWraper.apply(null, unsupport_uploads[i]);
      }
    });
  }
};

function _sendMsgWraper(msg, user, stat, selLi, pic) {
  function callback (err, result) {
    if (err) {
      ui.showErrorTips(err);
      console.error(err);
    }
    stat.uploadCount--;
    stat.sendedCount++;
    if (result && result.id) {
      stat.successCount++;
      $("#accountsForSend li[uniquekey='" + user.uniqueKey +"']").removeClass('sel');
      if (result) {
        var image_url = result.original_pic;
        if (!image_url && result.data) {
          image_url = result.data.original_pic;
        }
        if (image_url) {
          stat.image_urls.push(image_url);
        }
      }
    }
    _start_updates(stat);
      
    if (stat.successCount >= stat.userCount) { // 全部发送成功
      // showMsg(i18n.get("msg_send_success"));
      var $remember_send_data = $('#remember_send_data');
      if (!$remember_send_data.prop('checked')) {
        // 清除url数据
        $("#txtContent").val('').data({source_url: '', short_url: ''});
        window.imgForUpload = null;
        $('#upImgPreview').hide().find('.img').html('');
        $('#show_status_input').click();
        selLi.addClass('sel');
      } else {
        // 不选中
        $remember_send_data.prop('checked', false);
      }
    }
    if (stat.sendedCount >= stat.userCount) {// 全部发送完成
      selLi = null;
      $("#btnSend, #txtContent").removeAttr('disabled');
      if (stat.successCount > 0) { // 有发送成功的
        // setTimeout(callCheckNewMsg, 1000, 'friends_timeline');
        var failCount = stat.userCount - stat.successCount;
        if (stat.userCount > 1 && failCount > 0){ // 多个用户，并且有发送失败才显示
          showMsg(i18n.get("msg_send_complete").format({
            successCount: stat.successCount, 
            errorCount: failCount
          }));
        }
        if (stat.select_image_url && failCount > 0) { 
          // 有未成功的，则将图片保留下来，以便下次发送
          var $txtContent = $("#txtContent");
          $txtContent.val($txtContent.val() + ' ' + stat.select_image_url);
        }
      }
    }
    user = null;
    stat = null;
  };
  if (pic) {
    var data = {status: msg};
    var fileName = pic.fileName || pic.name;
    var contentType = pic.fileType || pic.type
    pic = { data: pic, name: fileName, content_type: contentType };
    var $loading_bar = $('#upImgPreview .loading_bar');
    var onprogress = null;
    if (!$loading_bar.data('uploading')) {
      $loading_bar.data('uploading', true);
      onprogress = function (rpe) {
        // progress
        var html = display_size(rpe.loaded) + "/" + display_size(rpe.total);
        var width = parseInt((rpe.loaded / rpe.total) * $loading_bar.width());
        $loading_bar.find('div').css({'border-left-width': width + 'px'}).find('span').html(html);
      };
    }
    pic.progress = onprogress;
    weibo.upload(user, data, pic, callback);
  } else {
    weibo.update(user, msg, callback);
  }
};

// 发生私信
function sendWhisper(msg){
  var btn = $("#replySubmit");
  var txt = $("#replyTextarea");
  var toUserId = $('#whisperToUserId').val();
  var data = {text: msg, id: toUserId};
  var user = getUser();
  data['user'] = user;
  btn.attr('disabled','true');
  txt.attr('disabled','true');
  if (user.blogType == 't163') {
    // 163只需要用户
    data.id = $('#replyUserName').val();
  }
  tapi.new_message(data, function (sinaMsg, textStatus) {
    if (sinaMsg === true || sinaMsg.id) {
      hideReplyInput();
      txt.val('');
      showMsg(i18n.get("msg_send_success"));
    }
    btn.removeAttr('disabled');
    txt.removeAttr('disabled');
  });
};

function sendRepost(msg, repostTweetId, notSendMord) {
  var $btn = $("#replySubmit");
  var $txt = $("#replyTextarea");
  repostTweetId = repostTweetId || $('#repostTweetId').val();
  var data = { status: msg, id: repostTweetId };
  var user = getUser();
  var config = tapi.get_config(user);
  data.user = user;
  $btn.attr('disabled','true');
  $txt.attr('disabled','true');
  if (config.repost_need_status) {
    data.retweeted_status = ui.TWEETS[repostTweetId];
  }
  // 处理是否评论
  if (!notSendMord) {
    var $chk_sendOneMore = $('#chk_sendOneMore');
    if ($chk_sendOneMore.attr("checked") && $chk_sendOneMore.val()) { // 同时给XXX评论
      if (config.support_repost_comment) {
        data.is_comment = 1;
      } else {
        sendComment(msg, $chk_sendOneMore.val(), true);
      }
    }
    var $chk_sendOneMore2 = $('#chk_sendOneMore2');
    if ($chk_sendOneMore2.attr("checked") && $chk_sendOneMore2.val()) { // 同时给原作者 XXX评论
      if (config.support_repost_comment_to_root) {
        data.is_comment_to_root = 1;
      } else {
        sendComment(msg + '.', $chk_sendOneMore2.val(), true);
      }
    }
  }
  tapi.repost(data, function(status, textStatus){
    if (status && (status === true || status.id || (status.retweeted_status && status.retweeted_status.id))) {
      hideReplyInput();
      $txt.val('');
      setTimeout(callCheckNewMsg, 1000, 'friends_timeline');
      showMsg(i18n.get("msg_repost_success"));
    }
    $btn.removeAttr('disabled');
    $txt.removeAttr('disabled');
  });
};

function sendComment(msg, sid, notSendMord) {
  var btn = $("#replySubmit");
  var txt = $("#replyTextarea");
  var cid = $('#commentCommentId').val();
  var user_id = $('#commentUserId').val();
  sid = sid || $('#commentTweetId').val();
  var user = getUser();
  // var config = tapi.get_config(user);
  // 判断评论是否需要用到原微博的user_id
  // if (config.comment_need_user_id) {
  //   data.user_id = user_id;
  // }
  // if (config.comments_need_status) {
  //   data.status = ui.TWEETS[comment_id];
  // }
  btn.attr('disabled','true');
  txt.attr('disabled','true');
  var m = 'comment_create';
  if (cid) { //如果是回复别人的微博
    m = 'reply';
    data.cid = cid;
    // if (user.blogType !== 't163') { // 163不支持reply_user_id;
    //   data.comment = data.comment.replace(i18n.get("msg_comment_reply_default").format({username:$('#replyUserName').val()}), '');
    // }
    var reply_user_id = $('#replyUserId').val();
    data.reply_user_id = reply_user_id;
  } 
  tapi[m](user, sid, msg, function (err, result) {
    if (err) {
      return ui.showErrorTips(err);
    }
    $('.close_dialog:first').click();
    txt.val('').removeAttr('disabled');
    btn.removeAttr('disabled');
    ui.showTips(i18n.get("msg_comment_success"));
  });

  if (!notSendMord) {
    if ($('#chk_sendOneMore').attr("checked") && $('#chk_sendOneMore').val()){
      sendRepost(msg, $('#chk_sendOneMore').val(), true);
    }
  }
};

function resizeFawave(w, h) {
  if (!w) {
    w = window.innerWidth;
  }
  if (!h) {
    h = window.innerHeight;
  }
  var wh_css = '#wrapper{width:'+ w +'px;}' +
    '#txtContent{width:'+ (w - 2) +'px;}' +
    '.warp{width:' + w + 'px;} .list_warp{height:' + (h - 70) + 'px;}' +
    '#pb_map_canvas, #popup_box .image img, #popup_box .image canvas{max-width:'+ (w - 20) +'px;}';
  $("#styleCustomResize").html(wh_css);
};

/**
 * 根据当前配置，初始化文本的基本属性
 */
function _initText($text, config) {
  config = config || tapi.get_config(getUser());
  $text.data('max_text_length', config.max_text_length)
    .data('support_double_char', config.support_double_char);
}

function doReply(ele, screen_name, tweetId, name) { // @回复
  ActionCache.set('doReply', [null, screen_name, tweetId, name]);
  $('#actionType').val('reply');
  $('#replyTweetId').val(tweetId || '');
  $('#replyUserName').val(name);
  var user = getUser();
  if (user.blogType === 'renren') {
    screen_name += '(' + name + ')';
  }
  $('#ye_dialog_title').html('@' + screen_name);

  $('#chk_sendOneMore').attr("checked", false).val('').hide();
  $('#txt_sendOneMore').text('').hide();
  $('#chk_sendOneMore2').attr("checked", false).val('').hide();
  $('#txt_sendOneMore2').text('').hide();

  $('#ye_dialog_window').show();
  var $replyText = $('#replyTextarea');
  var text = $replyText.val();
  if (!text) {
    var tweet = ui.TWEETS[tweetId];
    var at_users = tapi.find_at_users(user, tweet && tweet.text);
    if (at_users) {
      for (var i = 0, l = at_users.length; i < l; i++) {
        var at_user = at_users[i];
        if (at_user !== tweet.user.name && at_user !== screen_name &&
            at_user !== user.screen_name && at_user !== user.name) {
          text += '@' + at_user + ' ';
        }
      }
    }
  }
  $replyText.val('').focus().val(text);
  _initText($replyText);
  countReplyText();
};

/*
    @ele: 触发该事件的元素
    @userName: 当前微博的用户名
    @tweetId: 微博的id
    @rtUserName: 转发微博的用户名
    @reTweetId: 转发的微薄id
*/
function doRepost(ele, userName, tweetId, rtUserName, reTweetId) { // 转发
    ActionCache.set('doRepost', [ null, userName, tweetId, rtUserName, reTweetId ]);
    var user = getUser();
    var config = tapi.get_config(user);
    $('#actionType').val('repost');
    $('#repostTweetId').val(tweetId);
    $('#replyUserName').val(userName);
    $('#ye_dialog_title').html(i18n.get("msg_repost_who").format({username:userName}));
    var support_comment = config.support_comment && user.blogType !== 'tqq';
    if (support_comment) {
        $('#chk_sendOneMore').attr("checked", false).val(tweetId).show();
        $('#txt_sendOneMore').text(i18n.get("msg_comment_too")
            .format({username:userName})).show();
    } else { // 不支持repost，则屏蔽
        $('#chk_sendOneMore').attr("checked", false).val('').hide();
        $('#txt_sendOneMore').text('').hide();
    }
    if (support_comment && rtUserName && rtUserName != userName && reTweetId) {
        $('#chk_sendOneMore2').attr("checked", false).val(reTweetId).show();
        $('#txt_sendOneMore2').text(i18n.get("msg_comment_original_too")
            .format({username:rtUserName})).show();
    } else {
        $('#chk_sendOneMore2').attr("checked", false).val('').hide();
        $('#txt_sendOneMore2').text('').hide();
    }

    $('#ye_dialog_window').show();
    var $t = $('#replyTextarea');
    var value = $t.val() || '';
    $t.focus().blur();
    if (!value) {
        if (reTweetId && ui.TWEETS[tweetId]) {
            var rt = ui.TWEETS[tweetId];
            if (user.blogType === 'tqq') {
                userName = rt.user.name || userName;
            }
            if (user.blogType === 'renren') {
                value = '//转' + userName + ':' + rt.text;
            } else {
                value = config.repost_delimiter + '@' + userName + ':' + rt.text;
            }
        } else {
            value = i18n.get("comm_repost_default");
        }
    }
    // 光标在前
    $t.val(value).focus();
    if (value === i18n.get("comm_repost_default")) {
        $t.select();
    }
    _initText($t, config);
    countReplyText();
};

/* 评论
 * cid: 回复的评论ID
 */
function doComment(ele, userName, userId, tweetId, replyUserName, replyUserId, cid) {
    if (typeof ele === 'string') {
        ele = document.getElementById(ele);
    }
    ActionCache.set('doComment', [
        $(ele).attr('id'), userName, userId, tweetId, 
        replyUserName, replyUserId, cid
    ]);
    $('#actionType').val('comment');
    $('#commentTweetId').val(tweetId);
    $('#commentUserId').val(userId);
    $('#replyUserName').val(replyUserName);
    $('#replyUserId').val(replyUserId || '');
    $('#commentCommentId').val(cid||'');
    $('#ye_dialog_title').html(i18n.get("msg_comment_who").format({username:userName}));
    $('#ye_dialog_window').show();
    var _txt = $('#replyTextarea').val();
    var _txtRep = '';
    var user = getUser();
    var config = tapi.get_config(user);
    if (!_txt) {
        _txt = replyUserName ? (i18n.get("msg_comment_reply_default").format({username:replyUserName})) : '';
        var needOriginal = false;
        if (cid) {
            needOriginal = config.comment_reply_need_original || 
                localStorage.getObject(INCLUDE_ORIGINAL_COMMENT) === 1;
            // 带上原评论内容
            window._currentCommentElement = ele; //搓劣的做法，赶时间，暂时这样了
            $("#chk_originalComment, #txt_originalComment").show();
            if (needOriginal) {
                $("#chk_originalComment").attr("checked", true);
            } else {
                $("#chk_originalComment").removeAttr("checked");
            }
        }
        // 回复是否带上原评论内容
        if (needOriginal) {
            //查看某条微博的评论列表里
            _txtRep = $(ele).parent().find('.commentContent').text();
            if (_txtRep) {
                _txtRep = '//' + _txtRep;
            } else {
                // 我的评论列表
                var _tmpP = $(ele).parents('.commentWrap');
                if (_tmpP.length && _tmpP.eq(0).find('.msg .tweet .tweet_text').length) {
                    _txtRep = '//@' + replyUserName + ':' + $.trim(_tmpP.eq(0).find('.msg .tweet .tweet_text').text());
                }
            }
        }
    }
    
    if (config.support_comment_repost) { // 支持repost才显示
        $('#chk_sendOneMore').attr("checked", false).val(tweetId).show();
        $('#txt_sendOneMore').text(i18n.get("msg_repost_too")).show();
    } else {
        $('#chk_sendOneMore').val('').hide();
        $('#txt_sendOneMore').text('').hide();
    }
    $('#chk_sendOneMore2').val('').hide();
    $('#txt_sendOneMore2').text('').hide();
    
    var $replyText = $('#replyTextarea');
    $replyText.val('').focus().val(_txt).blur().val(_txt + _txtRep).focus();
    _initText($replyText, config);
    countReplyText();
};

function doNewMessage(ele, userName, toUserId){//悄悄话
    ActionCache.set('doNewMessage', [null, userName, toUserId]);
    $('#actionType').val('newmsg');
    $('#whisperToUserId').val(toUserId);
    $('#replyUserName').val(userName);
    $('#ye_dialog_title').html(i18n.get("msg_direct_message_who").format({username:userName}));

    $('#chk_sendOneMore').attr("checked", false).val('').hide();
    $('#txt_sendOneMore').text('').hide();
    $('#chk_sendOneMore2').attr("checked", false).val('').hide();
    $('#txt_sendOneMore2').text('').hide();

    $('#ye_dialog_window').show();
    var $replyText = $('#replyTextarea'), text = $replyText.val() || '';
    $replyText.val('').focus().val(text);
    _initText($replyText);
    countReplyText();
};

function doRT(ele, is_rt, is_rt_rt) {
    var $li = $(ele).closest('li');
    var did = $li.attr('did');
    data = ui.TWEETS[did];
    var t = $("#txtContent");
    t.val('').blur();
    // 如果有链接还原，则记录下来
    var $link = $li.find('a.link');
    if ($link.attr('rhref')) {
        t.data('source_url', $link.attr('rhref')).data('short_url', $link.html());
    }
    if (is_rt) {
        data = data.retweeted_status;
    } else if(is_rt_rt) {
        data = data.retweeted_status.retweeted_status;
    }
    var _msg_user = data.user;
    var cuser = getUser();
    var config = tapi.get_config(cuser);
    var repost_pre = config.repost_pre;
    var need_processMsg = config.need_processMsg;
    var val = data.text;
    if (!need_processMsg && val) {
        // 将链接提取出来
        var $links = $('<div>' + val + '</div>').find('a');
        val = htmlToText(val);
        $links.each(function() {
            var $a = $(this);
            var url = $a.attr('href'), a_text = $a.text();
            if(url && a_text) {
                val = val.replace(a_text, a_text + ' ' + url + ' ');
            }
        });
    }
    var isRenren = cuser.blogType === 'renren';
    var original_pic = data.original_pic, sourcelink = null, need_sourcelink = null;
    if (config.rt_need_source && data.retweeted_status) {
        if (data.retweeted_status.original_pic) {
            original_pic = data.retweeted_status.original_pic;
        }
        var rt_name = config.rt_at_name ? 
            (data.retweeted_status.user.name || data.retweeted_status.user.id) 
            : data.retweeted_status.user.screen_name;
        if (isRenren) {
            rt_name = data.retweeted_status.user.name + '(' + data.retweeted_status.user.id + ')';
        }
        val += '//@' + rt_name + ':' + 
            (need_processMsg ? data.retweeted_status.text : htmlToText(data.retweeted_status.text));
        if (data.retweeted_status.retweeted_status) {
            if (data.retweeted_status.retweeted_status.original_pic) {
                original_pic = data.retweeted_status.retweeted_status.original_pic;
            }
            var rtrt_name = config.rt_at_name ? 
                (data.retweeted_status.retweeted_status.user.name || data.retweeted_status.retweeted_status.user.id) 
                : data.retweeted_status.retweeted_status.user.screen_name;
            if (isRenren) {
                rtrt_name = data.retweeted_status.retweeted_status.user.name + 
                    '(' + data.retweeted_status.retweeted_status.user.id + ')';
            }
            val += '//@' + rtrt_name + ':' + (need_processMsg ? 
                data.retweeted_status.retweeted_status.text 
                : htmlToText(data.retweeted_status.retweeted_status.text));
        }
    }
    if (!original_pic) {
        // 尝试从链接中获取图片
        var $preview = $li.find('a.image_preview');
        original_pic = $preview.attr('original');
        sourcelink = $preview.attr('sourcelink');
        need_sourcelink = $preview.attr('need_sourcelink');
    }
    
//    if(!original_pic) {
//      // 没图片，则打开文本框
//        window.imgForUpload = null;
//      showMsgInput();
//    }
    window.imgForUpload = null;
    showMsgInput();
    
    var name = config.rt_at_name ? (_msg_user.name || _msg_user.id) : _msg_user.screen_name;
    if (isRenren) {
        name = _msg_user.name + '(' + _msg_user.id + ')';
    }
    val = 'RT @' + name + ' ' + val;
//    val = repost_pre + ' ' + '@' + name + ' ' + val;
    if (data.crosspostSource) {
        var longurl = data.crosspostSource;
        val += ' ' + longurl;
    }
    t.blur().val(val).focus(); //光标在头部
    if(original_pic) {
        if(original_pic.indexOf('126.fm') >= 0) {
            // 163的图片需要先还原
            ShortenUrl.expand(original_pic, function(data) {
                var longurl = data.url || data;
                if(longurl) {
                    original_pic = longurl.replace('#3', '');
                    var file = window.imgForUpload = getImageBlob(original_pic);
                    _init_image_preview(original_pic, file.size, 'upImgPreview', 'btnUploadPic');
                }
            });
        } else {
            var file = window.imgForUpload = getImageBlob(original_pic);
            _init_image_preview(original_pic, file.size, 'upImgPreview', 'btnUploadPic');
        }
    }
};

function _delCache(id, t, unique_key) {
  var cache_key = unique_key + t + '_tweets';
  var b_view = getBackgroundView();
  if (b_view && b_view.tweets[cache_key]) {
    var cache = b_view.tweets[cache_key];
    id = String(id);
    for (var i = 0; i < cache.length; i++) {
      if (String(cache[i].id) === id) {
        cache.splice(i, 1);
        break;
      }
    }
  }
};

function doDelTweet(tweetId, ele) {//删除自己的微博
  if (!tweetId) {
    return;
  }
  showLoading();
  var user = getUser();
  var t = getCurrentTab().replace('#','').replace(/_timeline$/i,'');
  tapi.destroy({id: tweetId, user: user}, function (data, textStatus) {
    if (textStatus != 'error' && data && !data.error) {
      $(ele).closest('li').remove();
      _delCache(tweetId, t, user.uniqueKey);
      showMsg(i18n.get("msg_delete_success"));
    } else {
      showMsg(i18n.get("msg_delete_fail"));
    }
  });
};
function doDelComment(ele, screen_name, tweetId) {//删除评论
  if (!tweetId) {
    return;
  }
  showLoading();
  var user = getUser();
  var t = getCurrentTab().replace('#','').replace(/_timeline$/i,'');
  tapi.comment_destroy({id: tweetId, user: user}, function (data, textStatus) {
    if (textStatus != 'error' && data && !data.error) {
      $(ele).closest('li').remove();
      _delCache(tweetId, t, user.uniqueKey);
      showMsg(i18n.get("msg_delete_success"));
    } else {
      showMsg(i18n.get("msg_delete_fail"));
    }
  });
};
function delDirectMsg(ele, screen_name, tweetId){//删除私信
    if(!tweetId){return;}
    showLoading();
    var user = getUser();
    var t = getCurrentTab().replace('#','').replace(/_timeline$/i,'');
    tapi.destroy_msg({id:tweetId, user:user}, function(data, textStatus){
        if(textStatus != 'error' && data && !data.error){
            $(ele).closest('li').remove();
            _delCache(tweetId, t, user.uniqueKey);
            showMsg(i18n.get("msg_delete_success"));
        }else{
            showMsg(i18n.get("msg_delete_fail"));
        }
    });
}

function addFavorites(ele, screen_name, tweetId) {
  showLoading();
  var _a = $(ele);
  var _aHtml = _a[0].outerHTML;
  _a.hide();
  var user = getUser();
  var config = tapi.get_config(user);
  // var t = getCurrentTab().replace('#', '').replace(/_timeline$/i, '');
  // var params = { id: tweetId, user: user };
  // if (config.favorite_need_status) {
  //   params.status = ui.TWEETS[tweetId];
  // }
  tapi.favorite_create(user, tweetId, function (err, result) {
    if (err) {
      console.error(err);
      ui.showErrorTips(err);
      _a.show();
      return;
    }
    _a.after(_aHtml.replace('addFavorites','delFavorites')
      .replace('favorites_2.gif','favorites.gif')
      .replace(i18n.get("btn_add_favorites_title"), i18n.get("btn_del_favorites_title")));
    _a.remove();
    // var cacheKey = user.uniqueKey + t + '_tweets';
    // var b_view = getBackgroundView();
    // if (b_view && b_view.tweets[cacheKey]) {
    //   var cache = b_view.tweets[cacheKey];
    //   for (var k in cache){
    //     if (cache[k].id === tweetId) {
    //       cache[k].favorited = true;
    //       break;
    //     }
    //   }
    // }
    ui.showTips(i18n.get("msg_add_favorites_success"));
  });
}

function delFavorites(ele, screen_name, tweetId) {
  showLoading();
  var _a = $(ele);
  var _aHtml = _a[0].outerHTML;
  _a.hide();
  var user = getUser();
  // var config = tapi.get_config(user);
  // var params = { id: tweetId, user: user };
  // if (config.favorite_need_status) {
  //   params.status = ui.TWEETS[tweetId];
  // }
  var t = getCurrentTab().replace('#','').replace(/_timeline$/i,'');
  tapi.favorite_destroy(user, tweetId, function (err, result) {
    if (err) {
      ui.showErrorTips(err);
      _a.show();
      return;
    }
    _a.after(_aHtml.replace('delFavorites','addFavorites')
      .replace('favorites.gif','favorites_2.gif')
      .replace(i18n.get("btn_del_favorites_title"), i18n.get("btn_add_favorites_title")));
    _a.remove();
    // var cacheKey = user.uniqueKey + t + '_tweets';
    // var b_view = getBackgroundView();
    // if (b_view && b_view.tweets[cacheKey]) {
    //   var cache = b_view.tweets[cacheKey];
    //   for (var k in cache) {
    //     if (cache[k].id === tweetId) {
    //       cache[k].favorited = false;
    //       break;
    //     }
    //   }
    // }
    ui.showTips(i18n.get("msg_del_favorites_success"));
  });
}

function sendOretweet(ele, screen_name, tweetId) {//twitter锐推
    if (!tweetId) {
        return;
    }
    showLoading();
    var _a = $(ele);
    var _aHtml = _a[0].outerHTML;
    _a.hide();
    var user = getUser();
    var t = getCurrentTab().replace('#','').replace(/_timeline$/i,'');
    var title = _a.attr('title');
    tapi.retweet({ id: tweetId, user: user }, function (data, textStatus) {
        if (textStatus != 'error' && data && !data.error) {
            _a.removeAttr('onclick').attr('title', i18n.get("comm_success")).show();
            if (_a.hasClass('ort')) {
                _a.addClass('orted');
            }
            if (_a.html()) {
                _a.html(i18n.get("comm_has") + _a.html());
            }
            var c_user = getUser();
            var cacheKey = c_user.uniqueKey + t + '_tweets';
            var b_view = getBackgroundView();
            if (b_view && b_view.tweets[cacheKey]) {
                var cache = b_view.tweets[cacheKey];
                for (var i in cache) {
                    if (String(cache[i].id) === String(tweetId)) {
                        cache[i].retweeted = true;
                        break;
                    }else if(cache[i].retweeted_status && cache[i].retweeted_status.id == tweetId){
                        cache[i].retweeted_status.retweeted = true;
                        break;
                    }
                }
            }

            showMsg(title + i18n.get("comm_success"));
        } else {
            showMsg(title + i18n.get("comm_fail"));
            _a.show();
        }
    });
}
//<<<<<<<<<<<<<=====

//显示地图
function showGeoMap(user_img, latitude, longitude){
  if (google && google.maps) {
    popupBox.showMap(user_img, latitude, longitude);
  } else {
    showMsg(i18n.get("msg_loading_map"));
  }
};

// 获取弹出窗口的基本参数
function _get_open_window_args(width, height) {
  width = width || 520;
  height = height || 600;
  var left = (window.screen.availWidth - width) / 2;
  var win_args = {
    width: width, 
    height: height, 
    left: left, 
    top: 30, 
    toolbar: 'no', 
    menubar: 'no', 
    location: 'no', 
    resizable: 'no',
    scrollbars: 'yes', 
    status: 'yes'
  };
  var args_str = '';
  for (var k in win_args) {
    args_str += k + '=' + win_args[k] + ',';
  }
  return args_str.substring(0, args_str.length - 1);
}

function _getWindowId(callback) {
  var params = decodeForm(window.location.search);
  if (params.windowId) {
    callback(params.windowId);
  } else {
    chrome.tabs.getSelected(null, function (tab) {
      callback(tab.windowId);
    });
  }
}

//打开上传图片窗口
function openUploadImage(tabId, image_url, image_source_link, image_need_source_link){
    var args_str = _get_open_window_args();
    tabId = tabId || '';
    var url = 'upimage.html?tabId=' + tabId;
    if(image_url) {
        url += '&image_url=' + image_url;
    }
    if(image_source_link) {
        // 图片原始缩短url，如果有，则替换文本数据
        url += '&image_source_link=' + image_source_link;
    }
    if(image_need_source_link) {
        url += '&image_need_source_link=' + image_need_source_link;
    }
    window.open(url, '_blank', args_str);
};

// 打开长微博窗口
function openLongText() {
    _getWindowId(function(windowId) {
        initOnUnload();
        var args_str = _get_open_window_args(700, 650);
        var url = 'longtext.html?windowId=' + windowId;
        window.open(url, '_blank', args_str);
    });
};

// 在新窗口打开popup页
function openPopupInNewWin(windowId) {
    _getWindowId(function(windowId) {
        initOnUnload();
        var settings = setting.Settings.get();
        var args_str = _get_open_window_args(settings.popupWidth, settings.popupHeight);
        window.theViewName = 'not_popup';
        var url = 'popup.html?is_new_win=true';
        if(windowId) {
            url += '&windowId=' + windowId;
        }
        getBackgroundView().new_win_popup.window = window.open(url, 'FaWave', args_str);
    });
}

//新消息提示模式：提示模式、免打扰模式
function changeAlertMode(to_mode){
    var btn = $("#btnAlertMode");
    if(!to_mode){
        var mode = btn.attr('mode');
        to_mode = (mode == 'alert') ? 'dnd' : 'alert';
    }
    setting.setAlertMode(to_mode);
    var tip = (to_mode=='alert') ? i18n.get("btn_alert_mode_title") : i18n.get("btn_dnd_mode_title");
    btn.attr('mode', to_mode).attr('title', tip).find('img').attr('src', 'images/' + to_mode + '_mode.png');
    User.setUnreadTimelineCount(0, 'friends_timeline');
};

//新消息是否自动插入：自动插入、仅提示新消息数
function changeAutoInsertMode(to_mode){
    var btn = $("#btnAutoInsert");
    if(!to_mode){
        var mode = btn.attr('mode');
        to_mode = mode === 'notautoinsert' ? 'autoinsert' : 'notautoinsert';
    }
    setting.setAutoInsertMode(to_mode);
    var tip = to_mode === 'notautoinsert' ? i18n.get("btn_not_auto_insert_title") : i18n.get("btn_auto_insert_title");
    btn.attr('mode', to_mode).attr('title', tip).find('img').attr('src', 'images/' + to_mode + '.png');
};

//表情添加
fawave.face = {
    show: function(ele, target_id) {
        var f = $("#face_box");
        if(f.css('display') !== 'none' && $("#face_box_target_id").val() === target_id) {
            f.hide();
            return;
        }
        // 初始化表情
        if ($('#face_box .faceItemPicbg .face_icons').length === 0) {
            var userList = User.getUserList('send');
            var blogTypes = { yanwenzi: 1 };
            for(var i = 0, len = userList.length; i < len; i++) {
                blogTypes[userList[i].blogType] = 1;
            }
            // FACE_TYPES   [typename, faces, url_pre, tpl, type_title]
            for(var i = 0, len = FACE_TYPES.length; i < len; i++) {
                var face_type = FACE_TYPES[i];
                if(!blogTypes[face_type[0]]) {
                    // 未绑定的微博类型，无需显示表情
                    continue;
                }
                var $face_tab = $('<span face_type="' + face_type[0] + '">' + face_type[4] + '</span>');
                $face_tab.click(function() {
                    var $this = $(this);
                    if(!$this.hasClass('active')) {
                        $('.face_tab span').removeClass('active');
                        $('#face_box .faceItemPicbg .face_icons').hide();
                        $('#face_box .faceItemPicbg .' + $this.attr('face_type') + '_faces').show();
                        $this.addClass('active');
                    }
                });
                var $face_icons = $('<div style="display:none;" class="face_icons ' + face_type[0] + '_faces"></div>');
                $('#face_box .face_tab p').append($face_tab);
                $('#face_box .faceItemPicbg').append($face_icons);
                var exists = {};
                $('#face_icons li a').each(function() {
                    exists[$(this).attr('title')] = true;
                });
                var face_tpl = face_type[3];
                var faces = face_type[1];
                if(face_tpl) {
                    var tpl = '<li><a href="javascript:void(0)" onclick="fawave.face.insert(this)"' 
                        + ' value="' + face_tpl + '" title="{{name}}"><img src="{{url}}" alt="{{name}}"></a></li>';
                    var url_pre = face_type[2];
                    for(var name in faces) {
                        if(exists[name]) continue;
                        $face_icons.append(tpl.format({'name': name, 'url': url_pre + faces[name]}));
                        exists[name] = true;
                    }
                } else {
                    var tpl = '<li class="yanwenzi"><a href="javascript:void(0)" onclick="fawave.face.insert(this)"' 
                        + ' value="{{name}}" title="{{title}}">{{name}}</a></li>';
                    for(var name in faces) {
                        $face_icons.append(tpl.format({'name': name, 'title': faces[name]}));
                    }
                }
            }
            var current_blogtype = User.getUser().blogType;
            var $selected = $("#accountsForSend li.sel");
            if($selected.length > 1) {
                current_blogtype = 'yanwenzi';
            } else if($selected.length === 1) {
                current_blogtype = $selected.attr('blogType');
            }
            var $face_type_tab = $('#face_box .face_tab span[face_type="' + current_blogtype + '"]');
            if($face_type_tab.length === 0) {
                $face_type_tab = $('#face_box .face_tab span[face_type="yanwenzi"]');
            }
            $face_type_tab.click();
        }
        $("#face_box_target_id").val(target_id);
        var offset = $(ele).offset(), left = offset.left - 40, arrow_left = 40;
        if($('#replyTextarea').length > 0 && !$('#replyTextarea').is(':hidden')) {
            left = $('#ye_dialog_window').position().left;
            arrow_left = 120;
        }
        f.css({top: offset.top+20, left: left}).show();
        f.find('.layerArrow').css({left: arrow_left});
    },
    hide: function() {
        $("#face_box").hide();
        $("#face_box_target_id").val('');
    },
    insert: function(ele) {
        var $target_textbox = $("#" + $("#face_box_target_id").val());
        if($target_textbox.length === 1) {
            var tb = $target_textbox[0], str = $(ele).attr('value');
            var newstart = tb.selectionStart+str.length;
            tb.value=tb.value.substr(0, tb.selectionStart) + str + tb.value.substring(tb.selectionEnd);
            tb.selectionStart = newstart;
            tb.selectionEnd = newstart;
        }
        this.hide();
    }
};

//平滑滚动
/*
 t: current time（当前时间）；
 b: beginning value（初始值）；
 c: change in value（变化量）；
 d: duration（持续时间）。
*/
var SmoothScroller = {
    T: '', //setTimeout引用
    c_t: '', //当前tab
    list_warp: '',
    list_warp_height: 0, //当前的列表窗口高度
    ease_type: 'easeOut',
    tween_type: 'Quad',
    status:{t:0, b:0, c:0, d:0},
    resetStatus: function(){
        SmoothScroller.status.t = 0;
        SmoothScroller.status.b = 0;
        SmoothScroller.status.c = 0;
        SmoothScroller.status.d = 0;
    },
    start: function(e){
        if(e.originalEvent){
            e.wheelDelta = e.originalEvent.wheelDelta;
        }
        if(e.wheelDelta == 0){ return; }
        clearTimeout(this.T);
        e.preventDefault();
        this.c_t = getCurrentTab();
        this.list_warp = $(this.c_t + ' .list_warp');
        this.list_warp_height = this.list_warp.height(); //算好放缓存，免得每次都要算
        this.ease_type = setting.Settings.get().smoothSeaeType;
        this.tween_type = setting.Settings.get().smoothTweenType;
        var hasDo = this.status.t>0 ? (Math.ceil(Tween[this.tween_type][this.ease_type](this.status.t-1, this.status.b, this.status.c, this.status.d)) - this.status.b) : 0;
        this.status.c = -e.wheelDelta + this.status.c - hasDo; 
        this.status.d = (this.status.d/2) - (this.status.t/2) + 13;
        this.status.t = 0;
        this.status.b = this.list_warp.scrollTop();
        if(this.status.b <= 0 && this.status.c < 0){//在顶部还往上滚动，直接无视
            this.resetStatus();
            return;
        } 
        this.run();
    },
    run: function(){
        var _t = SmoothScroller;
        var _top = Math.ceil(Tween[_t.tween_type][_t.ease_type](_t.status.t, _t.status.b, _t.status.c, _t.status.d));
        _t.list_warp.scrollTop( _top );
        //var h = $(_t.c_t + ' .list').height();
        var h = $(_t.c_t + ' .list')[0].scrollHeight;
        h = h - _t.list_warp_height;
        if(_top >= h && _t.status.c > 0){
            _t.resetStatus();
            return;
        }
        if(_t.status.t < _t.status.d){
            _t.status.t++; 
            _t.T = setTimeout(_t.run, 10);
        }
    }
};

// $(function () {
//   if (Settings.get().isSmoothScroller) {
//     $('.list_warp').bind('mousewheel', function (e) {
//       SmoothScroller.start(e);
//     });
//   }
// });// <<=== 平滑滚动结束

//强制刷新
function forceRefresh(ele) {
  $(ele).attr('disabled', true).fadeOut();
  var bg = getBackgroundView();
  var user = User.getUser();
  bg.RefreshManager.refreshUser(user);
  setTimeout(showRefreshBtn, 10*1000);
}

function showRefreshBtn() {
  $("#btnForceRefresh").attr('disabled', true).fadeIn();
};// <<=== 强制刷新结束

// instapaper / read it later
function read_later(ele, service_type) {
    service_type = service_type || 'instapaper';
    var $button = $(ele);
    $button.hide();
    var $ele = $(ele).parents('.userName').next();
    var $datelink = $ele.nextAll('.msgInfo:first').find('a:first');
    if(!$ele.hasClass('tweet_text')) {
        $ele = $ele.find('.tweet_text');
    }
    var $link = $ele.find('a.link:first');
    // 没有链接，则找图片 img.thumbnail_pic attr:original
    if($link.length == 0) {
        $link = $ele.next('div').find('a.thumbnail_pic:first');
    }
    if($link.length == 0) {
        _showMsg("No URL", true);
    } else {
        var url = $link.attr('original') || $link.attr('rhref') || $link.attr('href');
        var title = $link.attr('flash_title');
        var selection = $ele.text();
        var data = {url: url, selection: selection};
        if(title) {
            data.title = title;
        }
        var user = null, service = null, settings = setting.Settings.get();
        if(service_type === 'instapaper') {
            user = settings.instapaper_user;
            service = Instapaper;
            data.selection += ' ' + $datelink.attr('href');
        } else {
            user = settings.readitlater_user;
            service = ReadItLater;
            if(!data.title) {
                data.title = data.selection;
            }
            delete data.selection;
        }
        service.add(user, data, function(success, error, xhr){
            if(success) {
                _showMsg(i18n.get("msg_save_success"), true);
            } else {
                _showMsg('Read later fail.', true);
                $button.show();
            }
        });
    }
};

// AD
function adShow() {
  // var ad = getBackgroundView().ADs.getNext();
  // if (ad) {
  //   $("#topAd").html('<a href="{{url}}" target="_blank" title="{{title}}">{{title}}</a>'.format(ad));
  // }
};

var __action_names = ['doComment', 'doRepost', 'doNewMessage', 'doReply', 'showMsgInput'];

function restoreActionCache() {
  __action_names.forEach(function (action) {
    var action_args = ActionCache.get(action);
    if (action_args) {
      if (action === 'showMsgInput') {
       // 延时一小段时间触发
        setTimeout(function() {
          window[action].apply(this, action_args);
        }, 400);
      } else {
        window[action].apply(this, action_args);
      }
    }
  });
};

function cleanActionCache() {
  for (var i = 0, len = __action_names.length; i < len; i++) {
    ActionCache.set(__action_names[i], null);
  }
};

// 查看黑名单
function showblocking(read_more) {
    var timeline_type = 'user_timeline';
    hideReadMore(timeline_type);
    var $tab = $("#tl_tabs .tab-user_timeline");
    $tab.attr('statusType', 'blocking');
    if (!read_more) {
        var $ul = $("#" + timeline_type + "_timeline ul.list");
        $ul.find(".tweetItem").remove();
        $ul.find('.fans').remove();
        $tab.data('page', null);
    }
    var c_user = User.getUser();
    var page = ($tab.data('page') || 0) + 1;
    getBackgroundView().BlockingUser.list(c_user, page, PAGE_SIZE, function(users) {
        hideLoading();
        hideReadMoreLoading(timeline_type);
        // 如果用户已经切换，则不处理
        var now_user = User.getUser();
        if(now_user.uniqueKey != c_user.uniqueKey) {
            return;
        }
        users = users.items || users;
        if(users.length > 0){
            for(var i = 0, l = users.length; i < l; i++) {
                users[i].blocking = true;
            }
            users = addPageMsgs(users, timeline_type, true, 'user');
            // 保存数据，用于翻页
            $tab.data('page', page);
        }
        if(users.length >= PAGE_SIZE / 2) {
            showReadMore(timeline_type);
        } else {
            hideReadMore(timeline_type, true); //没有分页了
        }
        checkShowGototop();
    });
    return false;
};

function create_blocking(ele, user_id) {
  var $ele = $(ele);
  $ele.hide();
  getBackgroundView().BlockingUser.create(user_id, function (data) {
    if (data === true || (data && !data.error)) {
      showMsg(i18n.get("create_blocking_success"));
      $ele.prev('.follow').show();
    } else {
      var msg = (data && data.error) || i18n.get("create_blocking_fail");
      showMsg(msg);
      $ele.show();
    }
  });
};

function destroy_blocking(ele, user_id) {
  var $ele = $(ele);
  $ele.hide();
  getBackgroundView().BlockingUser.destroy(user_id, function (data) {
    if (data === true || (data && !data.error)) {
      showMsg(i18n.get("destroy_blocking_success"));
      $ele.next('.follow').show();
    } else {
      var msg = (data && data.error) || i18n.get("destroy_blocking_fail");
      showMsg(msg);
      $ele.show();
    }
  });
};

var stateManager = new EventEmitter();

function Controller() {
  this.init();
}

Controller.prototype.init = function () {
  for (var i = 0; i < this.events.length; i++) {
    var item = this.events[i];
    this.bindEvents(item.events, item.selecter, item.handler);
  }
};

Controller.prototype.bindEvents = function (events, selecter, handler) {
  $(document).on(events, selecter, {controller: this}, handler);
};

function TimelineController() {
  this.events = [
    { events: 'click', selecter: '.timeline_tab', handler: this.click }
  ];

  $(".list_warp").on('scrollstop', { controller: this }, this.checkScroll);
  $('#gototop').on('click', function () {
    var tab = $('.tabs .active');
    var activeTimeline = tab.data('type');
    var warp = TimelineController.getWarp(activeTimeline);
    warp.scrollTop(0);
  });

  this.lastTimelines = {}; // cache user last timeline type
  this.timelineScrolls = {};
  this.cache = {}; // {uniqueKey: {}, ...}
  this.list = {}; // {uniqueKey: [], ...}
  this.favoritedCache = {}; // {uniqueKey: {}}
  this.unreadStatuses = {};

  TimelineController.super_.call(this);

  var self = this;
  stateManager.on('favorite_create', function (data) {
    var uniqueKey = data.user.uniqueKey;
    var cache = self.favoritedCache[uniqueKey];
    if (!cache) {
      cache = self.favoritedCache[uniqueKey] = {};
    }
    cache[data.id] = data.created_at;
  }).on('favorite_destroy', function (data) {
    var uniqueKey = data.user.uniqueKey;
    var cache = self.favoritedCache[uniqueKey];
    if (cache) {
      delete cache[data.id];
    }
  }).on('user_change', this.changeUser.bind(this));

  stateManager.on('new_statuses', this.newStatuses.bind(this));

  stateManager.emit('timeline_ready');
}

inherits(TimelineController, Controller);

TimelineController.prototype.newStatuses = function (data) {
  var user = User.getUserByUniqueKey(data.uniqueKey);
  if (!user) {
    return;
  }
  var key = user.uniqueKey + ':' + data.timeline;
  var list = this.unreadStatuses[key] || [];
  list = data.statuses.concat(list);
  if (list.length > 20) {
    list = list.slice(0, 20);
  }
  this.unreadStatuses[key] = list;
};

TimelineController.prototype.getUnreadStatuses = function (user, timeline) {
  var key = user.uniqueKey + ':' + timeline;
  var list = this.unreadStatuses[key] || [];
  return list;
};

TimelineController.prototype.fillFavorited = function (user, statuses) {
  if (!statuses || !statuses.length) {
    return statuses;
  }
  var cache = this.favoritedCache[user.uniqueKey];
  if (!cache) {
    return statuses;
  }
  for (var i = 0; i < statuses.length; i++) {
    var status = statuses[i];
    if (!status.favorited_at) {
      status.favorited_at = cache[status.id];
    }
  }
  return statuses;
};

TimelineController.prototype.getCacheStatus = function (user, id) {
  var uniqueKey = user.uniqueKey;
  var cache = this.cache[uniqueKey];
  if (!cache) {
    cache = this.cache[uniqueKey] = {};
    this.list[uniqueKey] = [];
    return null;
  }
  return cache[id] || null;
};

TimelineController.prototype.getCacheStatuses = function (user, timeline) {
  var key = user.uniqueKey + ':' + timeline; 
  var list = this.list[key];
  return this.fillFavorited(user, list);
};

TimelineController.prototype.setCacheStatuses = function (user, timeline, items) {
  var key = user.uniqueKey + ':' + timeline; 
  delete this.list[key];
  delete this.cache[user.uniqueKey];
  this.list[key] = items;
  var cache = {};
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    cache[item.id] = item;
  }
  this.cache[user.uniqueKey] = cache;
};

TimelineController.prototype.cacheStatuses = function (user, timeline, statuses, append) {
  statuses = statuses || [];
  var key = user.uniqueKey + ':' + timeline; 
  var list = this.list[key] || [];
  var cache = this.cache[user.uniqueKey] || {};
  for (var i = 0; i < statuses.length; i++) {
    var status = statuses[i];
    cache[status.id] = status;
  }
  console.log(key + ' before: ' + list.length);
  if (append) {
    list = list.concat(statuses);
  } else {
    // preppend
    list = statuses.concat(list);
  }
  this.cache[user.uniqueKey] = cache;
  this.list[key] = list;
  console.log(key + ' after: ' + list.length);
  return list;
};

TimelineController.prototype.setLastTimeline = function (user, timeline) {
  this.lastTimelines[user.uniqueKey] = timeline;
};

TimelineController.prototype.getLastTimeline = function (user) {
  return this.lastTimelines[user.uniqueKey] || 'friends_timeline';
};

TimelineController.prototype.setScrollTop = function (user, timeline, top) {
  var key = user.uniqueKey + ':' + timeline;
  this.timelineScrolls[key] = top;
};

TimelineController.prototype.getScrollTop = function (user, timeline) {
  var key = user.uniqueKey + ':' + timeline;
  return this.timelineScrolls[key]
};

TimelineController.prototype.changeUser = function (fromUser, toUser) {
  // 保存当前查看状态
  var self = this;
  var tab = $('.tabs .active');
  var timeline = tab.data('type');
  self.setLastTimeline(fromUser, timeline);
  self.setScrollTop(fromUser, timeline, TimelineController.getWarp(timeline).scrollTop());
  tab.removeClass('active');

  // 清空所有当前用户的数据
  $('.list_warp ul').html('');
  $('.list_p').hide();

  // 切换会上次用户正在查看的状态
  var lastTimeline = self.getLastTimeline(toUser);
  $('.tab-' + lastTimeline).addClass('active').click();
};

TimelineController.prototype.checkScroll = function (event) {
  var self = event.data.controller;
  var tab = $('.tabs .active');
  var activeTimeline = tab.data('type');
  var warp = TimelineController.getWarp(activeTimeline);
  var btn = $('#gototop');
  var scrollTop = warp.scrollTop();
  if (scrollTop > 200) {
    btn.show();
  } else {
    btn.hide();
  }
  if (scrollTop > 0) {
    var scrollHeight = warp.prop('scrollHeight') - warp.height();
    if (scrollTop >= scrollHeight) {
      self.showMore(tab);
    }
  }
};

TimelineController.prototype.showMore = function (tab) {
  if (tab.data('is_loading')) {
    return;
  }
  var self = this;
  var user = User.getUser();
  var timeline = tab.data('type');
  var params = {};
  var warp = TimelineController.getWarp(timeline);
  var max_id = warp.find('ul li:last').attr('did');
  params.max_id = max_id;
  var status = self.getCacheStatus(user, max_id);
  if (status.timestamp) {
    params.max_time = status.timestamp;
  }
  console.log(timeline + ' showing more... ' + JSON.stringify(params));
  tab.data('is_loading', true);
  self.fetch(user, timeline, params, function (err, data) {
    tab.data('is_loading', false);
    if (err) {
      ui.showErrorTips(err);
      return;
    }
    var items = data.items;
    if (data.cursor) {
      tab.data('cursor', data.cursor);
    }
    self.cacheStatuses(user, timeline, items, true);
    self.showItems(user, items, timeline, true);
  });
};

TimelineController.getWarp = function (timeline) {
  return $('#' + timeline + '_timeline .list_warp');
};

TimelineController.prototype.click = function (event) {
  // detech refresh or go to the top
  var tab = $(this);
  var active = tab.hasClass('active');
  var self = event.data.controller;
  var timeline = tab.data('type');
  var currentUser = User.getUser();
  var warp = TimelineController.getWarp(timeline);
  var isEmpty = warp.find('ul li:first').length === 0;
  var timelineScrollTop = self.getScrollTop(currentUser, timeline) || 0;
  var scrollTop = active ? 0 : timelineScrollTop;
  var needRefresh = (active || isEmpty) && warp.scrollTop() <= 100;

  if (isEmpty) {
    
    // 判断是否有缓存，有则加载，并恢复 scroll
    var list = self.getCacheStatuses(currentUser, timeline);
    if (list && list.length) {
      // load last statuses
      self.showItems(currentUser, list, timeline, true, 'status');
      // warp.scrollTop(warp.data('scrollTop') || 0);
      needRefresh = false;
      scrollTop = timelineScrollTop;
    }
  }
  
  // 刷新条件: 当前是 active 或者 没有任何内容, 并且 warp scroll 在顶部 <= 100
  if (needRefresh) {
    self.refresh(tab, isEmpty);
    scrollTop = 0;
  }

  if (!active) {
    // save the current active scrollTop
    var activeTimeline = $('.tabs .active').data('type');
    var activeWarp = TimelineController.getWarp(activeTimeline);
    self.setScrollTop(currentUser, activeTimeline, activeWarp.scrollTop());

    // active click tab
    tab.siblings().removeClass('active').end().addClass('active');
    $('.list_p').hide();
  }
  warp.parent().show();
  
  // go to the last top
  warp.scrollTop(scrollTop);
};

TimelineController.prototype.mergeNew = function (tab, user, timeline, items) {
  var self = this;
  items = self.cacheStatuses(user, timeline, items, false);
  if (items.length > 20) {
    items = items.slice(0, 20);
  }
  // set cache
  self.setCacheStatuses(user, timeline, items);
  $("#" + timeline + "_timeline ul.list").html('');
  self.showItems(user, items, timeline, false);
  if (items.length < 10) {
    self.showMore(tab);
  }
}

TimelineController.prototype.refresh = function (tab, firstLoad) {
  if (tab.data('is_loading')) {
    return;
  }
  var self = this;
  var user = User.getUser();
  var timeline = tab.data('type');
  var active = tab.hasClass('active');
  var unreadCount = parseInt(tab.find('.unreadCount').html(), 10) || 0;
  console.log('read statuses ' + timeline + ' :' + unreadCount);
  var unreadStatuses = self.getUnreadStatuses(user, timeline);
  stateManager.emit('read_statuses', {
    uniqueKey: user.uniqueKey,
    timeline: timeline,
    count: unreadCount
  });
  if (unreadStatuses.length > 0) {
    self.mergeNew(tab, user, timeline, unreadStatuses);
    return;
  }

  var params = {}; // self.getParams(tab);
  var since_id = user.since_ids && user.since_ids[timeline];
  if (!firstLoad && since_id) {
    params.since_id = since_id.id;
    if (since_id.timestamp) {
      params.since_time = since_id.timestamp;
    }
  }
  console.log(timeline + ' refreshing... since_id: ' + JSON.stringify(since_id));
  tab.data('is_loading', true);
  self.fetch(user, timeline, params, function (err, data) {
    tab.data('is_loading', false);
    if (err) {
      ui.showErrorTips(err);
      return;
    }
    var items = data.items;
    var newCount = items.length;
    if (newCount === 0) {
      ui.showTips('没有新内容');
    } else {
      ui.showTips(newCount + '条新微博');
      stateManager.emit('read_statuses', {
        uniqueKey: user.uniqueKey,
        timeline: timeline,
        since_id: { id: items[0].id, timestamp: items[0].timestamp },
        count: newCount
      });
    }
    self.mergeNew(tab, user, timeline, items);
  });
};

TimelineController.prototype.showItems = function (user, items, timeline, append, dataType) {
  if (!items || !items.length) {
    return;
  }
  var _ul = $("#" + timeline + "_timeline ul.list");
  dataType = dataType || 'status';
  var method = append ? 'append' : 'prepend';
  var direct = append ? 'last' : 'first';
  // var lastItem;
  // if (dataType === 'status') {
  //   lastItem = $("#" + timeline + "_timeline ul.list li.tweetItem:" + direct);
  // } else {
  //   lastItem = $("#" + timeline + "_timeline ul.list div.user_info:" + direct);
  // }
  // var max_id = lastItem.attr('did');
  // var result = utils.filterDatasByMaxId(items, max_id, append);
  // items = result.news;
  var htmls = dataType === 'status' ? buildStatusHtml(items, timeline) : buildUsersHtml(items, timeline);
  _ul[method](htmls.join(''));
  stateManager.emit('show_statuses', user, items, timeline);
};

TimelineController.prototype.getParams = function (tab) {
  var params = tab.data('cursor') || {};
  return params;
};

TimelineController.prototype.fetch = function (user, timeline, params, callback) {
  var loading = $('#loading').show();
  var self = this;
  weibo[timeline](user, params, function (err, data) {
    loading.hide();
    if (err) {
      return callback(err);
    }
    var items = data.items;
    if (timeline === 'favorites') {
      var statuses = [];
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        // item: {status: Status, created_at: create time, tags: []}
        statuses.push(item.status);
        item.status.favorited_at = item.created_at;
        stateManager.emit('favorite_create', { user: user, id: item.status.id, created_at: item.created_at });
      }
      items = statuses;
    }
    data.items = self.fillFavorited(user, items);
    callback(err, data);
  });
}

function FavoriteController() {
  this.events = [
    { events: 'click', selecter: '.add_favorite_btn', handler: this.add },
    { events: 'click', selecter: '.del_favorite_btn', handler: this.del },
  ];

  FavoriteController.super_.call(this);
}

inherits(FavoriteController, Controller);

FavoriteController.cache = {};

FavoriteController.prototype.add = function (event) {
  var controller = event.data.controller;
  var btn = $(this);
  btn.hide();
  var id = btn.data('id');
  var user = User.getUser();
  weibo.favorite_create(user, id, function (err, result) {
    if (err) {
      console.error(err);
      ui.showErrorTips(err);
      btn.show();
      return;
    }
    btn.find('img').attr('src', 'images/favorites.gif');
    btn.removeClass('add_favorite_btn').addClass('del_favorite_btn').show();
    // TODO cache the favorite items
    ui.showTips(i18n.get("msg_add_favorites_success"));
    stateManager.emit('favorite_create', {user: user, id: id, created_at: new Date()})
  });
};

FavoriteController.prototype.del = function (event) {
  var self = event.data.controller;
  var btn = $(this);
  btn.hide();
  var id = btn.data('id');
  var user = User.getUser();
  weibo.favorite_destroy(user, id, function (err, result) {
    if (err) {
      console.error(err);
      ui.showErrorTips(err);
      btn.show();
      return;
    }
    btn.find('img').attr('src', 'images/favorites_2.gif');
    btn.removeClass('del_favorite_btn').addClass('add_favorite_btn').show();
    ui.showTips(i18n.get("msg_del_favorites_success"));
    stateManager.emit('favorite_destroy', {user: user, id: id})
  });
}

function AccountController() {
  this.events = [
    { events: 'click', selecter: '#accountListDock ul li', handler: this.change }
  ];
  AccountController.super_.call(this);

  this.refresh();

  stateManager.once('timeline_ready', function () {
    $('#accountListDock li.current').click();
    // init user auto refresh
    var users = User.getUserList();
    for (var i = 0; i < users.length; i++) {
      stateManager.emit('user_add', users[i]);
    }
  });

  // 监听新消息，并且设置提示
  stateManager.on('new_statuses', this.newStatuses.bind(this));
  stateManager.on('read_statuses', this.readStatuses.bind(this));
}

inherits(AccountController, Controller);

AccountController.prototype.readStatuses = function (data) {
  var user = User.getUserByUniqueKey(data.uniqueKey);
  if (!user) {
    return;
  }
  var count = (user.unreadCount || 0) - data.count;
  if (count <= 0) {
    count = 0;
  }
  user.unreadCount = count;
  user.unreads = user.unreads || {};
  user.unreads[data.timeline] = 0;
  if (data.since_id) {
    user.since_ids = user.since_ids || {};
    user.since_ids[data.timeline] = data.since_id;
  }
  User.saveUser(user);
  this.refresh();
};

AccountController.prototype.newStatuses = function (data) {
  var user = User.getUserByUniqueKey(data.uniqueKey);
  if (!user) {
    return;
  }
  // var unreadTip = $('#accountListDock .' + user.uniqueKey + ' .unr');
  var count = (user.unreadCount || 0) + data.statuses.length;
  console.log(data.timeline + ' new :' + count)
  user.unreadCount = count;
  user.since_ids = user.since_ids || {};
  user.since_ids[data.timeline] = data.since_id;
  user.unreads = user.unreads || {};
  var timelineCount = (user.unreads[data.timeline] || 0) + data.statuses.length;
  user.unreads[data.timeline] = timelineCount;
  User.saveUser(user);
  this.refresh();
};

AccountController.prototype.showHeader = function (user) {
  var header = $("#header .user");
  header.find('.face, .name_link').attr('href', user.t_url);
  header.find('.face .icon').attr('src', user.profile_image_url);
  header.find('.face .bt').attr('src', 'images/blogs/' + user.blogType + '_16.png');
  header.find('.info .name').html(user.screen_name);
  var nums = '';
  var config = weibo.get_config(user);
  nums += user.name + '&nbsp;&nbsp;&nbsp;&nbsp;';
  nums += format(i18n.get("comm_counts_info"), user);
  if (user.favourites_count !== undefined) {
    nums += ', ' + user.favourites_count + i18n.get("comm_favourite");
  }
  header.find('.info .nums').html(nums);
};

AccountController.prototype.showUnreadTips = function (user) {
  var unreads = user.unreads || {};
  for (var timeline in unreads) {
    var count = unreads[timeline];
    $('.tab-' + timeline + ' .unreadCount').html(count || '').show();
  }
};

AccountController.prototype.refresh = function () {
  var currentUser = User.getUser();
  if (!currentUser) {
    return this;
  }
  this.showHeader(currentUser);
  this.showUnreadTips(currentUser);
  var users = User.getUserList();
  // 底部Dock
  var tpl = ' \
    <li class="{{uniqueKey}} {{_current}}" data-uid="{{uniqueKey}}"> \
      <span class="username">{{screen_name}}</span> \
      <a href="javascript:void(0);"><img src="{{profile_image_url}}" /></a> \
      <img src="images/blogs/{{blogType}}_16.png" class="blogType" /> \
      <span class="unr">{{unreadCount}}</span> \
    </li>';
  var html = '<ul>';
  for (var i = 0; i < users.length; i++) {
    var user = users[i];
    user.unreadCount = user.unreadCount || '';
    if (user.uniqueKey === currentUser.uniqueKey) {
      user._current = 'current';
    } else {
      user._current = '';
    }
    html += format(tpl, user);
  }
  html += '</ul>';
  $("#accountListDock").html(html);
  // 防止被用户列表遮挡
  $("#msgInfoWarp").css('bottom', 40);
  return this;
};

AccountController.prototype.change = function (event) {
  var userTab = $(this);
  var self = event.data.controller;
  var uniqueKey = userTab.data('uid');
  var toUser = User.getUserByUniqueKey(uniqueKey);
  if (!toUser) {
    // 用户被删除，刷新列表
    self.refresh();
    return;
  }
  
  var currentUser = getUser();
  // 获取当前的tab
  var currentTab = $(".tabs li.active");
  if (currentTab.length === 0) {
    // TODO: 一般不会出现这种情况
    currentTab = $(".tabs li:first");
  }

  if (currentUser.uniqueKey === uniqueKey) {
    currentTab.click();
    return;
  }
  
  User.setUser(toUser);
  self.refresh();

  stateManager.emit('user_change', currentUser, toUser);
};

function RefreshController() {
  this.timers = {}; // {uniqueKey: {}}
  stateManager.on('user_add', this.watch.bind(this));
  stateManager.on('user_remove', this.unwatch.bind(this));
};

RefreshController.prototype.watch = function (user) {
  var uniqueKey = user.uniqueKey;
  console.log('watch ' + uniqueKey);
  var timers = this.timers[uniqueKey] || {};
  var timelines = [
    ['friends_timeline', 120000],
    ['comments_timeline', 120000],
    // ['comments_mentions', 120000],
    ['mentions', 120000],
  ];
  timelines.forEach(function (item) {
    var timeline = item[0];
    var timeout = item[1];
    var timer = setInterval(function () {
      var user = User.getUserByUniqueKey(uniqueKey);
      var params = {};
      var since_id = user.since_ids && user.since_ids[timeline];
      if (since_id && since_id.id) {
        params.since_id = since_id.id;
        if (since_id.timestamp) {
          params.since_time = since_id.timestamp;
        }
      }
      weibo[timeline](user, params, function (err, result) {
        if (err) {
          return ui.showErrorTips(err);
        }
        var items = result.items;
        console.log(uniqueKey +' refresh ' + timeline + ' since_id ' + since_id + ': ' + items.length);
        if (items.length > 0) {
          stateManager.emit('new_statuses', {
            uniqueKey: uniqueKey,
            timeline: timeline,
            statuses: items,
            since_id: { id: items[0].id, timestamp: items[0].timestamp }
          });
        }
      });
    }, timeout);
    timers[timeline] = timer;
  });
  this.timers[uniqueKey] = timers;
};

RefreshController.prototype.unwatch = function (user) {
  var timers = this.timers[user.uniqueKey];
  if (!timers) {
    return;
  }
  for (var k in timers) {
    clearInterval(timers[k]);
    delete timers[k];
  }
  delete this.timers[user.uniqueKey];
};

function StatusCounterController() {
  stateManager.on('show_statuses', this.showCounts.bind(this));
}

StatusCounterController.prototype.showCounts = function (user, statuses, timeline) {
  var map = {};
  for (var i = 0; i < statuses.length; i++) {
    var status = statuses[i];
    map[status.id] = status;
    if (status.retweeted_status) {
      map[status.retweeted_status.id] = status.retweeted_status;
    }
  }
  var ids = Object.keys(map);
  var loading = $('#loading').show();
  console.log(timeline + ' count() ids: ' + ids.length + ' ' + JSON.stringify(ids));
  weibo.count(user, ids, function (err, counts) {
    loading.hide();
    if (err) {
      return ui.showErrorTips(err);
    }
    console.log('got counts: '+ counts.length);
    var isTQQ = user.blogtype === 'tqq';
    var isStatus = timeline.indexOf('comment') < 0;
    for (var i = 0, l = counts.length; i < l; i++) {
      var item = counts[i];
      $('#'+ timeline +'_timeline .showCounts_' + item.id).each(function () {
        var toolbar = $(this);
        // if (isTQQ && isStatus) {
        //   // 腾讯微博，需要使用原始微博的counts 替换转发的
        //   var $retweetLi = _li.find('.tweetItem:first');
        //   if ($retweetLi.length > 0) {
        //     return;
        //   }
        // }
        var editor = toolbar.find('.edit:eq(0)');
        if (!editor) {
          return;
        }
        editor.find('.repostCounts a').html(item.reposts);
        // _edit.find('.repostCounts').html('('+ item.reposts +')');
        // if (config.support_repost_timeline) {
        //   _edit.find('.repostCounts a').html(item.rt);
        // } else {
        //   _edit.find('.repostCounts').html('('+ item.rt +')');
        // }
        editor.find('.commentCounts a').html(item.comments);
        // if (isTQQ && isStatus) {
        //   // 腾讯微博，需要使用原始微博的counts 替换转发的
        //   var $retweetLi = _li.parents('.tweetItem:first');
        //   _edit = $retweetLi.find('.edit:eq(0)');
        //   if (!_edit) {
        //     return;
        //   }
        //   _edit.find('.repostCounts a').html(item.rt);
        //   // if (config.support_repost_timeline) {
        //   //   _edit.find('.repostCounts a').html(item.rt);
        //   // } else {
        //   //   _edit.find('.repostCounts').html('('+ item.rt +')');
        //   // }
        //   var _comm_txt = '(0)';
        //   if (item.comments > 0) {
        //     _comm_txt = '(<a href="javascript:void(0);" title="' + 
        //       i18n.get("comm_show_comments") +
        //       '" timeline_type="comment" onclick="showComments(this,' + 
        //       $retweetLi.attr('did') + ');">' + item.comments + '</a>)';
        //   }
        //   _edit.find('.commentCounts').html(_comm_txt);
        // }
      });
    }
  });
};



$(function () {
  resizeFawave();
  $(window).resize(function () {
    resizeFawave();
  });

  console.log('controllers init...');
  new RefreshController();

  new AccountController();
  new TimelineController();
  new FavoriteController();

  new TextContentController();
  new StatusController();
  new StatusCounterController();
  new CommentListController();
  console.log('controllers inited.');

  var currentUser = User.getUser();
  if (!currentUser) {
    window.location = 'options.html#user_set';
    // window.open('options.html#user_set', '_blank');
    // window.open('options.html', '_blank');
    // chrome.tabs.create({url: 'options.html#user_set'});
    return;
  }

});
