window.FaWave = window.FaWave || {};
FaWave.Setting = {
    pathName: 'setting.json'
    defaults: {
        globalRefreshTime:{ //全局的刷新间隔时间
            friends_timeline: 90,
            mentions: 120,
            comments_timeline: 120,
            direct_messages: 120
        },
        isEnabledSound:{ //是否开启播放声音提示新信息
            friends_timeline: false,
            mentions: false,
            comments_timeline: false,
            direct_messages: false
        },
        soundSrc: '/sound/d.mp3',
        isDesktopNotifications:{ //是否在桌面提示新信息
            friends_timeline: false,
            mentions: false,
            comments_timeline: false,
            direct_messages: false
        },
        desktopNotificationsTimeout: 5, //桌面提示的延迟关闭时间
        isSyncReadedToSina: false, //已读消息是否和新浪微博页面同步
        isSharedUrlAutoShort: true, //分享正在看的网址时是否自动缩短
        sharedUrlAutoShortWordCount: 15, //超过多少个字则自动缩短URL
        quickSendHotKey: '113', //快速发送微博的快捷键。默认 F2。保存的格式为： 33,34,35 用逗号分隔的keycode
        isSmoothScroller: false, //是否启用平滑滚动
        smoothTweenType: 'Quad', //平滑滚动的动画类型
        smoothSeaeType: 'easeOut', //平滑滚动的ease类型
        sendAccountsDefaultSelected: 'current', //多账号发送的时候默认选择的发送账号
        enableContextmenu: true, //启用右键菜单

        font: 'Arial', //字体
        fontSite: 12, //字体大小
        theme: 'pip_io', //主题样式
        translate_target: 'zh', // 默认翻译语言
        shorten_url_service: 't.cn', // 默认缩址服务
        image_service: 'Imgur', // 默认的图片服务
        enable_image_service: true, // 默认开启图片服务
        isGeoEnabled: false, //默认不开启上报地理位置信息
        isGeoEnabledUseIP: false, //true 使用ip判断， false 使用浏览器来判断
        geoPosition: null, //获取到的地理位置信息，默认为空

        lookingTemplate: FaWave.i18n.getString('sett_shared_template')
    },
    init: function(){ //只在background载入的时候调用一次并给 _settings 赋值就可以
        var path = Titanium.Filesystem.getResourcesDirectory();
        var file = Titanium.Filesystem.getFile(path, FaWave.Config.dataDir, FaWave.Setting.pathName);
        var _sets;
        if(file.exists()){
            try{
                _sets = JSON.parse(file.read());
            }catch(e){
                FaWave.Log.error(e);
            }
        }
        _sets = _sets || {};
        _sets = $.extend({}, this.defaults, _sets);

        return _sets;
    },
    get: function(){
        //不用判断，已确保init会在background载入的时候调用
        //if(!bg._settings){
        //    bg._settings = this.init();
        //}
        return FaWave.BG._settings;
    },
    /****
     * 会有文件系统异常
     */
    save: function(){
        var _sets = this.get();
        var path = Titanium.Filesystem.getResourcesDirectory();
        var dir = Titanium.Filesystem.getFile(path, FaWave.Config.dataDir);
        if(!dir.exists()){
            dir.createDirectory();
        }
        var file = Titanium.Filesystem.getFile(path, FaWave.Config.dataDir, FaWave.Setting.pathName);
        // file.write这个API好像在Titanium的1.1.0以上版本修改了？
        file.write(JSON.stringify(_sets));
    },
    /*
    * 获取刷新间隔时间
    */
    getRefreshTime: function(user, t){
        var r = 60;
        if(user && user.refreshTime && user.refreshTime[t]){
            r = user.refreshTime[t];
        }else{
            r = this.get().globalRefreshTime[t];
        }
        if(refreshTimeLimit[user.blogType] && refreshTimeLimit[user.blogType][t] && refreshTimeLimit[user.blogType][t] > r){
            r = refreshTimeLimit[user.blogType][t];
        }
        if(isNaN(r)){
            r = 60;
        }else if(r < 30){
            r = 30;
        }else if(r > 24 * 60 * 60){
            r = 24 * 60 * 60;
        }
        return r;
    }
};

