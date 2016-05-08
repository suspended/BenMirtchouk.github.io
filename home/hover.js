function onhover(){
	$("#BenMirt").hover(
		function() {
			$( this ).addClass("shake animated");
		}, function() {
			$( this ).removeClass("shake animated");
		}
	);
}