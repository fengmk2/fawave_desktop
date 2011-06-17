window.FaWave = window.FaWave || {};
FaWave.Store = {
};


// HTML5 localStorage ´æ´¢
// e.g. localStorage.setObject
Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
};

Storage.prototype.getObject = function(key) {
    var v = this.getItem(key);
    if(v)
    {
        try{
            v = JSON.parse(v);
        }
        catch(err){
            v = null;
        }
    }
    return v;
};
