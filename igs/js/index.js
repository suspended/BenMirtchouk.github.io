// Script to control the counter:
// https://github.com/cnanney/css-flip-counter/blob/master/js/flipcounter.js

var date=new Date();

var igs=new Date(date.getFullYear(),date.getMonth(),date.getDate(),7,56,0,0);

if (date.getTime()>igs.getTime()){
	igs=new Date(date.getFullYear(),date.getMonth(),date.getDate()+1,7,56,0,0);
}

if (igs.getDay()==0) igs=new Date(igs.getFullYear(),igs.getMonth(),igs.getDate()+1,7,56,0,0);
if (igs.getDay()==6) igs=new Date(igs.getFullYear(),igs.getMonth(),igs.getDate()+2,7,56,0,0);


var defaults = {
  value: parseInt((igs.getTime()-date.getTime())/1000,10), inc: -1, pace: 1000, auto: true
};

var c1 = new flipCounter('c1', defaults);
