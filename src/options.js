
var i18n = require('./js/i18n');
var User = require('./js/user');
var utils = require('./js/utils');
var setting = require('./js/setting');
var weibo = require('weibo');
var urlparse = require('url').parse;

var T_LIST = utils.T_LIST;
var tabDes = utils.tabDes;

var KEYCODE_MAP = {
  8:"BackSpace", 9:"Tab", 12:"Clear", 13:"Enter", 16:"Shift", 17:"Ctrl", 18:"Alt", 19:"Pause", 
  20:"Caps Lock", 27:"Escape", 32:"Space", 33:"Prior", 34:"Next", 35:"End", 36:"Home", 
  37:"Left", 38:"Up", 39:"Right", 40:"Down", 41:"Select", 42:"Print", 43:"Execute", 
  45:"Insert", 46:"Delete", 47:"Help", 48:"0", 49:"1", 50:"2", 51:"3", 52:"4", 53:"5", 
  54:"6", 55:"7", 56:"8", 57:"9", 65:"A", 66:"B", 67:"C", 68:"D", 69:"E", 70:"F", 71:"G", 
  72:"H", 73:"I", 74:"J", 75:"K", 76:"L", 77:"M", 78:"N", 79:"O", 80:"P", 81:"Q", 82:"R", 
  83:"S", 84:"T", 85:"U", 86:"V", 87:"W", 88:"X", 89:"Y", 90:"Z", 96:"KP_0", 97:"KP_1", 
  98:"KP_2", 99:"KP_3", 100:"KP_4", 101:"KP_5", 102:"KP_6", 103:"KP_7", 104:"KP_8", 105:"KP_9", 
  106:"KP_Multiply", 107:"KP_Add", 108:"KP_Separator", 109:"KP_Subtract", 110:"KP_Decimal", 
  111:"KP_Divide", 112:"F1", 113:"F2", 114:"F3", 115:"F4", 116:"F5", 117:"F6", 118:"F7", 
  119:"F8", 120:"F9", 121:"F10", 122:"F11", 123:"F12", 124:"F13", 125:"F14", 126:"F15", 
  127:"F16", 128:"F17", 129:"F18", 130:"F19", 131:"F20", 132:"F21", 133:"F22", 134:"F23", 
  135:"F24", 136:"Num_Lock", 137:"Scroll_Lock", 187:"acute", 188:"comma", 189:"minus", 
  190:"period", 192:"numbersign", 210:"plusminus", 211:"211", 212:"copyright", 213:"guillemotleft", 
  214:"masculine", 215:"AE", 216:"cent", 217:"questiondown", 218:"onequarter", 220:"less", 
  221:"plus", 227:"multiply", 228:"Acircumflex", 229:"Ecircumflex", 230:"Icircumflex", 
  231:"Ocircumflex", 232:"Ucircumflex", 233:"Ntilde", 234:"Yacute", 235:"Ooblique", 236:"Aring", 
  237:"Ccedilla", 238:"THORN", 239:"ETH", 240:"diaeresis", 241:"Agrave", 242:"Egrave", 243:"Igrave", 
  244:"Ograve", 245:"Ugrave", 246:"Adiaeresis", 247:"Ediaeresis", 248:"Idiaeresis", 
  249:"Odiaeresis", 250:"Udiaeresis", 251:"ssharp", 252:"asciicircum", 253:"sterling", 
  254:"Mode_switch"
};

var SUPPORT_AUTH_TYPES = {
  'weibo': ['oauth'],
  'tsina': ['oauth'],
  'tqq': ['oauth'],
  'tsohu': ['oauth', 'baseauth'],
  't163': ['oauth', 'xauth'],
  'fanfou': ['oauth'],
  'renren': ['oauth'],
  'diandian': ['oauth'],
  'digu': ['baseauth'],
  'leihou': ['baseauth'],
  'twitter': ['oauth', 'baseauth'],
  'douban': ['oauth'],
  'googleplus': ['oauth'],
  'facebook': ['oauth'],
  'plurk': ['baseauth'],
  'identi_ca': ['oauth', 'baseauth'],
  'tianya': ['oauth'],
  't_taobao': ['baseauth'],
  'tumblr': ['baseauth']
};

var AUTH_TYPE_NAME = {
  'baseauth': 'Basic Auth',
  'oauth': i18n.get("comm_oauth_name"),
  'xauth': i18n.get("comm_xauth_name")
};

var TWEEN_TYPES = [
  'Quad', 'Cubic', 'Quart', 'Quint', 'Sine', 'Expo', 'Circ', 
  'Elastic', 'Back', 'Bounce'
];

function donateRoll() {
    $.get('http://api.yongwo.de/json/fawave_donaters.json', function (data) {
        if (data && data.users && data.users.length > 0) {
            var _h = '';
            $(data.users).each(function () {
                _h += '<li><a target="_blank" href="{{homepage}}" title="{{username}}"><img src="{{face}}" /></a></li>'.format(this);
            });

            $("#donateUsers").html(_h);
            var _wrap=$('#donateUsers');//定义滚动区域
            var _interval = 2000;//定义滚动间隙时间
            var _moving; //需要清除的动画
            _wrap.hover(function () {
              clearInterval(_moving);//当鼠标在滚动区域中时,停止滚动
            }, function () {
                _moving = setInterval(function () {
                    var _field=_wrap.find('li:first');//此变量不可放置于函数起始处,li:first取值是变化的
                    var _h=_field.width();//取得每次滚动高度(多行滚动情况下,此变量不可置于开始处,否则会有间隔时长延时)
                    _field.animate({ marginLeft: - _h + 'px' }, 600, function () {//通过取负margin值,隐藏第一行
                        _field.css('marginLeft','').appendTo(_wrap);//隐藏后,将该行的margin值置零,并插入到最后,实现无缝滚动
                    });
                }, _interval);
                //滚动间隔时间取决于_interval
            }).trigger('mouseleave');//函数载入时,模拟执行mouseleave,即自动滚动
        }
    });
}

$(function () {
  // TODO: fixed this on node-webkit
    //donateRoll();
    initTab();

    showDndAccountList(true);

    init();
    
    initExportImport();

    // 显示版本号
    var version;
    // $.get(chrome.extension.getURL('manifest.json'), function(info){
    //     $("#header .logo h1").append('<br/><span style="color:#D51920">V' + info.version + '</span>');
    // }, 'json');

    $("#refresh-account").click(function(){
        refreshAccountInfo();
    });

    $("#show-new-account").click(function(){
        $("#save-account").val(i18n.get("comm_add"));
        $("#account-name").val('');
        $("#account-pwd").val('');
        $("#edit-account-key").val('');
        $("#account-pin, #account-request-token-key, #account-request-token-secret").val('');
        onSelBlogTypeChange();
        $("#edit-account-info").hide();
        $("#new-account").show();
        $("#user-custom-wrap").hide();
    });

    $("#cancel-save-account, #cancel-save-user-custom").click(function(){
        $("#new-account, #user-custom-wrap, #edit-account-info").hide();
    });

    $("#save-account").click(function () {
        saveAccount();
    });
    
    $("#get-account-pin").click(function () {
        $('#account-request-token-key').val('');
        $('#account-request-token-secret').val('');
        saveAccount();
        $(this).fadeOut(500).delay(5000).fadeIn(500);
    });

    $("#show-edit-account").click(function(){
        var uniqueKey = $("#account-list").val();
        $("#edit-account-key").val(uniqueKey);
        $("#edit-account-info").show().find('h3').html($(this).text()).end().find('.ainfo').html($("#account-list :selected").text());
        showEditAccount(uniqueKey);
    });

    $("#gRefreshTimeWrap input").change(function () {
        calculateGlobalRefreshTimeHits();
    });

    $("#cleanLocalStorage").click(function () {
        if (confirm(i18n.get("confirm_clean_local_storage"))) {
            cleanLocalStorageData();
        }
    });

    $("#save-all").click(function(){
        saveAll();
    });
    
    var settings = setting.Settings.get();
    // 设置是否记录上次浏览状态
    $('#remember_view_status_cb').attr('checked', settings.remember_view_status);
    
    // 绑定认证类型变化时的显示切换
    $("#account-authType").change(function () {
        if ($(this).val() === 'oauth') {
            $('.account-oauth').show();
            $('.account-baseauth').hide('');
        } else {
            $('.account-oauth').hide();
            $('.account-baseauth').show('');
            // 清空缓存的数据
            $('#account-pin').val('');
            $('#account-request-token-key').val('');
            $('#account-request-token-secret').val('');
        }
    });

    //检查url中有没 #user_set 之类的，有就定位到指定tab
    if (window.location.hash) {
        $("#navigation li[target_id=" + window.location.hash + "] a").click();
    }
    
    // 显示语言选项
    var tanslate_options = '';
    var Languages = utils.Languages;
    for (var k in Languages) {
        tanslate_options += '<option value="{{value}}">{{name}}</option>'.format({name: k, value: Languages[k]});
    }
    var settings = setting.Settings.get();
    $('#translate_target').html(tanslate_options).val(settings.translate_target);
    
    // 缩址服务选择
    var shorturls_options = '';
    var ShortenUrl = utils.ShortenUrl;
    for (var k in ShortenUrl.services) {
        shorturls_options += '<option value="{{value}}">{{name}}</option>'.format({name: k, value: k});
    }
    var settings = setting.Settings.get();
    $('#shorten_url_service').html(shorturls_options).val(settings.shorten_url_service);
    
    // 图片服务选择
    var image_service_options = '';
    var ImageService = utils.ImageService;
    for (var k in ImageService.services) {
        var service = ImageService.services[k];
        if (service.upload) {
            image_service_options += '<option value="{{value}}">{{name}}</option>'.format({name: service.host, value: k});
        }
    }
    var settings = setting.Settings.get();
    $('#image_service').html(image_service_options).val(settings.image_service);
    if (settings.enable_image_service) {
        $('#enableImageService').attr('checked', true);
    } else {
        $('#enableImageService').removeAttr('checked');
    }

    if(settings.show_network_error) {
        $('#show_network_error').attr('checked', true);
    } else {
        $('#show_network_error').removeAttr('checked');
    }
    
    // 设在instapaper, read it later, vdisk 帐号
    var settings = setting.Settings.get();
    var readlater_services = ['instapaper', 'readitlater', 'vdisk'];
    for(var i = 0, len = readlater_services.length; i < len; i++) {
        var service_name = readlater_services[i];
        var service_user = settings[service_name + '_user'];
        if (service_user) {
            $('#' + service_name + '_username').val(service_user.username);
            $('#' + service_name + '_password').val(service_user.password);
            $('#delete_' + service_name + '_account_btn').show();
        }
        $('#set_' + service_name + '_account_btn').attr('service', service_name).click(function() {
            var service_type = $(this).attr('service');
            var username = $.trim($('#' + service_type + '_username').val());
            if(!username) {
                $('#' + service_type + '_username').focus().select();
                return;
            }
            var password = $('#' + service_type + '_password').val();
            if(!password) {
                $('#' + service_type + '_password').focus();
                return;
            }
            var user = {username: username, password: password};
            var services = {
                instapaper: Instapaper,
                readitlater: ReadItLater,
                vdisk: VDiskAPI
            };
            var service = services[service_type];
            var save_user = function (st, user) {
                var settings = setting.Settings.get();
                settings[st + '_user'] = user;
                Settings.save();
                _showMsg(i18n.get("msg_save_success"));
                $('#delete_' + st + '_account_btn').show();
            };
            if (service_type === 'vdisk') {
                if ($('#vdisk_use_sinat').attr('checked')) {
                    user.app_type = 'sinat';
                }
                service.get_token(user, function(err, result) {
                    if(err) {
                        _showMsg(err.message || i18n.get("msg_wrong_name_or_pwd"));
                    } else {
                        save_user(service_type, user);
                    }
                });
            } else {
                service.authenticate(user, function(result){
                    if(result) {
                        save_user(service_type, user);
                    } else {
                        _showMsg(i18n.get("msg_wrong_name_or_pwd"));
                    }
                });
            }
        });
        $('#delete_' + service_name + '_account_btn').attr('service', service_name).click(function() {
            var service_type = $(this).attr('service');
            var settings = setting.Settings.get();
            settings[service_type + '_user'] = null;
            Settings.save();
            $('#' + service_type + '_username').val('');
            $('#' + service_type + '_password').val('');
            $(this).hide();
        });
    }
});

//统计全局的刷新间隔设置产生的请求次数
function calculateGlobalRefreshTimeHits() {
  var T_LIST = utils.T_LIST;
    var total = 0, refTime = 0, refTimeInp = null, timelimes = T_LIST.all;
    for(var i in timelimes){
        refTimeInp = $("#gRefreshTime_" + timelimes[i]);
        refTime = Number(refTimeInp.val());
        if(isNaN(refTime)){
            refTime = Settings.defaults.globalRefreshTime[timelimes[i]];
        }else if(refTime<30){
            refTime = 30;
        }
        refTimeInp.val(refTime);
        total += Math.round(60*60/refTime);
    }
    $("#gRefreshTimeHits").html(total);
}

//统计用户自定义的刷新间隔设置产生的请求次数
function calculateUserRefreshTimeHits(user) {
  var total = 0, refTime = 0, refTimeInp = null, timelines = T_LIST[user.blogType];
  for (var i in timelines){
    var type = timelines[i];
    if (user.refreshTime && user.refreshTime[type]) {
      refTime = user.refreshTime[type];
    } else {
      refTime = 0;
    }
    if (refTime === 0) {
      refTime = setting.Settings.get().globalRefreshTime[type] || 120;
    }
    total += Math.round(60 * 60 / refTime);
  }
  return total;
}

//检查用户输入的刷新时间并计算设置产生的请求次数，然后保存
function checkUserRefreshTimeHitsAndSave(inp) {
    inp = $(inp);
    var refTime = 0, total = 0, _li = inp.closest('li');
    
    var uniqueKey = _li.attr('uniqueKey');
    var userList = User.getUserList('all');
    var user = null;
    $.each(userList, function(i, item) {
        if (item.uniqueKey === uniqueKey){
            user = item;
            return false;
        }
    });
    if(!user){
        return;
    }
    user.refreshTime = user.refreshTime || {};
    
    _li.find('.inpRefTime').each(function(){
        refTime = Number($(this).val());
        if(isNaN(refTime)){
            refTime = 0;
        }else if(refTime!==0 && refTime<30){
            refTime = 30;
        }
        $(this).val(refTime);
        user.refreshTime[$(this).attr('t')] = refTime;
        if (refTime === 0) {
            refTime = setting.Settings.get().globalRefreshTime[$(this).attr('t')];
        }
        total += Math.round(60*60/refTime);
    });
    _li.find('.refHits').html(total);
    saveUserList(userList);
    var b_view = getBackgroundView();
    if (b_view) {
        b_view.RefreshManager.restart();
    }
    _showMsg(i18n.get("msg_interval_update_success"));
}

var curthas = checkUserRefreshTimeHitsAndSave;

function showDndAccountList(bindDnd) {
    var userList = User.getUserList('all');
    var userCount = 0;
    var needRefresh = false;
    if (userList) {
        var op = '';
        //var tpl = '<option value="{{uniqueKey}}">({{statName}}) ({{blogTypeName}}) {{screen_name}}</option>';
        var tpl = '<li id="dnd_a_{{uniqueKey}}" class="{{uniqueKey}} {{stat}} clearFix" uniqueKey="{{uniqueKey}}" stat="{{stat}}">' +
                '<div class="face_img drag">' +
                '   <a class="face" href="javascript:"><img src="{{profile_image_url}}"></a>' +
                '   <img src="images/blogs/{{blogType}}_16.png" class="blogType">' +
                '</div>' +
                '<div class="detail">' +
                '   <div class="item"><span class="userName">{{screen_name}}</span>({{blogTypeName}})' +
                '       <div class="stat"><span class="statName">{{statName}}</span><span class="nav-arrow">&nbsp;</span>' +
                '           <div><ul><li class="enabled" onclick="changeAccountStatus(\'{{uniqueKey}}\', \'enabled\')">'+ i18n.get("comm_enabled") +'</li>' +
                '               <li class="onlysend" onclick="changeAccountStatus(\'{{uniqueKey}}\', \'onlysend\')">'+ i18n.get("comm_send_only") +'</li>' +
                '               <li class="disabled" onclick="changeAccountStatus(\'{{uniqueKey}}\', \'disabled\')">'+ i18n.get("comm_disabled") +'</li></ul>' +
                '           </div>' +
                '       </div>' +
                '       <span class="edit">' +
                '   <button class="button_white button_small" onclick="delAccount(\'{{uniqueKey}}\')"><img src="images/delete.png">'+ i18n.get("comm_del_user") + '</button>' +
                '   <button class="button_white button_small" onclick="refreshAccountAuth(\'{{uniqueKey}}\')"><img src="images/refresh.png">'+ i18n.get("comm_refresh_user_auth") + '</button>' +
                ' </span>' +
                '   </div>' +
                '   <div class="item item2">' +
                '       <span><span>'+ i18n.get("sett_refresh_interval") +':  </span><span class="userRefreshTimeWrap">{{refTimeHtml}}</span></span>' +
                '   </div>' +
                '</div>' +
                '</li>';
        for (var j = 0, jlen = userList.length; j < jlen; j++) {
            userCount++;
            var user = userList[j];
            if (!user.uniqueKey){ //兼容单微博版本
                needRefresh = true;
            } else {
                user.blogTypeName = utils.T_NAMES[user.blogType];
                user.statName = user.disabled ? _u.i18n("comm_disabled") : (user.only_for_send ? i18n.get("comm_send_only") : i18n.get("comm_enabled"));
                user.stat = user.disabled ? 'disabled' : (user.only_for_send ? 'onlysend' : 'enabled');
                
                //绑定用户自定刷新时间
                var refTime = 0, timelines = T_LIST[user.blogtype], c_html = '';
                for (var i = 0, len = timelines.length; i < len; i++) {
                  var timelineType = timelines[i];
                  if (c_html) {
                    c_html += ', ';
                  }
                  c_html += utils.tabDes[timelineType];

                  c_html += '('+ (setting.Settings.get().globalRefreshTime[timelineType] || 120) +')';
                  if (user.refreshTime && user.refreshTime[timelineType]) {
                    refTime = user.refreshTime[timelineType];
                  } else{ 
                    refTime = 0;
                  }
                  c_html += '<input type="text" t="' + timelineType + '" value="' + refTime +'" class="inpRefTime" onchange="curthas(this)" />' + i18n.get("comm_second");
                }
                c_html += ' (<span class="refHits">' + calculateUserRefreshTimeHits(user) + '</span>'+ i18n.get("comm_request") +'/'+ i18n.get("comm_per_hour") +')';
                user.refTimeHtml = c_html;
                
                op += tpl.format(user);
            }
        }
        $("#dnd-account-list li .drag").unbind();
        $("#dnd-account-list").html(op);
        if (bindDnd) {
          // $("#dnd-account-list").dragsort({
          //   dragSelector: ".drag", dragBetween: false, dragEnd: saveDndSortList, 
          //   placeHolderTemplate: "<li class='placeHolder'><div></div></li>"
          // });
        }
    }

    if (needRefresh || userCount <= 0) {
      $("#tab_user_set").click();
    }
    if (needRefresh) {
      $("#needRefresh").show();
    }
    
    // 显示微博选项
    var blogtype_options = '';
    var settings = setting.Settings.get();
    var k;
    for (k in utils.T_NAMES) {
      blogtype_options += '<option value="{{value}}">{{name}}</option>'.format({ name: utils.T_NAMES[k], value: k });
    }
    $('#account-blogType').html(blogtype_options);
    showSupportAuthTypes($('#account-blogType').val());
    
    // 显示新浪微博appkey 选项
    var appkey_options = '';
    if (typeof TSINA_APPKEYS === 'object') {
      for (var k in TSINA_APPKEYS) {
        if (k !== 'fawave') {
          continue;
        }
        appkey_options += '<option value="{{value}}">{{name}}</option>'.format({name: TSINA_APPKEYS[k][0], value: k});
      }
    }
    
    $('#account-appkey').html(appkey_options);
}

//保存拖放排序后的用户列表顺序
function saveDndSortList() {
    var new_list = [];
    var userlist = User.getUserList('all');
    $("#dnd-account-list li").each(function () {
        var uniqueKey = $(this).attr('uniqueKey');
        $.each(userlist, function (index, user){
            if (user.uniqueKey === uniqueKey) {
                new_list.push(user);
                return false;
            }
        });
    });
    User.saveUserList(new_list);
    _showMsg('帐号排序已保存');
}

// 修改帐号的启用状态
function changeAccountStatus(uniqueKey, stat) {
    var _li = $("#dnd_a_"+uniqueKey);
    if (_li.attr('stat') === stat) { 
        return; 
    } 
    // 状态一样，不用修改
    var userList = User.getUserList('all');
    var user = null;
    $.each(userList, function (i, item) {
        if (item.uniqueKey === uniqueKey){
            user = item;
            return false;
        }
    });
    var b_view = getBackgroundView();
    if (user) {
        switch (stat) {
            case 'enabled':
                user.disabled = false;
                user.only_for_send = false;
                break;
            case 'disabled':
                user.disabled = true;
                user.only_for_send = false;
                break;
            case 'onlysend':
                //仅用于发送的时候，帐号必须是启用的
                user.disabled = false;
                user.only_for_send = true;
                break;
        }
        User.saveUserList(userList);
        var c_user = User.getUser();
        if (c_user && c_user.uniqueKey.toLowerCase() === uniqueKey.toLowerCase()) {
            if (b_view) {
                b_view.setUser('');
                b_view.onChangeUser();
            }
        }
    }
    
    // if (b_view) {
    //     b_view.RefreshManager.restart();
    // }
    var statName = user.disabled ? i18n.get("comm_disabled") : (user.only_for_send ? i18n.get("comm_send_only") : i18n.get("comm_enabled"));
    _showMsg(i18n.get("msg_stat_change_success").format({ username: user.screen_name, stat: statName }));
    _li.removeClass(_li.attr('stat')).addClass(stat).attr('stat', stat);
    _li.find('.detail .stat .statName').html(statName);
}

function showMyGeo() {
    var geoPosition = $("#isGeoEnabled").data('position');
    if (geoPosition) {
        popupBox.showMap('icons/icon48.png', geoPosition.latitude, geoPosition.longitude, geoPosition);
    } else {
        _showMsg(i18n.get("msg_no_geo_info"));
    }
}

function init() {
    var settings = setting.Settings.get();

    var T_LIST = utils.T_LIST;
    //初始化全局信息刷新时间
    for (var i in T_LIST.all) {
        $("#gRefreshTime_" + T_LIST.all[i]).val(settings.globalRefreshTime[T_LIST.all[i]]);
    }
    calculateGlobalRefreshTimeHits();

    if(!settings.isSharedUrlAutoShort){
        $("#autoShortUrl").attr("checked", false);
    }
    
    //平滑滚动
    $("#isSmoothScroller").attr("checked", settings.isSmoothScroller ? true : false);
    var tween_options = '';
    for (var i in TWEEN_TYPES) {
        tween_options += '<option value="{{name}}">{{name}}</option>'.format({ name: TWEEN_TYPES[i] });
    }
    $("#tween_type").html(tween_options).val(settings.smoothTweenType);
    $("#ease_type").val(settings.smoothSeaeType);
    $("#tween_type, #ease_type").change(function () {
        SmoothScrollerDemo.start();
    });

    //地理位置
    if (settings.isGeoEnabled) {
        if (settings.isGeoEnabledUseIP) {
            $("#isGeoEnabledUseIP").attr("checked", true);
        } else {
            $('#isGeoEnabled').attr("checked", true);
        }
        $("#isGeoEnabled").data('position', settings.geoPosition);
        $("#btnShowMyGeo").show();
    }
    $("#isGeoEnabled").click(function () {
        if (!$(this).attr('checked')) { //未选中，不用检测
            $("#btnShowMyGeo").hide();
            return;
        }
        $("#isGeoEnabledUseIP").attr('checked', false);
        if (navigator.geolocation) {
            $("#save-all").attr('disabled',true);
            navigator.geolocation.getCurrentPosition(function (position) {
                //success
                var p = { latitude: position.coords.latitude, longitude: position.coords.longitude };
                $('#isGeoEnabled').data('position', p);
                $("#save-all").removeAttr('disabled');
                $("#btnShowMyGeo").show();
            }, function (msg) {
                //error
                _showMsg(i18n.get("msg_enabled_geo_false") + (typeof msg === 'string' ? msg : ""));
                $("#save-all").removeAttr('disabled');
                $("#isGeoEnabled").attr('checked', false);
            });
        } else {
            _showMsg(i18n.get("msg_not_support_geo"));
        }
    });
    
    // 使用ip判断是否开启
    $('#isGeoEnabledUseIP').click(function () {
        if (!$(this).attr('checked')) { //未选中，不用检测
            $("#btnShowMyGeo").hide();
            return;
        }
        $("#isGeoEnabled").attr('checked', false);
        // 获取当前ip
        $("#save-all").attr('disabled',true);
        get_location(function (geo, error) {
            if (geo) {
                $('#isGeoEnabled').data('position', geo);
                $("#btnShowMyGeo").show();
            } else {
                _showMsg(i18n.get("msg_enabled_geo_false") + ' ' + error);
                $("#isGeoEnabledUseIP").attr('checked', false);
            }
            $("#save-all").removeAttr('disabled');
        });
    });

    $("#autoShortUrlCount").val(settings.sharedUrlAutoShortWordCount);

    //初始化是否同步未读提示到新浪微博
    $("#unread_sync_to_page").attr("checked", settings.isSyncReadedCount);
    
    //初始化是否启用右键菜单
    $("#enable_contextmenu").attr("checked", settings.enableContextmenu);

    //发送微博时默认选择的账号
    $("#send_accounts_default_select").val(settings.sendAccountsDefaultSelected);

    $("#tp_looking").val(settings.lookingTemplate); //我正在看模板

    //初始化设置未读提示信息
    for (var i in T_LIST.all) {
        $("#set_badge_" + T_LIST.all[i]).attr("checked", settings.isSetBadgeText[T_LIST.all[i]]);
    }

    //初始化设置新消息是否在页面显示
    for (var i in T_LIST.all) {
        $("#set_show_in_page_" + T_LIST.all[i]).attr("checked", settings.isShowInPage[T_LIST.all[i]]);
    }

    //初始化是否声音提示
    for (var i in T_LIST.all) {
        $("#sound_alert_" + T_LIST.all[i]).attr("checked", settings.isEnabledSound[T_LIST.all[i]]);
    }
    $("#inpSoundFile").val(settings.soundSrc);

    //初始化是否桌面显示
    for (var i in T_LIST.all) {
        $("#destop_alert_" + T_LIST.all[i]).attr("checked", settings.isDesktopNotifications[T_LIST.all[i]]);
    }
    $("#inpDesktopNotificationsTimeout").val(settings.desktopNotificationsTimeout);

    //初始化主题选择
    var theme = settings.theme;
    if (theme) {
        $("#selTheme").val(theme);
        $("#themePreview").attr("src", 'themes/'+ theme +'/theme.png');
    }
    $("#selTheme").change(function () {
        $("#themePreview").attr("src", 'themes/'+ $(this).val() +'/theme.png');
    });

    //初始化字体选择
    $("#selFont").val(settings.font).change(function () {
        $("#selFontText").val($(this).val());
    });
    $("#selFontText").val(settings.font);
    $("#selFontSize").val(settings.fontSite);
    
    // display language
    if (settings.default_language) {
        $('#selDefaultLanguage').val(settings.default_language);
    }

    //初始化宽高
    var w = settings.popupWidth, h = settings.popupHeight;
    $("#set_main_width").val(w);
    $("#set_main_height").val(h);

    initQuickSendHotKey();

    initJtip();
}

//初始化Tab标签
function initTab() {
    $("ul#navigation li a").click(function() {
        if ($(this).hasClass('ignore')) { return; }
        var old_t = $("ul#navigation li.selected").attr('target_id');
        $(old_t).hide();
        $("ul#navigation li").removeClass("selected");
        var new_t = $(this).parents();
        new_t.addClass("selected");
        $(new_t.attr('target_id')).show();
        if(new_t.attr('hide_save_btn')){
            $("#save-all").hide();
        }else{
            $("#save-all").show();
        }
        return false;
    });
}

// jTip
function initJtip() {
    $(".jTip").hover(function(){
        var _t = $(this);
        var offset = _t.offset();
        $("#JT_close_left").html(_t.attr('jTitle')||'　');
        $("#JT_copy").html(_t.find('.c').html().replace(/<script>.*<\/script>/ig, ''));
        var jWidth = _t.attr('jWidth') || '';
        $("#JT").css({top:offset.top-5, left:offset.left + 25, width:jWidth}).css({visibility:'visible', opacity:'0.98'});
    }, function(){
        $("#JT").css({opacity:0, visibility:'hidden'});
    });
}

//导出、导入设置
function initExportImport() {
    //popupBox.showHtmlBox
    $("#showExportSettings").click(function(){
        var out = {UserList:User.getUserList('all'), Settings: setting.Settings.get()};
        popupBox.showHtmlBox(i18n.get('sett_export'), '<textarea style="width:350px;height:350px;" onmouseover="this.select()" readonly>' + JSON.stringify(out) + '</textarea>');
    });
    
    $("#showImportSettings").click(function(){
        popupBox.showHtmlBox(i18n.get('sett_import'), 
            '<textarea id="txtImportSettings" style="width:350px;height:350px;"></textarea>' + 
            '<br/><button onclick="importSettings();">' + i18n.get('sett_import') + '</button>' );
    });
}

function importSettings(){
    var s = $("#txtImportSettings").val();
    try{
        s = JSON.parse(s);
    }catch(err){
        _showMsg('Import Error: ' + err);
        s = null;
    }
    if(s){
        if(s.UserList){
            var ulOld = User.getUserList('all');
            var ulNew = $.extend(ulOld, s.UserList);
            saveUserList(ulNew);
        }
        if(s.Settings){
            var oldSet = setting.Settings.get();
            oldSet = $.extend(oldSet, s.Settings);
            Settings.save();
        }
        document.location.reload();
    }
}

//初始化快速发送热键
var TEMP_SET_KEYS = [];
function initQuickSendHotKey(){
    var keys = setting.Settings.get().quickSendHotKey;
    keys = keys.split(',');
    var key_maps = '';
    for(var i in keys){
        var _i = keys[i];
        if(KEYCODE_MAP[_i]){
            _i = KEYCODE_MAP[_i];
        }
        if(key_maps){ key_maps += ' + '; }
        key_maps += _i;
    }
    $("#set_quick_send_key_inp").val(key_maps);
    $("#set_quick_send_key").val(keys);
    $("#set_quick_send_key_inp").focus(function(){
        $("#set_quick_send_key_tip").show();
        $(this).bind('keydown', function(e){
            if(e.keyCode == 8){ //如果是退格键，则通行
                $("#set_quick_send_key_inp").val('');
                return true;
            }
            //如果是同一个键,则无视
            if (TEMP_SET_KEYS.length && e.keyCode == TEMP_SET_KEYS[TEMP_SET_KEYS.length-1]){
                return false;
            }
            var _t = $(this);
            if(!TEMP_SET_KEYS.length){ _t.val(''); }
            TEMP_SET_KEYS.push(e.keyCode);
            var key_name = e.keyCode;
            if(KEYCODE_MAP[e.keyCode]){
                key_name = KEYCODE_MAP[e.keyCode];
            }
            if(_t.val()){
                _t.val(_t.val() + ' + ');
            }
            _t.val(_t.val() + key_name);
            return false;
        });
        $(this).bind('keyup', function(e){
            if(TEMP_SET_KEYS.length){
                $("#set_quick_send_key").val(TEMP_SET_KEYS.toString());
            }
            TEMP_SET_KEYS = [];
        });
    }).blur(function(){
        $(this).unbind('keydown');
        $(this).unbind('keyup');
        if(TEMP_SET_KEYS.length){
            $("#set_quick_send_key").val(TEMP_SET_KEYS.toString());
        }
        TEMP_SET_KEYS = [];
        $("#set_quick_send_key_tip").hide();
    });
}

function _verify_credentials(user) {
  if (!user) {
    _showMsg(i18n.get("msg_wrong_name_or_pwd"));
    $('#save-account').removeAttr('disabled');
    return;
  }
  weibo.verify_credentials(user, function (err, data) {
    $('#save-account').removeAttr('disabled');
    if (err) {
      if (errorCode === 400 ||errorCode === 401 || errorCode === 403) {
          _showMsg(i18n.get("msg_wrong_name_or_pwd"));
      } else {
          var err_msg = '';
          if (data.error) {
              err_msg = 'error: ' + data.error;
          }
          _showMsg(i18n.get("msg_user_save_error") + err_msg);
      }
      var params = { blogtype: user.blogtype, authtype: user.authtype };
      if (errorCode) {
          params.error_code = errorCode;
      }
      if (data && data.error) {
          params.error = data.error;
      }
      return;
        // chrome.extension.sendRequest({ method:'activelog', active: 'save_account_error', params: params });
    }
    console.log('getUserList');
    var userList = User.getUserList('all');
    $.extend(user, data);
    user.uniqueKey = user.blogtype + '_' + user.id;
    user.screen_name = user.screen_name || user.name;
    var temp_uniqueKey = $("#edit-account-key").val() || user.uniqueKey;
    // 删除旧数据，替换新的
    var found = false;
    $.each(userList, function (i, item) {
      if (item.uniqueKey === temp_uniqueKey) {
        userList[i] = user;
        found = true;
        return false;
      }
    });
    if (!found) {
      console.log('!found');
      userList.push(user);
    }
    User.saveUserList(userList);
    console.log('!saveUserList');
    var c_user = User.getUser();
    if (!c_user || c_user.uniqueKey === temp_uniqueKey) {
      User.setUser(user);
      console.log('!setUser');
    }
    var btnVal = $("#save-account").val();
    console.log('showDndAccountList');
    showDndAccountList();
    console.log('showDndAccountList done');

    $("#new-account").hide();
    $("#account-name").val('');
    $("#account-pwd").val('');
    $("#account-pin").val('');
    // _showMsg(i18n.get("msg_edit_user_success").format({
    //   edit: btnVal, 
    //   username: data.screen_name
    // }));
    
    // var b_view = getBackgroundView();
    // if (b_view) {
    //     b_view.RefreshManager.restart(true);
    // }
    // logging
    // var args = {
    //   blogtype: user.blogtype, 
    //   authtype: user.authtype, 
    //   tid: user.uniqueKey
    // };
    // chrome.extension.sendRequest({
    //   method:'activelog', 
    //   active: 'save_account_success', 
    //   params: args
    // });
  });
}

//保存用户账号
//如果其他微博类型的字段名与新浪的不同，则与新浪的为准，修改后再保存
// 保存的账号信息有以下附加属性：
//   - uniqueKey: 唯一标识账号的键， blogType_userId , userId为返回的用户信息的用户id. 用下划线分隔是因为下划线可以用在css class里面
//   - authType: 认证类型：oauth, baseauth, xauth
//   - userName: baseAuth认证的用户名
//   - password: baseAuth认证的密码
//   - oauth_token_key: oauth认证获取到的的key
//   - oauth_token_secret: oAuth认证获取到的secret
//   - blogType: 微博类型：tsina, t163, tsohu, twitter, digu
//   - apiProxy: api代理, 目前twitter支持
//   - disabled: 账号是否已停用
function saveAccount() {
  var userName = $.trim($("#account-name").val());
  var pwd = $.trim($("#account-pwd").val());
  var blogtype = $.trim($("#account-blogType").val()) || 'tsina'; //微博类型，兼容，默认tsina
  var authtype = $.trim($("#account-authType").val()); //登录验证类型
  var appkey = 'fawave', appkey_secret = null;
//    if(!$('.account-appkey').is(':hidden')) {
//        appkey = $.trim($('#account-appkey').val()) || 'fawave';
//        if($('#account-appkey-diy').attr('checked')) {
//            var diy_key = $('#account-appkey-diy-key').val();
//            var diy_secret = $('#account-appkey-diy-secret').val();
//            if(diy_key && diy_secret) {
//                appkey = diy_key;
//                appkey_secret = diy_secret;
//            }
//        }
//    }
  // appkey = 'fawave';
  var pin = $.trim($('#account-pin').val()); // oauth pin码
  var apiProxy = $.trim($('#account-proxy-api').val());
  var user = {
    blogtype: blogtype, 
    authtype: authtype
  };
  // 目前只允许twitter设置代理
  if (blogtype === 'twitter' && apiProxy) {
      user.apiProxy = apiProxy;
  }
  // 目前只是新浪需要设在key
  if (blogtype === 'tsina' && appkey) {
    user.appkey = appkey;
    if (appkey_secret) {
      user.appkey_secret = appkey_secret;
    }
  }

  if ((authtype === 'baseauth' || authtype === 'xauth') && userName && pwd) {
    user.userName = userName;
    user.password = pwd;
    if (authType === 'xauth') {
      tapi.get_access_token(user, function(auth_user) {
        _verify_credentials(auth_user);
        delete auth_user.userName;
        delete auth_user.password;
      });
    } else {
      _verify_credentials(user);
    }
  } else if (authtype === 'oauth') {
    var request_token_key = $('#account-request-token-key').val();
    var request_token_secret = $('#account-request-token-secret').val();
    if (pin && ((request_token_key && request_token_secret) || 
        blogtype === 'weibo' || blogtype === 'diandian' ||
        blogtype === 'googleplus' || blogtype === 'facebook' || blogtype === 'renren')) {
      user.oauth_pin = pin;
      // 设置request token
      user.oauth_token = request_token_key;
      user.oauth_token_secret = request_token_secret;
      $('#save-account').attr('disabled', true);
      console.log(user)
      weibo.get_access_token(user, function (err, auth_user) {
        auth_user.blogType = auth_user.blogtype;
        auth_user.authType = auth_user.authtype;
        console.log(arguments)
        _verify_credentials(auth_user);
      });
    } else { // 跳到登录页面
      // window.open('https://api.weibo.com/oauth2/authorize?redirect_uri=http%3A%2F%2Flocalhost.nodeweibo.com%3A8088%2Foauth%2Fcallback&client_id=1122960051&response_type=code')
      weibo.get_authorization_url(user, function (err, info) {
        if (err) {
          return _showMsg('get_authorization_url ' + err.name + ': ' + err.message);
        }
        $('#account-request-token-key').val(user.oauth_token);
        $('#account-request-token-secret').val(user.oauth_token_secret);
        var callbackURL = weibo.get_config(user).oauth_callback;
        setTimeout(function () {
          var win = window.open(info.auth_url, '_blank');
          $(win).on('load', function () {
            console.log('load: ' + win.location.href);
            var timer = setInterval(function () {
              var url = win.location.href;
              console.log(url);
              if (url.indexOf(callbackURL) < 0) {
                return;
              }
              clearInterval(timer);
              win.close();
              win = null;
              oauth_callback(url);
            }, 1000);
          });
        }, 500);
      });
    }
  } else {
    _showMsg(i18n.get("msg_need_username_and_pwd"));
  }
}

function onSelBlogTypeChange() {
    var blogtype = $("#account-blogType").val();
    $("#account-blogType-img").attr('src', 'images/blogs/' + blogtype + '_16.png');
    showSupportAuthTypes(blogtype);
    $('.account-appkey').hide();
}

function showSupportAuthTypes(blogType, authType) {
    var types = SUPPORT_AUTH_TYPES[blogType];
    if(!types){
        _showMsg('没有"' + blogType + '"支持的验证类型');
        return;
    }
    var selAT = $("#account-authType");
    selAT.html('');
    // 添加认证类型
    var authtype_options = '';
    for (var i in types) {
        authtype_options += '<option value="{{value}}" {{selected}}>{{name}}</option>'.format({
            name: AUTH_TYPE_NAME[types[i]], value: types[i],
            selected: types[i] === authType ? 'selected="selected"' : ''
        });
    }
    selAT.html(authtype_options);
    selAT.change();
    if (blogType === 'twitter') {
        $('.account-proxy').show();
    } else {
        $('.account-proxy').hide();
    }
    $('.account-appkey').hide();
}

function showEditAccount(uniqueKey) {
    if (uniqueKey) {
        var userList = User.getUserList('all');
        var user = null;
        $.each(userList, function(index, item) {
            if (item.uniqueKey === uniqueKey) {
                user = item;
                return false;
            }
        });
        if (user) {
            $("#user-custom-wrap").hide();
            $("#new-account").show();
            $("#account-blogType").val(user.blogtype);
            showSupportAuthTypes(user.blogtype, user.authtype);
            $("#account-name").val(user.userName || '');
            $("#account-pwd").val(user.password || '');
            $("#account-proxy-api").val(user.apiProxy || '');
            $("#save-account").val(i18n.get("comm_save"));
        }
    }
}

function delAccount(uniqueKey) {
    if (!confirm(i18n.get("confirm_del_account"))) { 
        return; 
    }
    //$("#account-list option:selected").remove();
    $("#dnd_a_"+uniqueKey).remove();
    var userList = User.getUserList('all');
    var new_list = [];
    var delete_user = {};
    var b_view = getBackgroundView();
    for (var i in userList) {
        var user = userList[i];
        if (user.uniqueKey.toLowerCase() === uniqueKey.toLowerCase()) {
            delete_user = user;
            //TODO: 删除该用户的缓存数据？
            for (var key in localStorage) {
                if (key.indexOf(uniqueKey) >-1 ){
                    if (key !== USER_LIST_KEY && key !== CURRENT_USER_KEY) {
                        localStorage.removeItem(key);
                    }
                }
            }
            var c_user = getUser();
            if (c_user && c_user.uniqueKey.toLowerCase() === uniqueKey.toLowerCase()) {
                if (b_view) {
                    b_view.setUser('');
                    b_view.onChangeUser();
                }
            }
        } else {
            new_list.push(user);
        }
    }
    saveUserList(new_list);
    if (b_view) {
        b_view.RefreshManager.restart();
    }
    _showMsg(i18n.get("msg_del_account_success").format({
        blogname: utils.T_NAMES[delete_user.blogtype], 
        username: delete_user.screen_name
    }));
}

function saveAll() {
    var settings = setting.Settings.get();
    var bg = getBackgroundView();

    //保存全局信息刷新时间间隔
    var gr = null, grv = null;
    for (var i in T_LIST.all) {
        gr = $("#gRefreshTime_" + T_LIST.all[i]);
        grv = Number(gr.val());
        if(isNaN(grv)){
            grv = Settings.defaults.globalRefreshTime[T_LIST.all[i]];
        }else if(grv < 30){ //最低30秒
            grv = 30;
        }
        settings.globalRefreshTime[T_LIST.all[i]] = grv;
        gr.val(grv);
    }
    var b_view = getBackgroundView();
    if (b_view) {
        b_view.RefreshManager.restart(); //TODO: 需要确认
    }

    settings.isSharedUrlAutoShort = !!$("#autoShortUrl").attr("checked");
    var asuwc = $("#autoShortUrlCount").val(); //自动缩短网址
    asuwc = Number(asuwc);
    if(!isNaN(asuwc) && asuwc>0){
        settings.sharedUrlAutoShortWordCount = asuwc;
    }else{
        settings.sharedUrlAutoShortWordCount = Settings.defaults.sharedUrlAutoShortWordCount;
    }

    //发送微博时默认选择的账号
    settings.sendAccountsDefaultSelected = $("#send_accounts_default_select").val();

    //平滑滚动
    settings.isSmoothScroller = $("#isSmoothScroller").attr("checked") ? true : false;
    settings.smoothTweenType = $("#tween_type").val();
    settings.smoothSeaeType = $("#ease_type").val();

    //地理位置
    if($("#isGeoEnabled").attr("checked") || $("#isGeoEnabledUseIP").attr("checked")) {
        settings.isGeoEnabled = true;
        settings.geoPosition = $("#isGeoEnabled").data('position');
        if($("#isGeoEnabledUseIP").attr("checked")) {
            settings.isGeoEnabledUseIP = true;
        } else {
            settings.isGeoEnabledUseIP = false;
        }
    } else {
        settings.isGeoEnabled = false;
        settings.geoPosition = null;
    }

    settings.isSyncReadedCount = $("#unread_sync_to_page").attr("checked") ? true : false;
    
    //右键菜单
    settings.enableContextmenu = $("#enable_contextmenu").attr("checked") ? true : false;
    if(settings.enableContextmenu){
        bg.createSharedContextmenu();
    }else{
        bg.removeSharedContextmenu();
    }

    settings.lookingTemplate = $("#tp_looking").val(); //我正在看模板

    if($("#set_quick_send_key_inp").val()){
        settings.quickSendHotKey = $("#set_quick_send_key").val(); //快速发送微博快捷键
    }

    //保存未读提示
    $("#set_badge_wrap :checkbox").each(function(){
        var $this = $(this);
        settings.isSetBadgeText[$this.attr('id').replace('set_badge_','')] = ($this.attr("checked") ? true : false);
    });

    //保存是否在页面提示新消息
    $("#set_show_in_page_wrap :checkbox").each(function(){
        var $this = $(this);
        settings.isShowInPage[$this.attr('id').replace('set_show_in_page_','')] = ($this.attr("checked") ? true : false);
    });

    //保存是否声音提示
    $("#set_sound_alert_wrap :checkbox").each(function(){
        var $this = $(this);
        settings.isEnabledSound[$this.attr('id').replace('sound_alert_','')] = ($this.attr("checked") ? true : false);
    });
    var _soundFile = $.trim($("#inpSoundFile").val());
    if(_soundFile){
        settings.soundSrc = _soundFile;
        bg.AlertaAudioFile && (bg.AlertaAudioFile.src = _soundFile);
    }

    //初始化是否桌面显示
    $("#set_destop_alert_wrap :checkbox").each(function(){
        var $this = $(this);
        settings.isDesktopNotifications[$this.attr('id').replace('destop_alert_','')] = ($this.attr("checked") ? true : false);
    });
    var nfTimeout = $("#inpDesktopNotificationsTimeout").val();
    nfTimeout = Number(nfTimeout);
    if(isNaN(nfTimeout) || nfTimeout < 3){
        nfTimeout = 3;
    }
    settings.desktopNotificationsTimeout = nfTimeout;

    //保存主题
    var theme = $("#selTheme").val();
    settings.theme =  theme;

    //保存宽高
    var w = $("#set_main_width").val();
    var h = $("#set_main_height").val();
    w = Number(w);
    h = Number(h);
    if(isNaN(w) || w < 350){
        w = 350;
    }
    if(isNaN(h) || h < 350){
        h = 350;
    }
    settings.popupWidth = w;
    settings.popupHeight = h;
    $("#set_main_width").val(w);
    $("#set_main_height").val(h);

    //保存字体
    var font = $("#selFontText").val();
    settings.font =  font;
    var fontSize = $("#selFontSize").val();
    settings.fontSite = fontSize;
    
    var display_language = $("#selDefaultLanguage").val();
    settings.default_language = display_language;
    var bg = getBackgroundView();
    bg.reload_i18n_messages(display_language);
    
    settings.translate_target = $('#translate_target').val();
    settings.shorten_url_service = $('#shorten_url_service').val();
    settings.image_service = $('#image_service').val();
    if($('#enableImageService').attr('checked')) {
        settings.enable_image_service = true;
    } else {
        settings.enable_image_service = false;
    }
    
    // 上次浏览状态设置
    settings.remember_view_status = !!$('#remember_view_status_cb').attr('checked');

    // show_network_error
    settings.show_network_error = !!$('#show_network_error').attr('checked');

    Settings.save();
    _showMsg(i18n.get("msg_save_success"), true);
}

//平滑滚动
/*
 t: current time（当前时间）；
 b: beginning value（初始值）；
 c: change in value（变化量）；
 d: duration（持续时间）。
*/
var SmoothScrollerDemo = {
    T: '', //setTimeout引用
    movable_block: '',
    ease_type: 'easeOut',
    tween_type: 'Quad',
    status:{t:0, b:0, c:90, d:100},
    start: function(){
        clearTimeout(this.T);
        this.movable_block = $("#tween_demo span").css('margin-left', 0);
        this.ease_type = $("#ease_type").val();
        this.tween_type = $("#tween_type").val();
        this.status.t = 0;
        this.status.b = 0;
        this.run();
    },
    run: function(){
        var _t = SmoothScrollerDemo;
        var _left = Math.ceil(Tween[_t.tween_type][_t.ease_type](_t.status.t, _t.status.b, _t.status.c, _t.status.d));
        _t.movable_block.css('margin-left', _left);
        if(_t.status.t < _t.status.d){ _t.status.t++; setTimeout(_t.run, 10); }
    }
};

function refreshAccountAuth(uniqueKey) {
  var user = User.getUserByUniqueKey(uniqueKey);
  if (!user) {
    return;
  }
  $('#show-new-account').click();
  $('#account-blogType').val(user.blogtype);
  onSelBlogTypeChange();
  $('#get-account-pin').click();
}

//刷新账号信息
function refreshAccountInfo() {
    var stat = {errorCount: 0, successCount: 0};
    // 获取排序信息
    stat.userList = User.getUserList('all');
    $("#refresh-account").attr("disabled", true);
    for(var i in stat.userList){
        refreshAccountWarp(stat.userList[i], stat);//由于闭包会造成变量共享问题，所以写多一个包装函数。
    }
}

function refreshAccountWarp(user, stat) {
    tapi.verify_credentials(user, function(data, textStatus, errorCode){
        user.blogtype = user.blogtype || 'tsina'; //兼容单微博版
        user.authtype = user.authtype || 'baseauth'; //兼容单微博版
        var blogName = utils.T_NAMES[user.blogtype];
        if (errorCode){
            if (errorCode === 400) {
                _showMsg(_u.i18n("msg_update_accounts_info_false").format({blogname:blogName, username:user.screen_name}));
            } else {
                _showMsg(_u.i18n("msg_update_accounts_info_unknow_error").format({blogname:blogName, username:user.screen_name, errorcode:errorCode}));
            }
//            userList[user.uniqueKey] = user;
            stat.errorCount++;
        } else {
            $.extend(user, data); //合并，以data的数据为准
            user.uniqueKey = user.blogtype + '_' + user.id;
//            stat.userList[i] = user;
//            userList[data.uniqueKey] = data;
            stat.successCount++;
            _showMsg(_u.i18n("msg_update_account_info_success").format({blogname:blogName, username:user.screen_name}), true);
        }
        if((stat.errorCount + stat.successCount) === stat.userList.length){
            // 全部刷新完，更新
            saveUserList(stat.userList);
            var c_user = getUser();
            if(c_user){
                if(!c_user.uniqueKey){ //兼容单微博版本
                    c_user.uniqueKey = (c_user.blogtype||'tsina') + '_' + c_user.id;
                }
                $.each(stat.userList, function(index, item){
                    if(c_user.uniqueKey.toLowerCase() === item.uniqueKey) {
                        c_user = item;
                        return false;
                    }
                });
//                c_user = userList[c_user.uniqueKey.toLowerCase()];
                setUser(c_user);
            }
            _showMsg(_u.i18n("msg_update_accounts_info_complete").format({successCount:stat.successCount, errorCount:stat.errorCount}));
            $("#refresh-account").removeAttr("disabled");
            if ($("#needRefresh").css('display') !== 'none') { //如果是强制需要刷新用户信息的，则在刷新后刷新页面
                window.location.reload(); //TODO: 修改为不用刷新页面的
            }else{
                showDndAccountList();
            }
        }
    });
}

//清空本地缓存数据
function cleanLocalStorageData() {
    for (var key in localStorage) {
        if (key.indexOf('idi') >- 1) {
            if (key !== USER_LIST_KEY && key !== CURRENT_USER_KEY){
                localStorage.removeItem(key);
            }
        }
    }
    var b_view = getBackgroundView();
    if (b_view) {
        b_view.tweets = {};
        b_view.MAX_MSG_ID = {};
        b_view.checking={};
        b_view.paging={};
        b_view.RefreshManager.restart();
    }
}

// 监控oauth callback url，获取认证码
// https://api.weibo.com/oauth2/default.html?code=c8525b70e8aa5c9ee4ce6c96e8621e75
// facebook: 
// https://chrome.google.com/extensions/detail/aicelmgbddfgmpieedjiggifabdpcnln/?code=3362948c9a062a22ef18c6d5-1013655641|T7VuPCHU79f6saU7MiQwHGG_mVc
function oauth_callback(url) {
  var urlinfo = urlparse(url, true);
  var query = urlinfo.query || {};
  var pin = query.oauth_verifier || query.code || 'impin';
  if (pin.indexOf('#') > 0) {
    pin = pin.substring(0, pin.indexOf('#'));
  }
  $('#account-pin').val(pin);
  $('#save-account').click();
}


