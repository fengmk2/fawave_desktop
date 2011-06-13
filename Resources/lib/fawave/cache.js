/**
 * Cache
 */

(function(){

Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
};

Storage.prototype.getObject = function(key) {
    var v = this.getItem(key);
    if(v) {
        try{
            v = JSON.parse(v);
        }
        catch(err){
            v = null;
        }
    }
    return v;
};

Fawave.Cache = {
	get: function(key) {
		return localStorage.getObject(key);
	}, 
	set: function(key, value) {
		return localStorage.setObject(key, value);
	},
	remove: function(key) {
		return localStorage.removeItem(key);
	}
};

})();