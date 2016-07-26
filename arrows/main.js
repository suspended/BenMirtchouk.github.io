arr=[37,40,39,38];
arr2=[];
arr2[37]=0;
arr2[40]=1;
arr2[39]=2;
arr2[38]=3;
arr3=[];
arr3[65]=37;
arr3[83]=40;
arr3[68]=39;
arr3[87]=38;
arr3[37]=37;
arr3[40]=40;
arr3[39]=39;
arr3[38]=38;
arr3[70]=38;

clicked=[];

window.onkeyup = function(e) {
	var key = e.keyCode ? e.keyCode : e.which;
	console.log(key);
	if (clicked.length==0){
		if ((key>=37 && key<=40) || key==65 || key==87 || key==83 || key==68){
			clicked.push(arr3[key]);
			start=+new Date();
		}
	}else{
		var prev=clicked[clicked.length-1];
		if (arr3[key]==arr[(arr2[prev]+1)%4]){
			clicked.push(arr3[key]);
			current=+new Date();

			document.getElementById("current").innerHTML=Math.round(clicked.length*250000/(current-start))/1000;
			document.getElementById("rotations-done").innerHTML=clicked.length/4;
			document.getElementById("time-done").innerHTML=(current-start)/1000;
		}else{
			end=+new Date();
			if (clicked.length>=8 && clicked.length*250/(end-start) > document.getElementById("highscore").innerHTML){
				document.getElementById("highscore").innerHTML=Math.round(clicked.length*250000/(end-start))/1000;
				document.getElementById("rotations").innerHTML=clicked.length/4;
				document.getElementById("time").innerHTML=(end-start)/1000;
			}
			clicked=[];
			document.getElementById("current").innerHTML=0;
			document.getElementById("rotations-done").innerHTML=0;
			document.getElementById("time-done").innerHTML=0;


		}
	}


}