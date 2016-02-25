window.fbAsyncInit = function() {
  FB.init({
    appId      : '158436701207354',
    cookie     : true,  // enable cookies to allow the server to access 
                        // the session
    xfbml      : true,  // parse social plugins on this page
    version    : 'v2.5' 
  });
}



(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

FB.api(
    "/{1099989246698504}",
    function (response) {
      if (response && !response.error) {
        console.log(JSON.stringify(response));
      }
    }
);