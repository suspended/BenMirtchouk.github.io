
function onhover(){
	$("#BenMirt").hover(
		function() {
			$( this ).addClass("pulse animated");
			$(".name").css("display","block");
			$( ".name" ).removeClass("zoomOut");
			$( ".name" ).addClass("zoomIn");
			startBlink();
		}, function() {
			$( this ).removeClass("pulse animated");
			$( ".name" ).removeClass("zoomIn");
			$( ".name" ).addClass("zoomOut");
		}
	);
}
