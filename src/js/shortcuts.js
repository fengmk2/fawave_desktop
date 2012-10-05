/*!
 * fawave - js/shortcuts.js
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

/**
 * Shortcuts defines: https://github.com/fengmk2/fawave_desktop/issues/3
 *

[Keypress](http://dmauro.github.com/Keypress/)

## Global
* i: show text input. Hide it when it opened.
* p: show photo input window
* @: show text input and @ user
* r: refresh current tab
* esc: close the input and dialog

## User

* < or >: change user

## Status and Tab

### Moving

* h: left tab
* l: right tab
* j: down, next status view
* k: up, prev status view
* g + t: go to top

### Showing

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
    ele: ele,
    top: height - ele.height()
  };
}

function prevStatus() {
  var current = findCurrentStatusView();
  var top = current.top;
  var prevEle = current.ele.prev();
  if (prevEle.length) {
    top = top - prevEle.height();
    if (top < 0) {
      top = 0;
    }
  }
  getCurrentWrap().scrollTop(top);
}

function nextStatus() {
  var current = findCurrentStatusView();
  var padding = current.ele.height();
  getCurrentWrap().scrollTop(current.top + padding);
}

function prevTab() {
  $('.tabs .active').prev().click();
}

var binds = {
  // format: key: {
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
  'g t': {
    selecter: '#gototop',
    method: 'click',
  },

  // Moving
  'h': {
    handler: prevTab
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
  }

};

Object.keys(binds).forEach(function (keys) {
  var m = keys.indexOf(' ') >= 0 ? 'sequence_combo' : 'combo';
  var item = binds[keys];
  keypress[m](keys, function() {
    if (item.handler) {
      item.handler();
    } else {
      $(item.selecter)[item.method]();
    }
    return false;
  });
});

});
