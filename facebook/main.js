function log(a) {
  console.log("%cFacebook main.js:%c ", "background: lightblue; color: green;", "background: none; color: black;", a);
}

function upload() {
  reset1();

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
  html = new DOMParser().parseFromString("<div id='checkbox1'></div><div id='checkbox2'></div>", "text/html");

  for (var i = 0; i < chats[0].length; i++) {
    var t = total(chats[1][i]);
    var len = chats[0][i].split(",").length;

    // var str = '<input type="checkbox" value="' + i + '">' + chats[0][i] + '\t' + t + '<br>';
    var inputElement = document.createElement('input');
    inputElement.type = "checkbox";
    inputElement.value = i;

    var spanElement = document.createElement('span');
    spanElement.innerHTML = chats[0][i] + " - ";

    var spanElement2 = document.createElement('span');
    spanElement2.innerHTML = t;

    var divElement = document.createElement('div');
    divElement.appendChild(inputElement);
    divElement.appendChild(spanElement);;
    divElement.appendChild(spanElement2);



    if (len == 2)
      html.firstChild.children[1].children[0].appendChild(divElement);
    // document.getElementById("checkbox1").innerHTML += str;
    else if (len > 2)
      html.firstChild.children[1].children[1].appendChild(divElement);
    // document.getElementById("checkbox2").innerHTML += str;
  }
  document.getElementById("checkbox").innerHTML = "";
  document.getElementById("checkbox").appendChild(html.firstChild.children[1].children[0]);
  document.getElementById("checkbox").appendChild(html.firstChild.children[1].children[0]);
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
      //
      var perday_data = {
        x: new Date(time),
        y: 1
      };
      var cumulative_data = {
        x: new Date(time),
        y: 1
      };
      var convoLen = conversation.children.length;
      for (var i = convoLen - 2; i >= 0; i -= 2) {
        var speaker = conversation.children[i].firstChild.firstChild.innerHTML;
        speaker = name_lookups[speaker];

        var message_time = conversation.children[i].firstChild.children[1].innerHTML;
        message_time = message_time.substr(message_time.indexOf(',') + 2, message_time.indexOf(' at ') - message_time.indexOf(',') - 2);

        if (perday_messages[speaker] == null) perday_messages[speaker] = 0;
        if (cumulative_messages[speaker] == null) cumulative_messages[speaker] = 0;

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
            var times = (said.match(/[:;][)D]|[(][:;]|:P/g) || []).length;
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

            perday_messages[speaker] += sentiment;
            cumulative_messages[speaker] += sentiment;

            break;
        }



        if (new Date(message_time).toString() == perday_data.x.toString()) {
          perday_data.y = sum(perday_messages, conversation_members);
          cumulative_data.y = sum(cumulative_messages, conversation_members);
        } else {
          temp.push(perday_data);
          temp2.push(cumulative_data);

          perday_messages = r(perday_messages, conversation_members);

          perday_data = {
            x: new Date(message_time),
            y: sum(perday_messages, conversation_members)
          };
          cumulative_data = {
            x: new Date(message_time),
            y: sum(cumulative_messages, conversation_members)
          };
        }


      }
    }
    labels.push(conversation_members_str);
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

  return graphsData;
}
