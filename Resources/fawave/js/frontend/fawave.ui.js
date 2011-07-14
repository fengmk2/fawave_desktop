(function(){
/*******
 * 和UI相关的
 */

window.FaWave = window.FaWave || {};
FaWave.UI = {
    currentWindow: Titanium.UI.currentWindow
};

/********
 * 拖动窗口
 * @target: 要绑定拖动事件的元素(CSS选择器)
 */
FaWave.UI.regWinMove = function(target){
    target = $(target);
    target.bind('mousedown', function(e){
        target.addClass('moveable');
        target.bind('mousemove', {cX: e.clientX, cY: e.clientY}, __handleWinMove);
    });
    target.bind('mouseup', function(){
        target.removeClass('moveable');
        target.unbind('mousemove', __handleWinMove);
    });
};
function __handleWinMove(e){
    var win = Titanium.UI.currentWindow,
        x = (e.screenX - e.clientX) + (e.clientX - e.data.cX),
        y = (e.screenY - e.clientY) + (e.clientY - e.data.cY);
    win.setX(x);
    win.setY(y);
    e.stopPropagation();
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
            _t.html(_v);
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


})();