/**
 * Fast, min jquery : http://cubiq.org/do-you-really-need-jquery-for-mobile-dev
 */

(function() {
	// custom NodeList
	var QueryNodeList = function(query) {
		if(query.nodeType) {			// query is already a Node
			query = [query];
		} else if(typeof query == 'string') {	// query is a string
			query = document.querySelectorAll(query);
		} else if(!(query instanceof Array)) {	// if none of the above, query must be an array
			return null;
		}
		this.length = query.length;
		for(var i = 0, len = query.length; i < len; i++) {
			this[i] = query[i];
		}
		return this;
	};
	QueryNodeList.prototype = {
		each: function(callback) {
			for(var i = 0; i < this.length; i++) {
				callback.call(this[i]);
			}
			return this;
		},
		item: function(num) {
			return $(this[num]);
		},
		parent: function() {
			var parents = [];
			this.each(function() {
				var parent = this.parentNode;
				if (!parent._counted) { // check duplicate
					parents.push(parent);
					parent._counted = true;
				}
			});
			return $(parents).each(function() {
				delete this._counted;
			});
		},
		// Returns the first element className
		hasClass: function(classname) {
			return $.hasClass(this[0], classname);
		},
		// Add one or more classes to all elements
		addClass: function () {
			var className = arguments;
			for(var i = 0, l = className.length; i < l; i++) {
				this.each(function () {
					if (!$.hasClass(this, className[i])) {
						this.className = this.className ? this.className + ' ' + className[i] : className[i];
					}
				});
			}
			return this;
		},
		// Remove one or more classes from all elements
		removeClass: function () {
			var className = arguments;
			for(var i = 0, l = className.length; i<l; i++) {
				this.each(function() {
					this.className = this.className.replace(new RegExp('(^|\\s+)' + className[i] + '(\\s+|$)'), ' ');
				});
			}
			return this;
		},
		html: function (value) {
			if(value === undefined) {
				return this[0].innerHTML;
			}
			
			return this.each(function() {
				this.innerHTML = value;
			});
		},
		width: function(value) {
			if(value === undefined) {
				return this[0].clientWidth;
			}
			return this.each(function() {
				this.style.width = value + 'px';
			});
		},
		height: function(value) {
			if(value === undefined) {
				return this[0].clientHeight;
			}
			return this.each(function() {
				this.style.height = value === '' ? '' : value + 'px';
			});
		},
		bind: function(type, fn, capture) {
			return this.each(function() {
				this.addEventListener(type, fn, capture ? true : false);
			});
		},
		unbind: function(type, fn, capture) {
			return this.each(function() {
				this.removeEventListener(type, fn, capture ? true : false);
			});
		},
		style: function(attr, value) {
			if(typeof attr === 'string' && value === undefined) {
				return window.getComputedStyle(this[0], null).getPropertyValue(attr);
			}
			if(typeof attr != 'object') {
				// attr[attr] = value;
				attr = {attr: value};
			}
			return this.each(function() {
				for(var i in attr) {
					this.style[i] = attr[i];
				}
			});
		}
	};
	var fast = function(query) {
		return new QueryNodeList(query);
	};
	
	fast.extend = function(obj, target) {
		target = target || QueryNodeList.prototype;	// To help plugin development
		for(var prop in obj) {
			target[prop] = obj[prop];
		}
		return target;
	};
	
	var _ready_fn = [];
	var _dom_ready = function() {
		for(var i = 0, len = _ready_fn.length; i < len; i++) {
			_ready_fn[i]();
		}
		_ready_fn = null;
		document.removeEventListener('DOMContentLoaded', _dom_ready, false);
	};
	
	fast.extend({
		isIpad: (/ipad/gi).test(navigator.appVersion),
		isIphone: (/iphone/gi).test(navigator.appVersion),
		isAndroid: (/android/gi).test(navigator.appVersion),
		isOrientationAware: ('onorientationchange' in window),
		isHashChangeAware: ('onhashchange' in window),
		isStandalone: window.navigator.standalone,
		has3d: ('WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix()),

		// Execute functions on DOM ready
		ready: function (fn) {
			if(_ready_fn.length === 0) {
				document.addEventListener('DOMContentLoaded', _dom_ready, false);
			}
			_ready_fn.push(fn);
		},
		hasClass: function (el, className) {
			return new RegExp('(^|\\s)' + className + '(\\s|$)').test(el.className);
		},
		// TODO: ajax
		ajax: function(options) {
			
		},
		get: function() {
			
		},
		post: function() {
			
		},
		json: function(obj) {
			if(typeof obj === 'string') {
				return JSON.parse(obj);
			} else {
				JSON.stringify(obj);
			}
		}
	}, fast);
	
	window.$ = fast;
})();