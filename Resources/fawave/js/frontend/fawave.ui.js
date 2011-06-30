window.FaWave = window.FaWave || {};
FaWave.UI = {
};

/********
 * ∂‡”Ô—‘≥ı ºªØ
 */
FaWave.UI.i18nInit = function(){
	// Load the language code
    var code = FaWave.Setting.getValue('language');
    if(!code){
	    code = navigator.language.toLowerCase(); // e.g. zh-cn or en
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