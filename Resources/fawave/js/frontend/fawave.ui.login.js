(function(){


function initAccounts(){
    var accs = FaWave.Accounts.load(true);
    if(accs && accs.length){
        var ops = '';
        accs.forEach(function(a){
            ops += '<option value="' + a.name + '">' + a.name + '</option>';
        });
        $("#accountList").html(ops);
    };
};

function showLogin(){
    $("#regForm, #btnShowLogin, #btnNewAccount").hide();
    $("#loginForm, #btnShowNewAccount, #btnLogin").show();
	$("#header .title").html(FaWave.i18n._('login'));
};

function showNewAccount(){
    $("#loginForm, #btnShowNewAccount, #btnLogin").hide();
    $("#regForm, #btnShowLogin, #btnNewAccount").show();
	$("#header .title").html(FaWave.i18n._('register'));
};

function login(){
    var name = $("#accountList").val(),
        pwd = $("#loginPwd").val();
    if(!name){
        FaWave.UI.Msg.alert('请选择用户');
        return;
    }
    if(!pwd){
        FaWave.UI.Msg.alert('请输入密码');
        return;
    }
    if(FaWave.Accounts.login(name, pwd)){
        alert('登陆成功');
        // TODO: 怎样跳转？
    }else{
        FaWave.UI.Msg.alert('密码错误');
    }
};

function register(){
    var name = $("#regName").val(),
        pwd = $("#regPwd").val(),
        pwd2 = $("#regPwd2").val();
    if(!name){
        FaWave.UI.Msg.alert('请填写用户名');
        return;
    }
    if(!pwd || !pwd2){
        FaWave.UI.Msg.alert('请输入密码');
        return;
    }else if(pwd != pwd2){
        FaWave.UI.Msg.alert('两次输入的密码不一样');
        return;
    }
    if(FaWave.Accounts.getByName(name)){
        FaWave.UI.Msg.alert('用户已经存在，请更换用户名');
        return;
    }
    if(FaWave.Accounts.add({'name':name, 'password':pwd})){
        initAccounts();
        showLogin();
        $("#regForm")[0].reset();
    }else{
        FaWave.UI.Msg.error('注册失败');
    }
};

$(function(){

    // 载入账号列表
    initAccounts();

    // 多语言
    FaWave.UI.i18nInit();

    $("#btnShowNewAccount").click(function(){
        showNewAccount();
    });
    $("#btnShowLogin").click(function(){
        showLogin();
    });

    $("#loginForm").submit(function(){
        login();
        return false;
    });

    $("#regForm").submit(function(){
        register();
        return false;
    });

    //$("#").click(function(){});
});


})();