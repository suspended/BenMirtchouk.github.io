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
function pick_person(){
	parse(
		function(){
			var divs=doc.firstChild.children[1].children[1].children;
			for (var i=1;i<divs.length;i++){
				for (var j=0;j<divs[i].children.length;j++){
					convo=divs[i].children[j];
					var convoText=convo.innerHTML;
					people=convoText.substr(0,convoText.indexOf('<'));
					apeople=people.split(',');
					if (apeople.length>1){
						var flen='@facebook.com'.length;
						for (var u=0;u<apeople.length;u++){
							if (u>0) apeople[u]=apeople[u].substr(1);

							if (apeople[u].length>13 && apeople[u].substr(apeople[u].length-flen,flen)==='@facebook.com'){
								id=apeople[u].substr(0,apeople[u].length-flen);
								url="https://graph.facebook.com/"+id+"?fields=name&access_token=1160822430692370|SYTqhceToo_BtWLlNhMzfEHH6A0";

								response=httpGet(url);
								response=JSON.parse(response);
								if (response['error']){
									e_log("user with id "+id+" does not exist");
								}else{
									log(apeople[u]+" is now "+response['name']);
									apeople[u]=response['name'];
								}

							}
						}
					}
					people=apeople[0]+", "+apeople[1];
					if (chats[0].indexOf(people)!=-1){
						chats[1][chats[0].indexOf(people)].push([i,j]);
						// log("push("+people+")");
					}else{
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

	var tmp_people=chats[0][cval];
	tmp_people=tmp_people.split(',');
	tmp_people[1]=tmp_people[1].substr(1);

	mpeople[tmp_people[0]]=0;
	mpeople[tmp_people[1]]=0;
	mpeople2[tmp_people[0]]=0;
	mpeople2[tmp_people[1]]=0;

	for (var fragment=0;fragment<current.length;fragment++){
		cfrag=current[fragment];
		convo=doc.firstChild.children[1].children[1].children[cfrag[0]].children[cfrag[1]];
		var convoText=convo.innerHTML;
		people=convoText.substr(0,convoText.indexOf('<'));
		people=people.split(',');
		people[1]=people[1].substr(1);
		log("found people "+people[0]+" and "+people[1]);


		time=convo.children[convo.children.length-(convo.children.length%2==0 ? 2:1)].firstChild.children[1].innerHTML;
		time=time.substr(time.indexOf(',')+2,time.indexOf(' at ')-time.indexOf(',')-2);
		var toPush={x: new Date(time), y: 1 };
		var toPush2={x: new Date(time), y: 1 };
		for (var i=convo.children.length-(convo.children.length%2==0 ? 4:3);i>=0;i-=2){

			var speaker=convo.children[i].firstChild.firstChild.innerHTML;
			var time=convo.children[i].firstChild.children[1].innerHTML;
			time=time.substr(time.indexOf(',')+2,time.indexOf(' at ')-time.indexOf(',')-2);
			mpeople[speaker]++;
			mpeople2[speaker]++;
			if (new Date(time).toString()==toPush.x.toString()){
				toPush.y=mpeople[people[0]] + mpeople[people[1]];
				toPush2.y=mpeople2[people[0]] + mpeople2[people[1]];
			}else{
				messages[0].push(toPush);
				messages[1].push(toPush2);
				
				mpeople[people[0]]=0;
				mpeople[people[1]]=0;
				toPush={x: new Date(time), y: mpeople[people[0]] + mpeople[people[1]]};
				
				toPush2={x: new Date(time), y: mpeople2[people[0]] + mpeople2[people[1]]};
			}
		}
	}
	log("gathered messages");
	
	drawGraph();
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
			title: {
				text: 'conversation between '+people[0]+' and '+people[1]
		    },
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