(function(){

function showLogin(){
    $("#regForm").hide();
    $("#loginForm").show();
};

function showNewAccount(){
    $("#loginForm").hide();
    $("#regForm").show();
};

$(function(){

    $("#btnShowNewAccount").click(function(){
        showNewAccount();
    });
    $("#btnShowLogin").click(function(){
        showLogin();
    });

    //$("#").click(function(){});
});

})();