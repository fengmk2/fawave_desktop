var FaWave = window.FaWave = {};

/*******
 * 加载JS
 */
FaWave.loadJS = function(src){
    var s = document.createElement("script");
    s.setAttribute("src", src); 
    $("head").append(s);
};