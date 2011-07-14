
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

$(function(){
    initTab();
    $("#menu li").eq(0).click();

    var qs = FaWave.Util.Url.queryStrings(document.location.href);
    if(qs.tab){
        $("#menu li." + qs.tab).eq(0).click();
    }
});