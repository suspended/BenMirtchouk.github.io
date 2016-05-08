function onhover(){
	$("div.me").hover(
		function() {
			$( this ).addClass("shake");
		}, function() {
			$( this ).removeClass("shake");
		}
	);
}