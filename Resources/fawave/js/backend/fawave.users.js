(function(){

window.FaWave = window.FaWave || {};



/****
 * FaWave的账号
 * 一个FaWave账号下可以有很多个微博账号
 * {
 *    name: 'account name',
 *    password: 'password'
 * }
 */
FaWave.Accounts = {
    pathName: 'accounts.db'
  , _accounts: [] //账号列表缓存
    /********
     * 载入FaWave账号列表
     * @forceReload: 强制重新从文件中加载
     */
  , load: function(forceReload){
        if(!FaWave.Accounts._accounts || !FaWave.Accounts._accounts.length){
            var data = FaWave.Store.File.read(FaWave.Accounts.pathName).toString();
            if(data){
                data = FaWave.Util.decrypt(data);
                FaWave.Accounts._accounts = JSON.parse(data);
            }
        }
        return FaWave.Accounts._accounts;
    }
  , save: function(){
        var data = JSON.stringify(FaWave.Accounts._accounts);
        data = FaWave.Util.encrypt(data);
        FaWave.Store.File.save(FaWave.Accounts.pathName, data);
    }
  , getByName: function(name){
        var a = null;
        if(FaWave.Accounts._accounts){
            for(var i=0; i < FaWave.Accounts._accounts.length; i++){
                if(FaWave.Accounts._accounts[i].name.toLowerCase() == name.toLowerCase()){
                    a = FaWave.Accounts._accounts[i];
                    break;
                }
            }
        }
        return a;
    }
    /********
     * 添加账号
     * 成功返回 true , 失败返回 false
     */
  , add: function(account){
        var success = false;
        if(account.name && account.password){
            account.password = Titanium.Codec.digestToHex(Titanium.Codec.MD5, account.password);
            FaWave.Accounts._accounts.push(account);
            FaWave.Accounts.save();
            success = true;
        }
        return success;
    }
    /*******
     * 登陆
     * 成功返回 true , 失败返回 false
     */
  , login: function(name, pwd){
        var isLogin = false,
            a = FaWave.Accounts.getByName(name);
        if(a && a.password == Titanium.Codec.digestToHex(Titanium.Codec.MD5, pwd) ){
            isLogin = true;
            // 保存到win缓存中，作为全局变量
            FaWave.Cache.Properties.set('currentAccount', {name:name});
        }
        return isLogin;
    }
};
// 属性
FaWave.Accounts.__defineGetter__('current', function(){
    return FaWave.Cache.Properties.get('currentAccount');
});



/****
 * 微博账号
 */
FaWave.Users = {
    pathName: 'users_%s.db'
  , _current: null
  , _users: null
    /********
     * 载入微博账号列表
     * @forceReload: 强制重新从文件中加载
     */
  , load: function(forceReload){
        if(!FaWave.Users._users || !FaWave.Users._users.length){
            var pathName = FaWave.Users.pathName.replace('%s', FaWave.Accounts.current.name);
            var data = FaWave.Store.File.read(pathName);
            if(data){
                data = FaWave.Util.decrypt(data);
                FaWave.Users._users = JSON.parse(data);
            }
        }
        return FaWave.Users._users;
    }
  , save: function(){
        var data = JSON.stringify(FaWave.Users._users);
        data = FaWave.Util.encrypt(data);
        FaWave.Store.File.save(FaWave.Users.pathName, data);
    }
    //获取所有用户列表
    // @t: all: 全部， send:用于发送的用户列表， show:正常显示的用户。默认为show
    // @forceReload: 强制重新从文件中加载
  , getUserList: function(t, forceReload){
        t = t || 'show'; //默认，获取用于显示的列表
        var userList = FaWave.Users.load(forceReload) || [];
        if(t==='all'){
            return userList;
        }
        var items = [], user = null;
        for(var i=0; i < userList.length; i++){
            user = userList[i];
            if(!user.disabled){
                if(t==='show' && user.only_for_send){ continue; }
                items.push(userList[i]);
            }
        }
        return items;
    }
};
// 属性
FaWave.Users.__defineGetter__('current', function(){
    if(!FaWave.Users._current){
        if(FaWave.Users._users || FaWave.Users._users.length){
            FaWave.Users._current = FaWave.Users._users[0];
        }
    }
    return FaWave.Users._current;
});


})();