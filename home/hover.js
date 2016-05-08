function onhover(){
	$("#BenMirt").hover(
		function() {
			$( this ).addClass("pulse animated");
		}, function() {
			$( this ).removeClass("pulse animated");
		}
	);
}