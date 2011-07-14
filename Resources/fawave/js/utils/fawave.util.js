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


})();
