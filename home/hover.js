function onhover(){
	$("#BenMirt").hover(
		function() {
			$( this ).addClass("pulse animated");
			$(".name").css("display","block");
			$( ".name" ).removeClass("zoomOut");
			$( ".name" ).addClass("zoomIn");
			if (!blinking){
				blinking=true;
				startBlink();
			}
		}, function() {
			$( this ).removeClass("pulse animated");
			$( ".name" ).removeClass("zoomIn");
			$( ".name" ).addClass("zoomOut");
			blinking=false;
		}
	);
}
counter=0;
blinking=false;
colors=["red","orange","yellow","green","blue","indigo", "purple"];
function startBlink(){
	if (blinking){
		var num;
		for (num=1;num<8;num++){
	    	change(num);
		}

		counter++;
		setTimeout( startBlink, 80 );
	}
}

function change(i){
	if (counter==7) counter=0;
	$( "#anytime"+i ).css("color",colors[(i+counter)%colors.length]);



}