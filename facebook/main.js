$(document).ready(function() {
  $(window).scroll(function() {
    var value = $(this).scrollTop();
    if (value > 20) {
      $(".radio-buttons").css("display", "none");
      $("button.btn").css("margin-bottom", "0");
    } else {
      $("button.btn").css("margin-bottom", "60px");
      $(".radio-buttons").css("display", "block");
    }
  });
});


function log(a) {
  console.log("%cFacebook main.js:%c ", "background: lightblue; color: green;", "background: none; color: black;", a);
}

function upload() {
  reset1();
  ga('send', {
    hitType: 'event',
    eventCategory: 'facebook',
    eventAction: 'upload'
  });

  var chatcounts = document.getElementsByName("chatcount");
  var prev = null;
  for (var i = 0; i < chatcounts.length; i++) {
    chatcounts[i].onclick = function() {
      if (this !== prev) {
        prev = this;
        set_checkboxes(null);
      }
    };
  }

  AFINN_main = getJSON();
  AFINN_negations = getNegations();

  var file = document.querySelector('input').files[0];

  var _callback2 = function(chats) {
    set_checkboxes(chats);
    document.getElementById("tohide").style["display"] = "block";
  }

  var _callback = function(_callback2) {
    var chats = getChats();

    _callback2(chats);
  }

  parse(file, _callback, _callback2);
}

function reset1() {
  document.getElementById("tohide").style["display"] = "none";
}

function reset2() {
  if (window.myChart != null) myChart.destroy();

  $('#messages').remove();
  $('#message_container').append('<canvas id="messages" class="messages"></canvas>');
}

function parse(file, _callback, _callback2) {
  var filereader = new FileReader();

  filereader.addEventListener("load", function() {
    var domparser = new DOMParser();
    doc = domparser.parseFromString(filereader.result, "text/html");
    _callback(_callback2);
  });

  filereader.readAsText(file);
}

function getChats() {
  name_lookups = [];
  chats = [
    [],
    []
  ];

  var divs = doc.firstChild.children[1].children[1].children;

  for (var i = 1; i < divs.length; i++) {
    var conversations = divs[i].children;

    for (var j = 0; j < conversations.length; j++) {
      var conversation_text = conversations[j].innerHTML;

      var conversation_members = conversation_text.substr(0, conversation_text.indexOf('<'));
      conversation_members = conversation_members.split(',');

      var broken_chat = false;
      var flen = '@facebook.com'.length;

      if (conversation_members.length > 1) {
        for (var p = 0; p < conversation_members.length; p++) {
          if (p > 0) conversation_members[p] = conversation_members[p].substr(1);
          var curr = conversation_members[p];

          if (name_lookups[curr] != null) {
            if (name_lookups[curr] == -1)
              broken = true;
            else {
              conversation_members[p] = name_lookups[curr];
              curr = conversation_members[p];
            }
          } else if (curr.length > 13 && curr.substr(curr.length - flen, flen) === '@facebook.com') {
            var id = curr.substr(0, curr.length - flen);
            var realname = getFacebookName(id);

            if (realname == -1)
              broken_chat = true;

            name_lookups[curr] = realname;
            conversation_members[p] = realname;
          } else {
            name_lookups[curr] = curr;
          }
        }
      }


      var fixed = "";
      for (var k = 0; k < conversation_members.length; k++) {
        if (k != 0) fixed += ", ";
        fixed += conversation_members[k];
      }

      doc.firstChild.children[1].children[1].children[i].children[j].innerHTML = fixed + conversation_text.substr(conversation_text.indexOf('<'));

      if (chats[0].indexOf(fixed) != -1) {
        chats[1][chats[0].indexOf(fixed)].push([i, j]);
      } else if (!broken_chat) {
        chats[0].push(fixed);
        chats[1].push([
          [i, j]
        ]);
      }

      if (divs[i].children.length != 1) {
        var progress = ((j + 1) / (divs[i].children.length - 1) + i - 1) / (divs.length - 1);
        console.log("first: ", progress > 1 ? "100%" : Math.round(progress * 1000) / 10 + "%");
      }
    }
  }


  return chats;
}

function getFacebookName(id) {
  var url = "https://graph.facebook.com/" + id + "?fields=name&access_token=1160822430692370|SYTqhceToo_BtWLlNhMzfEHH6A0";

  var response = httpGet(url);
  response = JSON.parse(response);

  if (response['error'])
    return -1;

  return response['name'];
}

/* This function was not written by me */
function httpGet(theUrl) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", theUrl, false); // false for synchronous request
  xmlHttp.send(null);
  return xmlHttp.responseText;
}

function set_checkboxes(chats) {
  var chatcount_selection = $('input[name=chatcount]:checked').val();
  if (chatcount_selection == null)
    chatcount_selection = "multiple_chats";

  if (chats === null) {
    var html = $('#checkbox').children().children().children("input");
    for (var i = 0; i < html.length; i++) {
      html[i].type = chatcount_selection == "single_chat" ? "radio" : "checkbox";
      html[i].name = chatcount_selection == "single_chat" ? "radio" : "checkbox";
      html[i].checked = false;
    }
  } else {

    var html = new DOMParser().parseFromString("<div id='checkbox1'></div><div id='checkbox2'></div>", "text/html");

    for (var i = 0; i < chats[0].length; i++) {
      var t = total(chats[1][i]);
      var len = chats[0][i].split(",").length;

      // var str = '<input type="checkbox" value="' + i + '">' + chats[0][i] + '\t' + t + '<br>';
      var inputElement = document.createElement('input');

      if (chatcount_selection == "multiple_chats") {
        inputElement.type = "checkbox";
      } else if (chatcount_selection = "single_chat") {
        inputElement.type = "radio";
        inputElement.name = "radio";
      }

      inputElement.id = "check" + i;

      inputElement.value = i;
      inputElement.checked = false;

      var labelElement = document.createElement('label');

      labelElement.innerHTML = chats[0][i] + " - " + t;

      labelElement.setAttribute("for", "check" + i);

      var divElement = document.createElement('div');
      divElement.appendChild(inputElement);
      divElement.appendChild(labelElement);

      if (len == 2)
        html.firstChild.children[1].children[0].appendChild(divElement);
      // document.getElementById("checkbox1").innerHTML += str;
      else if (len > 2)
        html.firstChild.children[1].children[1].appendChild(divElement);
      // document.getElementById("checkbox2").innerHTML += str;
      var progress = (i + 1) / chats[0].length;
      console.log("second: ", progress > 1 ? "100%" : Math.round(progress * 1000) / 10 + "%");
    }
    document.getElementById("checkbox").innerHTML = "";
    document.getElementById("checkbox").appendChild(html.firstChild.children[1].children[0]);
    document.getElementById("checkbox").appendChild(html.firstChild.children[1].children[0]);
  }
}

function total(a) {
  var tsum = 0;
  for (var i = 0; i < a.length; i++) {
    var t1 = a[i][0];
    var t2 = a[i][1];
    var conversation = doc.firstChild.children[1].children[1].children[t1].children[t2].children;

    for (var j = 0; j < conversation.length; j++)
      if ($(conversation[j]).is("p"))
        tsum++;
  }
  return tsum;
}

function plot() {
  reset2();
  ga('send', {
    hitType: 'event',
    eventCategory: 'facebook',
    eventAction: 'plot'
  });

  var temp = getData();

  var messages = temp.a;
  var labels = temp.b;

  graphsData = makeGraph(messages, labels);

  var ctx = $(".messages");

  myChart = new Chart(ctx, graphsData);
}

function getData() {
  var messages = [
    [],
    []
  ];
  var labels = [];

  var left = $("#checkbox1").children().children("input:checked").map(function() {
    return [chats[1][this.value]];
  });
  var right = $("#checkbox2").children().children("input:checked").map(function() {
    return [chats[1][this.value]];
  });

  //var checked_chats = left.concat(right);
  var checked_chats = left;
  for (var i = 0; i < right.length; i++)
    checked_chats.push(right[i]);

  for (var group = 0; group < checked_chats.length; group++) {
    temp = [];
    temp2 = [];
    var perday_messages = [];
    var cumulative_messages = [];

    for (var fragment = 0; fragment < checked_chats[group].length; fragment++) {
      cfrag = checked_chats[group][fragment];

      conversation = doc.firstChild.children[1].children[1].children[cfrag[0]].children[cfrag[1]];
      var conversation_text = conversation.innerHTML;
      var conversation_members_str = conversation_text.substr(0, conversation_text.indexOf('<'));
      var conversation_members = conversation_members_str.split(',');

      for (var i = 1; i < conversation_members.length; i++)
        conversation_members[i] = conversation_members[i].substr(1);

      time = conversation.children[conversation.children.length - 2].firstChild.children[1].innerHTML;
      time = time.substr(time.indexOf(',') + 2, time.indexOf(' at ') - time.indexOf(',') - 2);


      var chatcount_selection = $('input[name=chatcount]:checked').val();
      if (chatcount_selection == null)
        chatcount_selection = "multiple_chats";

      switch (chatcount_selection) {
        case "multiple_chats":
          var perday_data = {
            x: new Date(time),
            y: 1
          };
          var cumulative_data = {
            x: new Date(time),
            y: 1
          };
          break;
        case "single_chat":
          var perday_data = {
            x: new Date(time),
            y: perday_messages
          };
          var cumulative_data = {
            x: new Date(time),
            y: cumulative_messages
          };
          break;
      }
      var convoLen = conversation.children.length;
      for (var i = convoLen - 2; i >= 0; i -= 2) {
        var speaker = conversation.children[i].firstChild.firstChild.innerHTML;
        speaker = name_lookups[speaker];

        var message_time = conversation.children[i].firstChild.children[1].innerHTML;
        message_time = message_time.substr(message_time.indexOf(',') + 2, message_time.indexOf(' at ') - message_time.indexOf(',') - 2);

        if (perday_messages[speaker] == null) {
          perday_messages[speaker] = 0;
          perday_messages.length++;
        }
        if (cumulative_messages[speaker] == null) {
          cumulative_messages[speaker] = 0;
          cumulative_messages.length++;
        }


        var type_selection = $('input[name=type]:checked').val();

        if (type_selection == null)
          type_selection = "total_messages";

        switch (type_selection) {
          case "total_messages":
            perday_messages[speaker]++;
            cumulative_messages[speaker]++;
            break;
          case "happy_emojis":
            var said = conversation.children[i + 1].innerHTML;
            var times = (said.match(/[:;][)D]|[(][:;]|:P|❤️/g) || []).length;
            perday_messages[speaker] += times;
            cumulative_messages[speaker] += times;
            break;
          case "sentiment_analysis":
            var message_text = conversation.children[i + 1].innerHTML;
            var message_words = message_text.split(/\W/);

            var sentiment = 0;
            for (var w = 0; w < message_words.length; w++) {
              message_words[w] = message_words[w].toLowerCase();
              if (AFINN_main.hasOwnProperty(message_words[w])) {
                if (w != 0 && AFINN_negations.indexOf(message_words[w - 1]) != -1)
                  sentiment -= AFINN_main[message_words[w]];
                else
                  sentiment += AFINN_main[message_words[w]];
              }
            }

            sentiment += (message_text.match(/[:;][)D]|[(][:;]|:P/g) || []).length * 2;
            sentiment += (message_text.match(/❤️/g) || []).length * 5;

            perday_messages[speaker] += sentiment;
            cumulative_messages[speaker] += sentiment;

            break;
        }



        if (new Date(message_time).toString() == perday_data.x.toString()) {
          switch (chatcount_selection) {
            case "multiple_chats":
              perday_data.y = sum(perday_messages, conversation_members);
              cumulative_data.y = sum(cumulative_messages, conversation_members);
              break;
            case "single_chat":
              perday_data.y = perday_messages;
              cumulative_data.y = cumulative_messages;
              break;
          }
        } else {
          switch (chatcount_selection) {
            case "multiple_chats":
              temp.push(perday_data);
              temp2.push(cumulative_data);
              break;
            case "single_chat":
              var perday_data_deepcopy = [];
              var cumulative_data_deepcopy = [];
              for (var dc = 0; dc < conversation_members.length; dc++) {
                perday_data_deepcopy[conversation_members[dc]] = perday_data.y[conversation_members[dc]];
                cumulative_data_deepcopy[conversation_members[dc]] = cumulative_data.y[conversation_members[dc]];
              }
              temp.push({
                x: perday_data.x,
                y: perday_data_deepcopy
              });
              temp2.push({
                x: cumulative_data.x,
                y: cumulative_data_deepcopy
              });
              break;
          }


          switch (chatcount_selection) {
            case "multiple_chats":
              perday_messages = r(perday_messages, conversation_members);

              perday_data = {
                x: new Date(message_time),
                y: sum(perday_messages, conversation_members)
              };
              cumulative_data = {
                x: new Date(message_time),
                y: sum(cumulative_messages, conversation_members)
              };
              break;
            case "single_chat":
              perday_messages = r(perday_messages, conversation_members);

              perday_data = {
                x: new Date(message_time),
                y: []
              };
              cumulative_data = {
                x: new Date(message_time),
                y: cumulative_messages
              };
              break;
          }

        }


      }
    }

    switch (chatcount_selection) {
      case "multiple_chats":
        labels.push(conversation_members_str);
        break;
      case "single_chat":
        labels = conversation_members;
        break;
    }

    messages[0].push(temp);
    messages[1].push(temp2);
  }


  return {
    a: messages,
    b: labels
  };
}

function sum(array, keys) {
  var isum = 0;
  for (var i = 0; i < keys.length; i++) {
    if (array[keys[i]] != null) isum += array[keys[i]];
  }
  return isum;
}

function r(array, keys) {
  for (var i = 0; i < keys.length; i++) {
    array[keys[i]] = 0;
  }
  return array;
}

function makeGraph(messages, labels) {
  // console.log(messages);
  var graphsData = {
    type: 'line',
    data: {
      datasets: []
    },

    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }],
        xAxes: [{
          type: 'time',
          time: {
            displayFormats: {
              'millisecond': 'MMM DD',
              'second': 'MMM DD',
              'minute': 'MMM DD',
              'hour': 'MMM DD',
              'day': 'MMM DD',
              'week': 'MMM DD',
              'month': 'MMM DD',
              'quarter': 'MMM DD',
              'year': 'MMM DD',
            }
          }
        }]
      }
    }
  };

  var user = doc.firstChild.firstChild.children[1].innerHTML;
  user = user.substr(0, user.indexOf(' - '));

  var perday_or_cumulative = $('input[name=counting]:checked').val();
  if (perday_or_cumulative == null) perday_or_cumulative = 1;

  var chatcount_selection = $('input[name=chatcount]:checked').val();
  if (chatcount_selection == null)
    chatcount_selection = "multiple_chats";

  switch (chatcount_selection) {
    case "multiple_chats":

      for (var i = 0; i < messages[perday_or_cumulative].length; i++) {
        tmparr = [];
        var oldarr = messages[perday_or_cumulative][i];
        newarr = [];

        var j;
        for (j = 1; j < oldarr.length; j++) {
          var time1 = new Date(oldarr[j].x);
          var time2 = new Date(oldarr[j - 1].x);

          if (time1 < time2) {
            //found inconsistancy in data
            newarr.push(tmparr);
            tmparr = [oldarr[j]];
          } else {
            tmparr.push(oldarr[j]);
          }
        }
        if (j == 1) {
          newarr.push([oldarr[0]]);
        } else {
          newarr.push(tmparr);
        }

        peeps = labels[i].split(", ");
        seed = peeps[0];

        for (var p = 0; p < peeps.length; p++) {
          if (peeps[p] !== user) {
            seed = peeps[p];
            break;
          }
        }

        var tmpColor = generateColor(seed);
        for (var n = 0; n < newarr.length; n++) {
          graphsData.data.datasets.push({
            label: labels[i].length >= 30 ? labels[i].substr(0, 30) + "..." : labels[i],
            type: 'line',
            data: newarr[n],
            backgroundColor: 'rgba(1,212,255,0)',
            borderColor: tmpColor,
            lineTension: 0
          });
        }
      }

      break;
    case "single_chat":
      var newdata = [];
      for (var j = 0; j < labels.length; j++)
        newdata.push([]);

      messages = messages[perday_or_cumulative][0];

      for (var i = 0; i < messages.length; i++) {
        for (var j = 0; j < labels.length; j++) {
          newdata[j][i] = {
            x: messages[i].x,
            y: messages[i].y[labels[j]]
          }
        }
      }

      for (var i = 0; i < newdata.length; i++) {
        var seed = labels[i];

        var tmpColor = generateColor(seed);

        graphsData.data.datasets.push({
          label: labels[i].length >= 30 ? labels[i].substr(0, 30) + "..." : labels[i],
          type: 'line',
          data: newdata[i],
          backgroundColor: 'rgba(1,212,255,0)',
          borderColor: tmpColor,
          lineTension: 0
        });
      }


      break;
  }
  return graphsData;
}
