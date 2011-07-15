(function(){

window.FaWave = window.FaWave || {};

/*******
 * 内存缓存
 * 疑问：如果有多个窗口呢？各个窗口间怎样共享？是否需要一个内存缓存服务器？
 */
var MemoryCache = {
    // 保存数据
    _data: {},
    set: function(k, v){
        MemoryCache._data[k] = v;
    },
    get: function(k, _default){
        return MemoryCache._data[k] || _default;
    },
    remove: function(k){
        delete MemoryCache._data[k];
    }
};

/*******
 * win窗口缓存
 * 缓存到当前的window窗口中
 * 注意只是缓存到当前win窗口，如果新开的窗口，则两个窗口的缓存不一样的
 */
var WinCache = {
    set: function(k, v){
        WinCache._data[k] = v;
    },
    get: function(k, _default){
        return WinCache._data[k] || _default;
    },
    remove: function(k){
        delete WinCache._data[k];
    }
};
WinCache.__defineGetter__('_data', function(){
    Titanium.UI.currentWindow.winCache = Titanium.UI.currentWindow.winCache || {};
    return Titanium.UI.currentWindow.winCache;
});

/*******
 * Titanium Properties缓存
 */
var PropertiesCache = {
    set: function(k, v){
        Titanium.App.Properties.setString(k, JSON.stringify(v));
    },
    get: function(k, _default){
        var v;
        if(Titanium.App.Properties.hasProperty(k)){
            v = Titanium.App.Properties.getString(k);
        }
        if(v)
        {
            try{
                v = JSON.parse(v);
            }
            catch(err){
                v = null;
            }
        }
        return v || _default;
    },
    remove: function(k){
        Titanium.App.Properties.setString(k, '');
    }
};

/*******
 * 缓存总入口
 */
FaWave.Cache = {
    Memory: MemoryCache,
    Win: WinCache,
    Properties: PropertiesCache
};

})();