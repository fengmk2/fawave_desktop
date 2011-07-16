(function(){


var SUPPORT_AUTH_TYPES = {
	'tsina': ['oauth'],
	'tqq': ['oauth'],
	'tsohu': ['oauth', 'baseauth'],
	't163': ['oauth', 'xauth'],
	'fanfou': ['baseauth'],
	'digu': ['baseauth'],
	'zuosa': ['baseauth'],
	'follow5': ['baseauth'],
	'leihou': ['baseauth'],
	'renjian': ['baseauth'],
	'twitter': ['oauth', 'baseauth'],
	'douban': ['oauth'],
	'buzz': ['oauth'],
	'facebook': ['oauth'],
	'plurk': ['baseauth'],
    'identi_ca': ['oauth', 'baseauth'],
    'tianya': ['oauth'],
    'tumblr': ['baseauth']
};

var AUTH_TYPE_NAME = {
    'baseauth': 'Basic Auth',
    'oauth': FaWave.i18n._("oauth_name"),
    'xauth': FaWave.i18n._("xauth_name")
};

function initTab(){
    $("#menu li").click(function(){
        var t = $(this);
        if(t.hasClass('active')){ return; }
        $("#menu li").removeClass('active');
        t.addClass('active');
        $("#main .item").hide();
        $('#' + t.attr('target')).show();
    });
};

// jTip
function initJtip(){
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
};

function init(){
    var settings = FaWave.Setting.get();

    initJtip();

    // 用户设置相关
    $("#refresh-account").click(function(){
        refreshAccountInfo();
    });

    $("#show-new-account").click(function(){
        $("#save-account").val(FaWave.i18n._("comm_add"));
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

    $("#save-account").click(function(){
        saveAccount();
    });
    
    $("#get-account-pin").click(function(){
    	$('#account-request-token-key').val('');
        $('#account-request-token-secret').val('');
        saveAccount();
        $(this).fadeOut(500).delay(5000).fadeIn(500);
    });

    // 绑定认证类型变化时的显示切换
    $("#account-authType").change(function() {
    	if($(this).val() == 'oauth') {
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
    // 绑定微博类型变化时的显示切换
    $("#account-blogType").change(function() {
    	onSelBlogTypeChange();
    });
};

/************
 * 用户设置
 */
function showDndAccountList(bindDnd){
    var userList = FaWave.Users.getUserList('all');
    var userCount = 0;
    var needRefresh = false;
    if(userList){
        var op = '';
        //var tpl = '<option value="{{uniqueKey}}">({{statName}}) ({{blogTypeName}}) {{screen_name}}</option>';
        var tpl = '<li id="dnd_a_{{uniqueKey}}" class="{{uniqueKey}} {{stat}} clearFix" uniqueKey="{{uniqueKey}}" stat="{{stat}}">' +
                '<div class="face_img drag">' +
                '   <a class="face" href="javascript:"><img src="{{profile_image_url}}"></a>' +
                '   <img src="/images/blogs/{{blogType}}_16.png" class="blogType">' +
                '</div>' +
                '<div class="detail">' +
                '   <div class="item"><span class="userName">{{screen_name}}</span>({{blogTypeName}})' +
                '       <div class="stat"><span class="statName">{{statName}}</span><span class="nav-arrow">&nbsp;</span>' +
                '           <div><ul><li class="enabled" onclick="changeAccountStatus(\'{{uniqueKey}}\', \'enabled\')">'+ FaWave.i18n._("comm_enabled") +'</li>' +
                '               <li class="onlysend" onclick="changeAccountStatus(\'{{uniqueKey}}\', \'onlysend\')">'+ FaWave.i18n._("comm_send_only") +'</li>' +
                '               <li class="disabled" onclick="changeAccountStatus(\'{{uniqueKey}}\', \'disabled\')">'+ FaWave.i18n._("comm_disabled") +'</li></ul>' +
                '           </div>' +
                '       </div>' +
                '       <span class="edit"><button onclick="delAccount(\'{{uniqueKey}}\')"><img src="images/delete.png">'+ FaWave.i18n._("comm_del_user") +'</button></span>' +
                '   </div>' +
                '   <div class="item item2">' +
                '       <span><span>'+ FaWave.i18n._("sett_refresh_interval") +':  </span><span class="userRefreshTimeWrap">{{refTimeHtml}}</span></span>' +
                '   </div>' +
                '</div>' +
                '</li>';
        for(var i=0; i < userList.length; i++){
            userCount++;
            var user = userList[i];

            user.blogTypeName = FaWave.CONST.T_NAMES[user.blogType];
            user.statName = user.disabled ? FaWave.i18n._("comm_disabled") : (user.only_for_send ? FaWave.i18n._("comm_send_only") : FaWave.i18n._("comm_enabled"));
            user.stat = user.disabled ? 'disabled' : (user.only_for_send ? 'onlysend' : 'enabled');
            
            //绑定用户自定刷新时间
            var refTime = 0, timelimes = FaWave.CONST.T_LIST[user.blogType], c_html = '';
            for(var i in timelimes){
                if(c_html){ c_html += ', '; }
                c_html += FaWave.CONST.tabDes[timelimes[i]];
                c_html += '('+ FaWave.Setting.get().globalRefreshTime[timelimes[i]] +')';
                if(user.refreshTime && user.refreshTime[timelimes[i]]){
                    refTime = user.refreshTime[timelimes[i]];
                }else{
                    refTime = 0;
                }
                c_html += '<input type="text" t="' + timelimes[i] + '" value="' + refTime +'" class="inpRefTime" onchange="curthas(this)" />' + FaWave.i18n._("comm_second");
            }
            c_html += '(<span class="refHits">' + calculateUserRefreshTimeHits(user) + '</span>'+ FaWave.i18n._("comm_request") +'/'+ FaWave.i18n._("comm_per_hour") +')';
            user.refTimeHtml = c_html;
            
            op += tpl.format(user);
        }
        $("#dnd-account-list li .drag").unbind();
        $("#dnd-account-list").html(op);
        if(bindDnd){
            $("#dnd-account-list").dragsort({ dragSelector: ".drag", dragBetween: false, dragEnd: saveDndSortList, placeHolderTemplate: "<li class='placeHolder'><div></div></li>" });
        }
    }
    if(needRefresh || userCount <= 0){
        $("#tab_user_set").click();
    }
    if(needRefresh){
        $("#needRefresh").show();
    }
    
    // 显示微博选项
    var blogtype_options = '';
    for(var k in FaWave.CONST.T_NAMES) {
    	blogtype_options += '<option value="{{value}}">{{name}}</option>'.format({name: FaWave.CONST.T_NAMES[k], value: k});
    }
    $('#account-blogType').html(blogtype_options);
    showSupportAuthTypes($('#account-blogType').val());
    
    // 显示新浪微博appkey 选项
    var appkey_options = '';
    for(var k in FaWave.CONST.TSINA_APPKEYS) {
    	appkey_options += '<option value="{{value}}">{{name}}</option>'.format({name: FaWave.CONST.TSINA_APPKEYS[k][0], value: k});
    }
    $('#account-appkey').html(appkey_options);
};

function onSelBlogTypeChange(){
    var blogType = $("#account-blogType").val();
    $("#account-blogType-img").attr('src', 'images/blogs/' + blogType + '_16.png');
    showSupportAuthTypes(blogType);
};

function showSupportAuthTypes(blogType, authType){
    var types = SUPPORT_AUTH_TYPES[blogType];
    if(!types){
        FaWave.UI.Msg.info('没有"' + blogType + '"支持的验证类型');
        return;
    }
    var selAT = $("#account-authType");
    selAT.html('');
    // 添加认证类型
    var authtype_options = '';
    for(var i in types) {
    	authtype_options += '<option value="{{value}}" {{selected}}>{{name}}</option>'.format({
    		name: AUTH_TYPE_NAME[types[i]], value: types[i],
    		selected: types[i] == authType ? 'selected="selected"' : ''
    	});
    }
    selAT.html(authtype_options);
    selAT.change();
    if(blogType == 'twitter') {
    	$('.account-proxy').show();
    } else {
    	$('.account-proxy').hide();
    }
//    if(blogType == 'tsina') {
//    	$('.account-appkey').show();
//    } else {
//    	$('.account-appkey').hide();
//    }
    $('.account-appkey').hide();
};

//统计全局的刷新间隔设置产生的请求次数
function calculateGlobalRefreshTimeHits(){
    var total = 0, refTime = 0, refTimeInp = null, timelimes = FaWave.CONST.T_LIST.all;
    for(var i in timelimes){
        refTimeInp = $("#gRefreshTime_" + timelimes[i]);
        refTime = Number(refTimeInp.val());
        if(isNaN(refTime)){
            refTime = FaWave.Setting.defaults.globalRefreshTime[timelimes[i]];
        }else if(refTime<30){
            refTime = 30;
        }
        refTimeInp.val(refTime);
        total += Math.round(60*60/refTime);
    }
    $("#gRefreshTimeHits").html(total);
};

//统计用户自定义的刷新间隔设置产生的请求次数
function calculateUserRefreshTimeHits(user){
    var total = 0, refTime = 0, refTimeInp = null, timelimes = FaWave.CONST.T_LIST[user.blogType];
    for(var i in timelimes){
        if(user.refreshTime && user.refreshTime[timelimes[i]]){
            refTime = user.refreshTime[timelimes[i]];
        }else{
            refTime = 0;
        }
        if(refTime==0){
            refTime = FaWave.Setting.get().globalRefreshTime[timelimes[i]];
        }
        total += Math.round(60*60/refTime);
    }
    return total;
};

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
function saveAccount(){
    var userName = $.trim($("#account-name").val());
    var pwd = $.trim($("#account-pwd").val());
    var blogType = $.trim($("#account-blogType").val()) || 'tsina'; //微博类型，兼容，默认tsina
    var authType = $.trim($("#account-authType").val()); //登录验证类型
    var appkey = $.trim($('#account-appkey').val()) || 'fawave';
    appkey = 'fawave';
    var pin = $.trim($('#account-pin').val()); // oauth pin码
    var apiProxy = $.trim($('#account-proxy-api').val());
    var user = {
    	blogType: blogType, authType: authType
    };
    // 目前只允许twitter设置代理
    if(blogType == 'twitter' && apiProxy) {
    	user.apiProxy = apiProxy;
    }
    // 目前只是新浪需要设在key
    if(blogType == 'tsina' && appkey) {
    	user.appkey = appkey;
    }
    if((authType == 'baseauth' || authType == 'xauth') && userName && pwd){ // TODO: xauth还未支持
        //userName = userName.toLowerCase(); //小写
        user.userName = userName;
        user.password = pwd;
        if(authType == 'xauth') {
        	FaWave.Tapi.tapi.get_access_token(user, function(auth_user) {
    			_verify_credentials(auth_user);
    			delete auth_user.userName;
    			delete auth_user.password;
    		});
        } else {
        	_verify_credentials(user);
        }
    } else if(authType == 'oauth') {
    	var request_token_key = $('#account-request-token-key').val();
    	var request_token_secret = $('#account-request-token-secret').val();
    	if(pin && ((request_token_key && request_token_secret) || blogType == 'facebook')) {
    		user.oauth_pin = pin;
    		// 设置request token
    		user.oauth_token_key = request_token_key;
    		user.oauth_token_secret = request_token_secret;
    		$('#save-account').attr('disabled', true);
    		FaWave.Tapi.tapi.get_access_token(user, _verify_credentials);
    	} else { // 跳到登录页面
    		FaWave.Tapi.tapi.get_authorization_url(user, function(error, login_url, res) {
    			if(error) {
    				FaWave.UI.Msg.info('get_authorization_url error: ' + error.message);
    			} else {
    				// 在当前页保存 request token
        			$('#account-request-token-key').val(user.oauth_token_key);
        			$('#account-request-token-secret').val(user.oauth_token_secret);
            		var l = (window.screen.availWidth-510)/2;
            		window.open(login_url, 'FaWaveOAuth', 'left=' + l 
            	    		+ ',top=30,width=600,height=450,menubar=no,location=yes,resizable=no,scrollbars=yes,status=yes');
    			}
    		});
    	}
    } else {
        FaWave.UI.Msg.info(FaWave.i18n._("msg_need_username_and_pwd"));
    }
};


function _verify_credentials(error, user) {
	if(error) {
		FaWave.UI.Msg.info(error.message || FaWave.i18n._("msg_wrong_name_or_pwd"));
		$('#save-account').removeAttr('disabled');
		return;
	}
	FaWave.Tapi.tapi.verify_credentials(user, function(error, data){
		$('#save-account').removeAttr('disabled');
        if(error) {
            var error_message = error.message ? 
                (FaWave.i18n._("msg_user_save_error") + err_msg) : FaWave.i18n._("msg_user_save_error");
            FaWave.UI.Msg.info(error_message);
            var params = {blogtype: user.blogType, authtype: user.authType};
            params.error = error;
            // chrome.extension.sendRequest({method:'activelog', active: 'save_account_error', params: params});
        } else {
        	var userList = FaWave.Users.getUserList('all');
            $.extend(user, data);
            user.uniqueKey = user.blogType + '_' + user.id;
            user.screen_name = user.screen_name || user.name;
            var temp_uniqueKey = $("#edit-account-key").val() || user.uniqueKey;
            // 删除旧数据，替换新的
            var found = false;
            $.each(userList, function(i, item){
            	if(item.uniqueKey == temp_uniqueKey){
            		userList[i] = user;
            		found = true;
            		return false;
            	}
            });
            if(!found) {
            	FaWave.Users.add(user);
            }
            FaWave.Users.save();
//            var c_user = getUser();
//            if(!c_user || c_user.uniqueKey == temp_uniqueKey){
//                setUser(user);
//            }
            var btnVal = $("#save-account").val();
            showDndAccountList();

            $("#new-account").hide();
            $("#account-name").val('');
            $("#account-pwd").val('');
            $("#account-pin").val('');
            FaWave.UI.Msg.info(FaWave.i18n._("msg_edit_user_success").format({edit:btnVal, username:data.screen_name}));
            
            //var b_view = getBackgroundView();
            //if(b_view){
            //    b_view.RefreshManager.restart(true);
            //}

            // logging
            var params = {blogtype: user.blogType, authtype: user.authType, tid: user.uniqueKey};
            //chrome.extension.sendRequest({method:'activelog', active: 'save_account_success', params: params});
        }
    });
};


// <<===== 用户相关设置结束


$(function(){
    // 多语言
    FaWave.UI.i18nTran();

    initTab();
    $("#menu li").eq(0).click();

    var qs = FaWave.Util.Url.queryStrings(document.location.href);
    if(qs.tab){
        $("#menu li." + qs.tab).eq(0).click();
    }

    init();

    showDndAccountList();
});



})();
