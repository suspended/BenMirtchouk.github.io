function refocus(){
	if (document.getElementById("noType").value==0)
		document.getElementById("input").focus();
}
function unfocus(){
	document.getElementById("noType").focus();
}