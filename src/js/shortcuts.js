/*!
 * fawave - js/shortcuts.js
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

/**
 * Shortcuts defines: https://github.com/fengmk2/fawave_desktop/issues/3
 * 
 * Base on [Keypress](http://dmauro.github.com/Keypress/).
 * Support [vim basic shortcuts](http://shortcutkeys.org/software-shortcuts/linux/vim).
 * 
 */


/**
 * 
<cheatsheet>

<pre>
# Shortcuts Cheat Sheet

## Global
* i: show text input. Hide it when it opened.
* m: show shortcuts cheat sheet.
* esc: exit the input mode, close the opening dialog and preview popbox.

## Account

* < or >: change user
* shift + (1, 2, 3, 4, ..., 6): top 7 user from left to right
* shift + (0, 9, 8, 7): top 4 user from right to left, zero meaning last user

## Timeline View

* h: left tab
* l: right tab
* j: down, next status view
* k: up, prev status view
* ctrl + f: next timeline page
* ctrl + b: prev timeline page
* shift + g: go to the bottom
* g + g: go to the top
* shift + r: refresh current tab
* 1, 2, 3, 4, 5: change tab from left to right, top 5
* 0, 9, 8, 7: change tab from right to left, top 4, zero meaning the last tab

## Status

* s + c: show status comments
* s + r: show status reposts
* s + o + c: show original status comments
* s + o + r: show original status reposts
* s + p: show preview current status's photo, including repost.

## Comment list Paging

 * ctrl + n: next page
 * ctrl + p: prev page

## Operations

* a + c: add comment for current status
* a + r: add repost for current status
* a + f: add favorite
* a + d: add direct message to current status' user

## Show

* -: rt current status
* -: show current status's user timeline
* -: show current status's repost status's user timeline
* -: show my user timeline

</pre>
</cheatsheet> 
 *
 */

$(function() {

function getCurrentWrap() {
  var timeline = $('.tabs .active').data('type');
  var wrap = $('#' + timeline + '_timeline .list_warp');
  return wrap;
}

function findCurrentStatusView() {
  var wrap = getCurrentWrap();
  var items = wrap.find('li.tweetItem');
  var scrollTop = wrap.scrollTop();
  var ele = null;
  var height = 0;
  items.each(function (i) {
    var e = $(this);
    height += e.height();
    if (scrollTop < height) {
      ele = e;
      return false;
    }
  });
  return {
    ele: ele || items,
    top: ele ? height - ele.height() : 0
  };
}

function prevStatus() {
  var current = findCurrentStatusView();
  var prev = current.ele.prev();
  if (prev.length) {
    prev.find('.edit').show();
    current.ele.find('.edit').removeAttr('style');
  } else {
    current.ele.find('.edit').show();
  }
  getCurrentWrap().scrollTop(current.top - prev.height());
}

function nextStatus() {
  var current = findCurrentStatusView();
  current.ele.find('.edit').removeAttr('style');
  current.ele.next().find('.edit').show();
  getCurrentWrap().scrollTop(current.top + current.ele.height());
}

function nextPage() {
  var wrap = getCurrentWrap();
  wrap.scrollTop(wrap.scrollTop() + wrap.height());
}

function prevPage() {
  var wrap = getCurrentWrap();
  wrap.scrollTop(wrap.scrollTop() - wrap.height());
}

function goBottom() {
  var wrap = getCurrentWrap();
  var scrollHeight = wrap.prop('scrollHeight') - wrap.height();
  wrap.scrollTop(scrollHeight);
}

function globalPreCondition() {
  return $('#submitWarp').css('height') === '0px' && $('#ye_dialog_window').is(':hidden');
}

var binds = {
  // format: key: {
  //   [precondition]: precondition for key press take effect
  //   type: 'sequence_combo' or 'combo'
  //   selecter: '#css selecter',
  //   method: 'click',
  //   handler: handler function
  // }
  
  // Global
  'i': {
    selecter: '#show_status_input',
    method: 'click',
  },
  'm': {
    selecter: '#scs',
    method: 'click',
  },
  'escape': {
    precondition: function () {
      return true;
    },
    handler: function () {
      if ($('#submitWarp').css('height') !== '0px') {
        $('#show_status_input').click();
      }
      if (!$('#ye_dialog_window').is(':hidden')) {
        $('#ye_dialog_close').click();
      }
      $('.comments').hide();
      $('#popup_box .pb_close').click();
    }
  },

  // Account
  'left': {
    selecter: '#accountListDock li.current:prev()',
    method: 'click'
  },
  'right': {
    selecter: '#accountListDock li.current:next()',
    method: 'click'
  },
  // top 10 account
  '!': {
    selecter: '#accountListDock li:eq(0)',
    method: 'click',
  },
  '@': {
    selecter: '#accountListDock li:eq(1)',
    method: 'click',
  },
  '#': {
    selecter: '#accountListDock li:eq(2)',
    method: 'click',
  },
  '$': {
    selecter: '#accountListDock li:eq(3)',
    method: 'click',
  },
  '%': {
    selecter: '#accountListDock li:eq(4)',
    method: 'click',
  },
  '^': {
    selecter: '#accountListDock li:eq(5)',
    method: 'click',
  },
  // shift 7
  '&': {
    selecter: '#accountListDock li:eq(-4)',
    method: 'click',
  },
  '*': {
    selecter: '#accountListDock li:eq(-3)',
    method: 'click',
  },
  '(': {
    selecter: '#accountListDock li:eq(-2)',
    method: 'click',
  },
  ')': {
    selecter: '#accountListDock li:eq(-1)',
    method: 'click',
  },

  // Timeline View
  'h': {
    selecter: '.tabs .active:prev(.timeline_tab)',
    method: 'click'
  },
  'j': {
    handler: nextStatus
  },
  'k': {
    handler: prevStatus
  },
  'l': {
    selecter: '.tabs .active:next(.timeline_tab)',
    method: 'click'
  },
  'shift r': {
    selecter: '.tabs .active',
    method: 'click'
  },
  'g g': {
    selecter: '#gototop',
    method: 'click',
    type: 'sequence_combo'
  },
  'shift g': {
    handler: goBottom,
    type: 'sequence_combo'
  },
  'ctrl f': {
    handler: nextPage
  },
  'ctrl b': {
    handler: prevPage
  },
  '1': {
    selecter: '.tabs .timeline_tab:not(:hidden):eq(0)',
    method: 'click',
  },
  '2': {
    selecter: '.tabs .timeline_tab:not(:hidden):eq(1)',
    method: 'click',
  },
  '3': {
    selecter: '.tabs .timeline_tab:not(:hidden):eq(2)',
    method: 'click',
  },
  '4': {
    selecter: '.tabs .timeline_tab:not(:hidden):eq(3)',
    method: 'click',
  },
  '5': {
    selecter: '.tabs .timeline_tab:not(:hidden):eq(4)',
    method: 'click',
  },

  '7': {
    selecter: '.tabs .timeline_tab:not(:hidden):eq(-4)',
    method: 'click',
  },
  '8': {
    selecter: '.tabs .timeline_tab:not(:hidden):eq(-3)',
    method: 'click',
  },
  '9': {
    selecter: '.tabs .timeline_tab:not(:hidden):eq(-2)',
    method: 'click',
  },
  '0': {
    selecter: '.tabs .timeline_tab:not(:hidden):eq(-1)',
    method: 'click',
  },

  // Status
  's c': {
    selecter: 'currentStatus() .commentCounts a:first',
    method: 'click',
    type: 'sequence_combo'
  },
  's o c': {
    selecter: 'currentStatus() .commentCounts a:eq(1)',
    method: 'click',
    type: 'sequence_combo'
  },
  's r': {
    selecter: 'currentStatus() .repostCounts a:first',
    method: 'click',
    type: 'sequence_combo'
  },
  's o r': {
    selecter: 'currentStatus() .repostCounts a:eq(1)',
    method: 'click',
    type: 'sequence_combo'
  },
  's p': {
    selecter: 'currentStatus() .thumbnail_pic:first',
    method: 'click',
    type: 'sequence_combo'
  },

  // Operations
  'a c': {
    selecter: 'currentStatus() .commenttweet:first',
    method: 'click',
    type: 'sequence_combo'
  },
  'a o c': {
    selecter: 'currentStatus() .commenttweet:eq(1)',
    method: 'click',
    type: 'sequence_combo'
  },
  'a r': {
    selecter: 'currentStatus() .reposttweet:first',
    method: 'click',
    type: 'sequence_combo'
  },
  'a o r': {
    selecter: 'currentStatus() .reposttweet:eq(1)',
    method: 'click',
    type: 'sequence_combo'
  },
  'a f': {
    selecter: 'currentStatus() .li_wrap .add_favorite_btn:first',
    method: 'click',
    type: 'sequence_combo'
  },
  // 'a d': {
  //   selecter: 'currentStatus() .li_wrap .add_favorite_btn:first',
  //   method: 'click',
  //   type: 'sequence_combo'
  // },
  
  // Paging
  'ctrl n': {
    selecter: 'currentStatus() .comments:not(:hidden) .next_page:not(:hidden):first',
    method: 'click',
  },
  'ctrl p': {
    selecter: 'currentStatus() .comments:not(:hidden) .pre_page:not(:hidden):first',
    method: 'click',
  },
};

Object.keys(binds).forEach(function (keys) {
  var item = binds[keys];
  var m = item.type || 'combo';
  keypress[m](keys, function() {
    var precondition = item.precondition || globalPreCondition;
    if (!precondition()) {
      return;
    }
    if (item.handler) {
      item.handler();
    } else {
      var selecter = item.selecter;

      // expression selecter will compile at the first time. 
      if (selecter.indexOf(':prev(') > 0) {
        var prevIndex = selecter.indexOf(':prev(');
        item.selecter1 = selecter.substring(0, prevIndex);
        item.selecter2 = selecter.substring(prevIndex + 6, selecter.lastIndexOf(')'));
        item.handler = function () {
          var e = $(this.selecter1).prevAll(this.selecter2 + ':visible:first');
          if (e.length === 0) {
            e = $(this.selecter1).siblings(this.selecter2 + ':visible:last');
          }
          e[this.method]();
        };
        item.handler();
        return;
      }
      if (selecter.indexOf(':next(') > 0) {
        var nextIndex = selecter.indexOf(':next(');
        item.selecter1 = selecter.substring(0, nextIndex);
        item.selecter2 = selecter.substring(nextIndex + 6, selecter.lastIndexOf(')'));
        item.handler = function () {
          var e = $(this.selecter1).nextAll(this.selecter2 + ':visible:first');
          if (e.length === 0) {
            e = $(this.selecter1).siblings(this.selecter2 + ':visible:first');
          }
          e[this.method]();
        };
        item.handler();
        return;
      }
      if (selecter.indexOf('currentStatus()') >= 0) {
        item.selecter = selecter.replace('currentStatus()', '');
        item.handler = function () {
          var current = findCurrentStatusView().ele;
          current.find(this.selecter)[this.method]();
        };
        item.handler();
        return;
      }

      $(selecter)[item.method]();
    }
  });
});

});
