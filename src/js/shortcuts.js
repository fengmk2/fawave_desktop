/*!
 * fawave - js/shortcuts.js
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

/**
 * Shortcuts defines: https://github.com/fengmk2/fawave_desktop/issues/3
 *

Base on [Keypress](http://dmauro.github.com/Keypress/).

Support [vim basic shortcuts](http://shortcutkeys.org/software-shortcuts/linux/vim).

## Global
* i: show text input. Hide it when it opened.
* p: show photo input window
* @: show text input and @ user
* esc: close the input and dialog

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
* r: refresh current tab
* 1, 2, 3, 4, 5: change tab from left to right, top 5
* 0, 9, 8, 7: change tab from right to left, top 4, zero meaning the last tab

## Showing

* s + c: show comment dialog for current status
* s + r: show repost dialog for current status
* s + d: show direct message to current status' user dialog
* -: rt current status
* s + u: show current status's user timeline
* -: show current status's repost status's user timeline
* -: show my user timeline
* s + i: show current status's image, including repost.
* s + o + i: show original image.

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
  getCurrentWrap().scrollTop(current.top - current.ele.prev().height());
}

function nextStatus() {
  var current = findCurrentStatusView();
  getCurrentWrap().scrollTop(current.top + current.ele.height());
}

function nextPage() {
  var wrap = getCurrentWrap();
  wrap.scrollTop(wrap.scrollTop() + window.innerHeight);
}

function prevPage() {
  var wrap = getCurrentWrap();
  wrap.scrollTop(wrap.scrollTop() - window.innerHeight);
}

function goBottom() {
  var wrap = getCurrentWrap();
  var scrollHeight = wrap.prop('scrollHeight') - wrap.height();
  wrap.scrollTop(scrollHeight);
}

function globalPreCondition() {
  return $('#submitWarp').css('height') === '0px';
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
    method: 'click'
  },
  'r': {
    selecter: '.tabs .active',
    method: 'click'
  },
  'escape': {
    precondition: function () {
      return !globalPreCondition();
    },
    selecter: '#show_status_input',
    method: 'click'
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
    selecter: '.tabs .active:prev()',
    method: 'click'
  },
  'j': {
    handler: nextStatus
  },
  'k': {
    handler: prevStatus
  },
  'l': {
    selecter: '.tabs .active +',
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
    selecter: '.tabs .timeline_tab:not(hidden):eq(0)',
    method: 'click',
  },
  '2': {
    selecter: '.tabs .timeline_tab:not(hidden):eq(1)',
    method: 'click',
  },
  '3': {
    selecter: '.tabs .timeline_tab:not(hidden):eq(2)',
    method: 'click',
  },
  '4': {
    selecter: '.tabs .timeline_tab:not(hidden):eq(3)',
    method: 'click',
  },
  '5': {
    selecter: '.tabs .timeline_tab:not(hidden):eq(4)',
    method: 'click',
  },

  '7': {
    selecter: '.tabs .timeline_tab:not(hidden):eq(-4)',
    method: 'click',
  },
  '8': {
    selecter: '.tabs .timeline_tab:not(hidden):eq(-3)',
    method: 'click',
  },
  '9': {
    selecter: '.tabs .timeline_tab:not(hidden):eq(-2)',
    method: 'click',
  },
  '0': {
    selecter: '.tabs .timeline_tab:not(hidden):eq(-1)',
    method: 'click',
  },
};

Object.keys(binds).forEach(function (keys) {
  var item = binds[keys];
  var m = item.type || 'combo';
  keypress[m](keys, function() {
    console.log(keys);
    var precondition = item.precondition || globalPreCondition;
    if (!precondition()) {
      return;
    } 
    if (item.handler) {
      item.handler();
    } else {
      var selecter = item.selecter;
      var ele;
      if (selecter.indexOf(':prev()') > 0) {
        ele = $(selecter.replace(':prev()', '')).prev();
      } else if (selecter.indexOf(':next()') > 0) {
        ele = $(selecter.replace(':next()', ' +'));
      } else {
        ele = $(selecter);
      }
      ele[item.method]();
    }
    return false;
  });
});

});
