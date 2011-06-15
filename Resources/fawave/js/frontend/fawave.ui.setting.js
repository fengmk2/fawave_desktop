
function initTab(){
    $("#menu li").click(function(){
        var t = $(this);
        if(t.hasClass('active')){ return; }
        $("#menu li").removeClass('active');
        t.addClass('active');
        $(".main .item").hide();
        $('#' + t.attr('target')).show();
    });
};

$(function(){
    initTab();
});