function log(a){
	console.log("%cFacebook main.js:%c "+a,"background: lightblue; color: green;","background: none; color: black;");
}
function e_log(a){
	console.log("%cError in main.js:%c "+a,"background: red; color: green;","background: none; color: black;");
}

/* This function was not written by me */
function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}
function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

dates=[];
messages=[];
people=[];
chats=[[],[]];
lookups=[];
function pick_person(){
	parse(
		function(){
			// var counter=0;
			log("gathering chats and correcting FB id's");
			var divs=doc.firstChild.children[1].children[1].children;
			for (var i=1;i<divs.length;i++){
				for (var j=0;j<divs[i].children.length;j++){
					convo=divs[i].children[j];
					var convoText=convo.innerHTML;
					people=convoText.substr(0,convoText.indexOf('<'));
					apeople=people.split(',');

					var broken=false;
					var flen='@facebook.com'.length;
					if (apeople.length>1){
						for (var u=0;u<apeople.length;u++){
							if (u>0) apeople[u]=apeople[u].substr(1);

							if (lookups[apeople[u]]!=null){
								apeople[u]=lookups[apeople[u]];
							}else if (apeople[u].length>13 && apeople[u].substr(apeople[u].length-flen,flen)==='@facebook.com'){
								// log(++counter);
								id=apeople[u].substr(0,apeople[u].length-flen);
								url="https://graph.facebook.com/"+id+"?fields=name&access_token=1160822430692370|SYTqhceToo_BtWLlNhMzfEHH6A0";

								response=httpGet(url);
								response=JSON.parse(response);
								if (response['error']){
									e_log("user with id "+id+" does not exist");
									broken=true;
								}else{
									lookups[apeople[u]]=response['name'];

									// log(apeople[u]+" is now "+response['name']);
									apeople[u]=response['name'];
								}
								
							}
						}
					}

					people="";
					for (var k=0;k<apeople.length;k++){
						if (k!=0) people+=", ";
						people+=apeople[k];
					}

					if (chats[0].indexOf(people)!=-1){
						chats[1][chats[0].indexOf(people)].push([i,j]);
						// log("push("+people+")");
					}else if(!broken){
						chats[0].push(people);
						chats[1].push([[i,j]]);
					}
				}
			}

			for (var i=0;i<chats[0].length;i++){
				document.getElementById("select").innerHTML+="<option value='"+i+"'>"+chats[0][i]+"</option><br>";
			}


			document.getElementById("tohide").style["display"]="block";
		}
	);
	
}

function parse(_callback){
	log("starting...");
	messages=[[],[]];
	var temp=[];
	var string;

	var reader = new FileReader();
	reader.addEventListener("load", function() {
		string=reader.result;
		log("read file");
		var parser = new DOMParser();
		doc = parser.parseFromString(string, "text/html");
		log("parsed file");
		_callback(); 
	});
	reader.readAsText(document.querySelector('input').files[0]);
}

function start(){
	messages[0]=[];
	messages[1]=[];
	mpeople=[];
	mpeople2=[];

	cval=$("#select").val();
	current=chats[1][cval];

	for (var fragment=0;fragment<current.length;fragment++){
		cfrag=current[fragment];
		convo=doc.firstChild.children[1].children[1].children[cfrag[0]].children[cfrag[1]];
		var convoText=convo.innerHTML;
		people=convoText.substr(0,convoText.indexOf('<'));
		people=people.split(',');
		for (var i=1;i<people.length;i++) people[i]=people[i].substr(1);
		log("found people "+people);


		time=convo.children[convo.children.length-(convo.children.length%2==0 ? 2:1)].firstChild.children[1].innerHTML;
		time=time.substr(time.indexOf(',')+2,time.indexOf(' at ')-time.indexOf(',')-2);
		var toPush={x: new Date(time), y: 1 };
		var toPush2={x: new Date(time), y: 1 };
		for (var i=convo.children.length-(convo.children.length%2==0 ? 4:3);i>=0;i-=2){

			var speaker=convo.children[i].firstChild.firstChild.innerHTML;
			var time=convo.children[i].firstChild.children[1].innerHTML;
			time=time.substr(time.indexOf(',')+2,time.indexOf(' at ')-time.indexOf(',')-2);
			
			if (mpeople[speaker]==null) mpeople[speaker]=0;
			if (mpeople2[speaker]==null) mpeople2[speaker]=0;

			mpeople[speaker]++;
			mpeople2[speaker]++;
			if (new Date(time).toString()==toPush.x.toString()){
				var a=sum(mpeople,people);
				var b=sum(mpeople2,people);
				toPush.y=a;
				toPush2.y=b;
			}else{
				messages[0].push(toPush);
				messages[1].push(toPush2);
				
				mpeople=r(mpeople,people);
				

				var a=sum(mpeople,people);
				var b=sum(mpeople2,people);
				toPush={x: new Date(time), y: a};
				toPush2={x: new Date(time), y: b};
			}
		}
	}
	log("gathered messages");
	
	drawGraph();
}

function sum(a,b){
	var s=0;
	for (var i=0;i<b.length;i++){
		if (a[b[i]]!=null) s+=a[b[i]];
	}
	return s;
}

function r(a,b){
	for (var i=0;i<b.length;i++){
		a[b[i]]=0;
	}
	return a;
}
function reset(){
	$('#messages').remove();
	$('#message_container').append('<canvas id="messages" class="messages"></canvas>');
}

function drawGraph(){
	log("reseting...");
	reset();
	log("plotting graph...");

	document.getElementById("messages").style["display"]="block";
	var ctx = $(".messages");

	var graphsData={
	    type: 'line',
	    data: {
			datasets: [
				{
					label: 'cumulative',	    
					type: 'line',
					data: messages[1],
					backgroundColor: 'rgba(1,212,255,.1)',
		            borderColor: 'rgba(1,212,255,.5)',
		            lineTension: 0
				},
				{
					label: 'per day',	    
					type: 'line',
					data: messages[0],
					backgroundColor: 'rgba(226,78,78,.1)',
		            borderColor: 'rgba(226,78,78,.5)',
		            lineTension: 0
				}
				
			]
		},
	    
	    options: {
	        scales: {
	            yAxes: [{
	                ticks: {
	                    beginAtZero:true
	                }
	            }],
				xAxes: [{
					type: 'time',
					time: {
						displayFormats: {
							'millisecond': 'MMM DD',
							'second': 'MMM DD',
							'minute': 'MMM DD',
							'hour': 'MMM DD',
							'day': 'MMM DD',
							'week': 'MMM DD',
							'month': 'MMM DD',
							'quarter': 'MMM DD',
							'year': 'MMM DD',
						}
					}
				}]
	        }
	    }
	};
	console.log(graphsData);
	myChart = new Chart(ctx, graphsData);
}