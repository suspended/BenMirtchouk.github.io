// Script to control the counter:
// https://github.com/cnanney/css-flip-counter/blob/master/js/flipcounter.js

var date=new Date();

var wink=new Date(2017,2,14,8,0,0,0);

var defaults = {
  value: parseInt((wink.getTime()-date.getTime())/1000,10), inc: -1, pace: 1000, auto: true
};

var c1 = new flipCounter('c1', defaults);
