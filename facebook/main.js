function log(a) {
  console.log("%cFacebook main.js:%c " + a, "background: lightblue; color: green;", "background: none; color: black;");
}

function e_log(a) {
  console.log("%cError in main.js:%c " + a, "background: red; color: green;", "background: none; color: black;");
}

/* This function was not written by me */
function httpGet(theUrl) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", theUrl, false); // false for synchronous request
  xmlHttp.send(null);
  return xmlHttp.responseText;
}

lookups = [];
AFINN111 = [];
negations = [];

function full_reset() {
  dates = [];
  messages = [];
  people = [];
  chats = [
    [],
    []
  ];

  document.getElementById("checkbox1").innerHTML = "";
  document.getElementById("checkbox2").innerHTML = "";
  document.getElementById("tohide").style["display"] = "none";

  reset();
}

function pick_person() {
  full_reset();
  log("full reset");

  if (AFINN111.length == 0 && $('input[name=type]:checked').val() === "sentiment_analysis") {
    AFINN111 = getJSON();
    negations = getNegations();
    log("loaded AFINN-111");
  }

  parse(function() {
    log("gathering chats and correcting FB id's");
    var divs = doc.firstChild.children[1].children[1].children;
    for (var i = 1; i < divs.length; i++) {
      for (var j = 0; j < divs[i].children.length; j++) {
        convo = divs[i].children[j];
        var convoText = convo.innerHTML;
        people = convoText.substr(0, convoText.indexOf('<'));
        apeople = people.split(',');

        var broken = false;
        flen = '@facebook.com'.length;
        if (apeople.length > 1) {
          for (var u = 0; u < apeople.length; u++) {
            if (u > 0) apeople[u] = apeople[u].substr(1);

            if (lookups[apeople[u]] != null) {
              apeople[u] = lookups[apeople[u]];
            } else if (apeople[u].length > 13 && apeople[u].substr(apeople[u].length - flen, flen) === '@facebook.com') {
              id = apeople[u].substr(0, apeople[u].length - flen);
              url = "https://graph.facebook.com/" + id + "?fields=name&access_token=1160822430692370|SYTqhceToo_BtWLlNhMzfEHH6A0";

              response = httpGet(url);
              response = JSON.parse(response);
              if (response['error']) {
                e_log("user with id " + id + " does not exist");
                broken = true;
              } else {
                lookups[apeople[u]] = response['name'];
                apeople[u] = response['name'];
              }

            }
          }
        }

        people = "";
        for (var k = 0; k < apeople.length; k++) {
          if (k != 0) people += ", ";
          people += apeople[k];
        }

        doc.firstChild.children[1].children[1].children[i].children[j].innerHTML = people + convoText.substr(convoText.indexOf('<'));

        if (chats[0].indexOf(people) != -1) {
          chats[1][chats[0].indexOf(people)].push([i, j]);
        } else if (!broken) {
          chats[0].push(people);
          chats[1].push([
            [i, j]
          ]);
        }

      }
    }

    for (var i = 0; i < chats[0].length; i++) {
      var t = total(chats[1][i]);
      var len = chats[0][i].split(",").length;
      // var str = '<input type="checkbox" value="' + i + '">' + chats[0][i].substr(2, 1) + '\t' + t + '<br>';
      var str = '<input type="checkbox" value="' + i + '">' + chats[0][i] + '\t' + t + '<br>';
      if (len == 2)
        document.getElementById("checkbox1").innerHTML += str;
      else if (len > 2)
        document.getElementById("checkbox2").innerHTML += str;
    }


    document.getElementById("tohide").style["display"] = "block";
    log("chats gathered");
  });

}

p = document.createElement("P");

function total(a) {
  var tsum = 0;
  for (var i = 0; i < a.length; i++) {
    var t1 = a[i][0];
    var t2 = a[i][1];
    var convo = doc.firstChild.children[1].children[1].children[t1].children[t2].children;

    for (var j = 0; j < convo.length; j++)
      if ($(convo[j]).is("p"))
        tsum++;
  }
  return tsum;
}

function parse(_callback) {
  log("starting...");
  messages = [
    [],
    []
  ];
  var temp = [];
  var string;

  var reader = new FileReader();
  reader.addEventListener("load", function() {
    string = reader.result;
    log("read file");
    var parser = new DOMParser();
    doc = parser.parseFromString(string, "text/html");
    log("parsed file");
    _callback();
  });
  reader.readAsText(document.querySelector('input').files[0]);
}

function start() {

  messages = [
    [],
    []
  ];
  labels = [];

  current = $("#checkbox1").children("input:checked").map(function() {
    return [chats[1][this.value]];
  });
  current2 = $("#checkbox2").children("input:checked").map(function() {
    return [chats[1][this.value]];
  });

  for (var group = 0; group < current.length + current2.length; group++) {
    temp = [];
    temp2 = [];
    mpeople = [];
    mpeople2 = [];
    var tempcurr = group < current.length ? current : current2;
    var tempgroup = group - (group < current.length ? 0 : current.length);
    for (var fragment = 0; fragment < tempcurr[tempgroup].length; fragment++) {
      cfrag = tempcurr[tempgroup][fragment];

      convo = doc.firstChild.children[1].children[1].children[cfrag[0]].children[cfrag[1]];
      var convoText = convo.innerHTML;
      people = convoText.substr(0, convoText.indexOf('<'));
      var tmp = people;
      people = people.split(',');
      for (var i = 1; i < people.length; i++) people[i] = people[i].substr(1);

      time = convo.children[convo.children.length - (convo.children.length % 2 == 0 ? 2 : 1)].firstChild.children[1].innerHTML;
      time = time.substr(time.indexOf(',') + 2, time.indexOf(' at ') - time.indexOf(',') - 2);
      var toPush = {
        x: new Date(time),
        y: 1
      };
      var toPush2 = {
        x: new Date(time),
        y: 1
      };
      for (var i = convo.children.length - (convo.children.length % 2 == 0 ? 4 : 3); i >= 0; i -= 2) {

        var speaker = convo.children[i].firstChild.firstChild.innerHTML;
        if (speaker.length > 13 && speaker.substr(speaker.length - flen, flen) === '@facebook.com') {
          speaker = lookups[speaker];
        }

        var time = convo.children[i].firstChild.children[1].innerHTML;
        time = time.substr(time.indexOf(',') + 2, time.indexOf(' at ') - time.indexOf(',') - 2);

        if (mpeople[speaker] == null) mpeople[speaker] = 0;
        if (mpeople2[speaker] == null) mpeople2[speaker] = 0;

        var sel = $('input[name=type]:checked').val();
        if (sel == null) {
          mpeople[speaker]++;
          mpeople2[speaker]++;
        } else
          switch (sel) {
            case "total_messages":
              mpeople[speaker]++;
              mpeople2[speaker]++;
              break;
            case "happy_emojis":
              var said = convo.children[i + 1].innerHTML;
              var times = (said.match(/[:;][)D]|[(][:;]|:P/g) || []).length;
              mpeople[speaker] += times;
              mpeople2[speaker] += times;
              break;
            case "sentiment_analysis":
              var said = convo.children[i + 1].innerHTML;
              var words = said.split(/\W/);
              // console.log(words);

              var senti = 0;
              for (var w = 0; w < words.length; w++) {
                words[w] = words[w].toLowerCase();
                if (AFINN111.hasOwnProperty(words[w])) {
                  if (w != 0 && negations.indexOf(words[w - 1]) != -1)
                    senti -= AFINN111[words[w]];
                  else
                    senti += AFINN111[words[w]];
                }
              }

              mpeople[speaker] += senti;
              mpeople2[speaker] += senti;

              break;
          }


        if (new Date(time).toString() == toPush.x.toString()) {
          toPush.y = sum(mpeople, people);
          toPush2.y = sum(mpeople2, people);
        } else {
          temp.push(toPush);
          temp2.push(toPush2);

          mpeople = r(mpeople, people);

          toPush = {
            x: new Date(time),
            y: sum(mpeople, people)
          };
          toPush2 = {
            x: new Date(time),
            y: sum(mpeople2, people)
          };
        }
      }
    }
    labels.push(tmp);
    messages[0].push(temp);
    messages[1].push(temp2);
  }
  log("gathered messages");

  drawGraph();
}

function sum(a, b) {
  var s = 0;
  for (var i = 0; i < b.length; i++) {
    if (a[b[i]] != null) s += a[b[i]];
  }
  return s;
}

function r(a, b) {
  for (var i = 0; i < b.length; i++) {
    a[b[i]] = 0;
  }
  return a;
}

function reset() {
  if (window.myChart != null) myChart.destroy();

  $('#messages').remove();
  $('#message_container').append('<canvas id="messages" class="messages"></canvas>');
}

function drawGraph() {
  log("reseting...");
  reset();
  log("plotting graph...");

  document.getElementById("messages").style["display"] = "block";
  var ctx = $(".messages");

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
  // console.log(graphsData);


  var perday_or_cumulative = $('input[name=counting]:checked').val();
  if (perday_or_cumulative == null) perday_or_cumulative = 1;

  for (var i = 0; i < messages[perday_or_cumulative].length; i++) {
    tmparr = [];
    var oldarr = messages[perday_or_cumulative][i];
    newarr = [];

    for (var j = 1; j < oldarr.length; j++) {
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
    newarr.push(tmparr);

    var tmpColor = generateColor();
    for (var n = 0; n < newarr.length; n++) {
      graphsData.data.datasets.push({
        label: labels[i].length >= 30 ? labels[i].substr(0, 30) + "..." : labels[i],
        // label: labels[i].substr(2, 1),
        type: 'line',
        data: newarr[n],
        backgroundColor: 'rgba(1,212,255,0)',
        borderColor: tmpColor,
        lineTension: 0
      });
    }
  }

  myChart = new Chart(ctx, graphsData);
  log("graph drawn");
}
