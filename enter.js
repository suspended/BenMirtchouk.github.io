answer1=0;
stepCount=0;

$( document ).ready(function() {
  var activeQuestion=0;
  $('span').bind("enterKey",function(e){
    var tempInp=getInput(document.getElementById('input').innerHTML);
    console.log(tempInp);
    if(tempInp.toLowerCase()==="ls"){
      activeQuestion=-1;
      prepareType();
      typeString("Interesting. I suppose I'll let you do that.EOF.");
      
      setTimeout(function(){
        prepareType2();
        typeString(".      flag.txt@EOF.");

        setTimeout(function(){
          prepareType2();
          typeString("~$@EOF.");
        }, 1000);
      }, 2000);
      
    }else{
      switch(activeQuestion){
        case 0:
        if (tempInp.toLowerCase().startsWith("y")){
          prepareType();
          typeString("Good Choice, press enter to continue (Or maybe stick around and test some stuff out).EOF.");
          answer1++;
        }else{
          prepareType();
          typeString("Hmm, that's a shame.EOF.");
        }
        activeQuestion++;
        break;
        case 1:
        if (answer1==1)
          window.location = "/home";
        else
          document.getElementById('oldText').className+=" hinge animated";
          setTimeout( step, 2000 );
        break;
      }
    }
  });
  $('span').keyup(function(e){
      if(e.keyCode == 13)
      {
          $(this).trigger("enterKey");
      }
  });
});

function step(){
  if (stepCount==0){
    document.getElementById('text').className+=" hinge animated";
    stepCount++;
    setTimeout( step, 2000 );
  }else{
    window.location = "/end.html";
  }
}

function prepareType(){
  document.getElementById('text').innerHTML+=" "+getInput(document.getElementById('input').innerHTML)+"";
  prepareType2();
}

function prepareType2(){
  document.getElementById('text').id="oldText";
  document.getElementById('texts').innerHTML+='<br>';
  document.getElementById('texts').innerHTML+='<br>';
  document.getElementById('texts').innerHTML+='<p id="text" class="text UbuntuFont"></p>'; 
}

function getInput(str){
  var rstr=str.split('').reverse().join('');
  var open=rstr.indexOf("<");
  var close=rstr.indexOf(">",open);
  if (close==-1){
    if (open==-1) return str;
    return getInput(rstr.substring(open+1).split('').reverse().join(''));
  }
  if (rstr.substring(open+1,close).split('').reverse().join('')==="") return getInput(rstr.substring(close).split('').reverse().join(''));
  return rstr.substring(open+1,close).split('').reverse().join('');
}