var activeQuestion=0;
$('span').bind("enterKey",function(e){
	console.log("asd");
   switch(activeQuestion){
   	case 0:
   		console.log("asd");
   		break;

   	case 1:
   		break;
   }
});
$('span').keyup(function(e){
    if(e.keyCode == 13)
    {
        $(this).trigger("enterKey");
    }
});