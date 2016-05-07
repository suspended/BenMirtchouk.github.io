window.onload=type;


var data="Hi, I'm Ben Mirtchouk! Nice to meet you!EOF.";

var sentences=[];
for (k=0;k<data.length;k++){
	var letter=data.substring(k,k+1);
	if (letter=="." || letter=="?" || letter=="!"){
		if (data.substring(0,k+1)=="EOF.") sentences.push("");
		else sentences.push(data.substring(0,k+1));
		data=data.substring(k+1,data.length);
		k=-1;
	}
}


var sentenceCount=0;
var letterCount=0;
var counter2=0;
var infiniteCount=0;

function type(){
	if (sentenceCount==sentences.length) return;
	if (sentences[sentenceCount]==""){
		infBlink();
		return;
	}

	document.getElementById("text").innerHTML+=sentences[sentenceCount].substring(letterCount,letterCount+1);

	letterCount++;
	if (letterCount==sentences[sentenceCount].length){
		letterCount=0;
		sentenceCount++;
		counter2=0;
		setTimeout( blink, 300 );
	}else{
		setTimeout( type, 60 );
	}
}

function blink(){
	//debugger;
	if (counter2==4) setTimeout( type, 60 );
	else{
		if (counter2%2==0) document.getElementById("cursor").innerHTML="<strong style='color: black'>_</strong>";
		else document.getElementById("cursor").innerHTML="<strong style='color: #00FF00'>_</strong>";
		counter2++;
		setTimeout( blink, 300 );
	}
}

function infBlink(){
	if (infiniteCount%2==0) document.getElementById("cursor").innerHTML="<strong style='color: black'>_</strong>";
	else document.getElementById("cursor").innerHTML="<strong style='color: #00FF00'>_</strong>";
	infiniteCount++;
	setTimeout( infBlink, 300 );
}