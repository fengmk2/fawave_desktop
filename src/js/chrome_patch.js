/*!
 * fawave - chrome patch
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 */

window.chrome = {
  isMock: true,
  __root: process.cwd(),
  extension: {
    getURL: function (path) {
      if (path[0] !== '/') {
        path = '/' + path;
      }
      return window.chrome.__root + path;
    },
    sendRequest: function () {

    }
  },
  tabs: {
    create: function (options) {
      location.href = options.url;
    },
    onUpdated: {
      addListener: function () {
        
      }
    }
  },
};