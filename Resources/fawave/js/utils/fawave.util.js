/**
 * utils function use in fawave
 */

(function(){

var Base64 = weibo.base64.Base64;
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

})();
