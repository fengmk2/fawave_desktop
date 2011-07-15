/**
 * utils function use in fawave
 */

(function(){

window.FaWave = window.FaWave || {};
FaWave.Util = {
	secret_key: '523f2d0d134bfd5aa138f9e5af828bf9',
	encrypt: function(s) {
		return Base64.strcode(s, this.secret_key);
	},
	decrypt: function(s) {
		return Base64.strcode(s, this.secret_key, true);
	}
};

// URL相关的函数
FaWave.Util.Url = {
    queryStrings: function(url){
        var r = null;
        if(url && url.indexOf('?')>0){
            var qs = url.slice(url.indexOf('?')+1, url.indexOf('#') > -1 ? url.indexOf('#') : url.length);
            qs = qs.split('&');
            qs.forEach(function(item){
                item = item.split('=');
                if(item && item.length==2 && item[0]){
                    r = r || {};
                    r[ item[0] ] = item[1];
                }
            });
        }
        return r;
    }
};

// Monkey patch
//格式化时间输出。示例：new Date().format("yyyy-MM-dd hh:mm:ss");
Date.prototype.format = function(format)
{
	var o = {
		"M+" : this.getMonth()+1, //month
		"d+" : this.getDate(),    //day
		"h+" : this.getHours(),   //hour
		"m+" : this.getMinutes(), //minute
		"s+" : this.getSeconds(), //second
		"q+" : Math.floor((this.getMonth()+3)/3), //quarter
		"S" : this.getMilliseconds() //millisecond
	};
	if(/(y+)/.test(format)) {
		format=format.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
	}

	for(var k in o) {
		if(new RegExp("("+ k +")").test(format)) {
			format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
		}
	}
	return format;
};

/**
 * 格式化字符串 from tbra
 * eg:
 * 	formatText('{0}天有{1}个小时', [1, 24]) 
 *  or
 *  formatText('{{day}}天有{{hour}}个小时', {day:1, hour:24}}
 * @param {Object} msg
 * @param {Object} values
 */
function formatText(msg, values, filter) {
    var pattern = /\{\{([\w\s\.\(\)"',-\[\]]+)?\}\}/g;
    return msg.replace(pattern, function(match, key) {
    	var value = values[key] || eval('(values.' +key+')');
        return jQuery.isFunction(filter) ? filter(value, key) : value;
    });	
};

// 让所有字符串拥有模板格式化
String.prototype.format = function(data) {
	return formatText(this, data);
};

String.prototype.endswith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

// 为字符串增加去除所有html tag和空白的字符的方法
String.prototype.remove_html_tag = function() {
	return this.replace(/(<.*?>|&nbsp;|\s)/ig, '');
};

// HTML 编码
function HTMLEnCode(str){
    if(!str){ return ''; }
    str = str.replace(/</ig, '&lt;').replace(/>/ig, '&gt;');
//    str = str.replace(/\&lt;br\s*\/?\&gt;/ig, '<br />');
    // 支持<br/>
    return str;
};

window.htmlencode = HTMLEnCode;

// html转换为text
function htmlToText(html){
   var tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.innerText;
};

window.htmldecode = htmlToText;


})();
