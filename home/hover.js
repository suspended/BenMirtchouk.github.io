
function onhover(){
	$("#BenMirt").hover(
		function() {
			$( this ).addClass("pulse animated");
			$(".name").css("display","block");
		}, function() {
			$( this ).removeClass("pulse animated");
			$(".name").css("display","none");
		}
	);
}
