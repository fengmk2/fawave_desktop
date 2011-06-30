(function(){

function showLogin(){
    $("#regForm, #btnShowLogin, #btnNewAccount").hide();
    $("#loginForm, #btnShowNewAccount, #btnLogin").show();
	$("#header .title").html('Login');
};

function showNewAccount(){
    $("#loginForm, #btnShowNewAccount, #btnLogin").hide();
    $("#regForm, #btnShowLogin, #btnNewAccount").show();
	$("#header .title").html('New Account');
};

$(function(){

    // ∂‡”Ô—‘
    FaWave.UI.i18nInit();

    $("#btnShowNewAccount").click(function(){
        showNewAccount();
    });
    $("#btnShowLogin").click(function(){
        showLogin();
    });

    //$("#").click(function(){});
});

})();