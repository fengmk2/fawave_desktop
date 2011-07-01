window.FaWave = window.FaWave || {};
FaWave.UI = {
};

/********
 * 多语言初始化
 */
FaWave.UI.i18nInit = function(){
	// Load the language code
    var code = FaWave.Setting.getValue('language');
    if(!code){
	    code = navigator.language.toLowerCase().replace('-', '_'); // e.g. zh-cn or en
    }
    FaWave.i18n.load(code);

    var _t, _v;
    $('[i18n]').each(function(){
        _t = $(this);
        _v = FaWave.i18n.getMessage(_t.attr('i18n'));
        if(_v){
            _t.text(_v);
        }
    });
};


/*******
 * 信息提示
 * TODO: 暂时用alert，后面再实现
 */
FaWave.UI.Msg = {
    alert: function(msg){
        window.alert(msg);
    },
    info: function(msg){
        window.alert(msg);
    },
    error: function(err){
        window.alert(msg);
    }
};