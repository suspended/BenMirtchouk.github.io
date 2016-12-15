/*
Most of this code is not written by me
I just modified it to work for my purposes
*/
var s = 0.99;
var v = 0.99;
var h=Math.random();

//http://martin.ankerl.com/2009/12/09/how-to-create-random-colors-programmatically/
function generateColor() {
    var goldenRatioConjugate = 0.618033988749895
    h += goldenRatioConjugate;
    h %= 1;
    var color = hsv2rgb(h, s, v);
    return "rgba(" + color.red + "," + color.green + "," + color.blue + ",.5)";
}

//hsv2rgb from http://jsres.blogspot.com/2008/01/convert-hsv-to-rgb-equivalent.html
function hsv2rgb(h, s, v) {
    var r, g, b;
    var RGB = new Array();
    if (s == 0) {
        RGB['red'] = RGB['green'] = RGB['blue'] = Math.round(v * 255);
    } else {
        var var_h = h * 6;
        if (var_h == 6)
            var_h = 0;
        var var_i = Math.floor(var_h);
        var var_1 = v * (1 - s);
        var var_2 = v * (1 - s * (var_h - var_i));
        var var_3 = v * (1 - s * (1 - (var_h - var_i)));
        if (var_i == 0) {
            var_r = v;
            var_g = var_3;
            var_b = var_1;
        } else if (var_i == 1) {
            var_r = var_2;
            var_g = v;
            var_b = var_1;
        } else if (var_i == 2) {
            var_r = var_1;
            var_g = v;
            var_b = var_3
        } else if (var_i == 3) {
            var_r = var_1;
            var_g = var_2;
            var_b = v;
        } else if (var_i == 4) {
            var_r = var_3;
            var_g = var_1;
            var_b = v;
        } else {
            var_r = v;
            var_g = var_1;
            var_b = var_2
        }
        //rgb results = 0 ÷ 255  
        RGB['red'] = Math.round(var_r * 255);
        RGB['green'] = Math.round(var_g * 255);
        RGB['blue'] = Math.round(var_b * 255);
    }
    return RGB;
};