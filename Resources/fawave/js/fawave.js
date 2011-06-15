var FaWave = window.FaWave = {};

/*******
 * 加载JS
 * FaWave.loadJS('/lib/main.js');
 * FaWave.loadJS(['main.js', 'sub.js']);
 */
FaWave.loadJS = function(src){
    if(typeof src == 'string'){
        src = [src];
    }
    for(var i=0; i<src.length; i++){
        //document.write('<script type="text/javascript" src="' + src[i] + '"></script>');
        var s = document.createElement("script");
        s.setAttribute("src", src[i]); 
        document.getElementsByTagName("head")[0].appendChild(s); 
    }
};
/****
 * Require
 */
FaWave.require = FaWave.loadJS;