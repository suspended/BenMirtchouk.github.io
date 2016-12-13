function log(a){
	console.log("%cFacebook main.js:%c "+a,"background: lightblue; color: green;","background: none; color: black;");
}
function e_log(a){
	console.log("%cError in main.js:%c "+a,"background: red; color: green;","background: none; color: black;");
}

dates=[];
messages=[];
people=[];

function start(){
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

		convo=doc.firstChild.children[1].children[1].children[1].children[0];
		var convoText=convo.innerHTML;
		people=convoText.substr(0,convoText.indexOf('<'));
		people=people.split(',');
		people[1]=people[1].substr(1);
		log("found people");

		mpeople=[];
		mpeople[people[0]]=0;
		mpeople[people[1]]=0;

		time=convo.children[convo.children.length-(convo.children.length%2==0 ? 2:1)].firstChild.children[1].innerHTML;
		time=time.substr(time.indexOf(',')+2,time.indexOf(' at ')-time.indexOf(',')-2);
		var toPush={x: new Date(time), y: 0 };
		for (var i=convo.children.length-(convo.children.length%2==0 ? 4:3);i>=0;i-=2){
			var speaker=convo.children[i].firstChild.firstChild.innerHTML;
			var time=convo.children[i].firstChild.children[1].innerHTML;
			time=time.substr(time.indexOf(',')+2,time.indexOf(' at ')-time.indexOf(',')-2);
			mpeople[speaker]++;
			if (new Date(time).toString()==toPush.x.toString()){
				toPush.y=mpeople[people[0]] + mpeople[people[1]];
			}else{
				messages[0].push(toPush);
				toPush={x: new Date(time), y: mpeople[people[0]] + mpeople[people[1]]};
			}
		}
		log("gathered messages");



		
		drawGraph();
	});
	reader.readAsText(document.querySelector('input').files[0]);


	// dates=[];
	// var a=$("#start").val();
	// var b=$("#end").val();
	// if (a==""){
	// 	e_log("no start date");
	// 	return;
	// }
	// if (b=="") b=new Date();
	// else try{
	// 	b=new Date(b);
	// }catch(err){e_log("b is not a date"); return;}
	// try{
	// 	a=new Date(a);
	// }catch(err){e_log("a is not a date"); return;}

	

}

function drawGraph(){
	log("plotting graph...");
	var ctx = $(".messages");
	var myChart = new Chart(ctx, {
		title: {
			text: 'conversation between '+people[0]+' and '+people[1]
	    },
	    type: 'line',
	    data: {
	        //labels: dates,
	        //dataPoints: [ messages[0] ]
			datasets: [{
				label: '# of messages sent',
				data: messages[0]
			}]
			datasets: [{
				label: '# of messages sent',
				data: messages[1]
			}]
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
	});
}