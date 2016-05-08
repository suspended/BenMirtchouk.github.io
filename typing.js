started=false;
function typeString(data){
	sentences=[];
	for (k=0;k<data.length;k++){
		var letter=data.substring(k,k+1);
		if (letter=="." || letter=="?" || letter=="!" || letter==":"){
			if (data.substring(0,k+1)=="EOF.") sentences.push("");
			else sentences.push(data.substring(0,k+1));
			data=data.substring(k+1,data.length);
			k=-1;
		}
	}

	sentenceCount=0;
	letterCount=0;
	counter2=true;
	infiniteCount=true;

	start();
}

function start(){
	if (!started) infBlink();
	refocus();
	type();
	started=true;
}




function type(){
	if (sentenceCount==sentences.length || sentences[sentenceCount]==""){
		document.getElementById("noType").value=0;
		refocus();
		return;
	}else{
		document.getElementById("noType").value=1;
	}

	document.getElementById("text").innerHTML+=sentences[sentenceCount].substring(letterCount,letterCount+1);

	letterCount++;
	if (letterCount==sentences[sentenceCount].length){
		letterCount=0;
		sentenceCount++;
		counter2=true;
		setTimeout( wait, 200 );
	}else{
		setTimeout( type, 60 );
	}
}

function wait(){
	if (!counter2) setTimeout( type, 60 );
	else{
		setTimeout( wait, 800 );
		counter2=false;
	}
}

function infBlink(){
	if (infiniteCount) document.getElementById("cursor").innerHTML="<strong style='color: black'>_</strong>";
	else document.getElementById("cursor").innerHTML="<strong style='color: #00FF00'>_</strong>";
	infiniteCount=!infiniteCount;
	setTimeout( infBlink, 300 );
}