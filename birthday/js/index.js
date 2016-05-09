// Script to control the counter:
// https://github.com/cnanney/css-flip-counter/blob/master/js/flipcounter.js

var date=new Date();

var birthday=new Date(date.getFullYear(),3,11,0,0,0,0);

if (date.getTime()>birthday.getTime()){
	birthday=new Date(date.getFullYear()+1,3,11,0,0,0,0);
}

var defaults = {
  value: parseInt((birthday.getTime()-date.getTime())/1000,10), inc: -1, pace: 1000, auto: true
};

var c1 = new flipCounter('c1', defaults);
