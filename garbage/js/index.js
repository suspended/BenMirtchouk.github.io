// Script to control the counter:
// https://github.com/cnanney/css-flip-counter/blob/master/js/flipcounter.js

var date=new Date();

var aids=new Date(2016,4,15,14,4,0,0);

var defaults = {
  value: parseInt((date.getTime()-aids.getTime())/1000,10), inc: 1, pace: 1000, auto: true
};

var c1 = new flipCounter('c1', defaults);
