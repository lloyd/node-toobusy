var http = require('http');

// a little load generate client that generates constant load over
// even if the server cannot keep up

var running = 0;
var twoHundred = 0;
var fiveOhThree = 0;
var yucky = 0;
var avg = 0;
var sadAvg = 0;

// start 100 every second
var ivalnum = 0;
setInterval(function() {
  ivalnum++;
  function startOne() {
    running++;
    var start = new Date();
    http.request({
      host: '127.0.0.1',
      port: 3000,
      agent: false,
      path: '/',
      headers: {
        "connection": "close"
      }
    }, function(res) {
      res.on('end', function() {
        if (res.statusCode === 503) {
          sadAvg = ((new Date() - start) + sadAvg * fiveOhThree) / (fiveOhThree + 1);
          fiveOhThree++;
        } else {
          avg = ((new Date() - start) + avg * twoHundred) / (twoHundred + 1);
          twoHundred++;
        }
        running--;
      });
    }).on('error', function(e) {
      console.log(e);
      running--;
      yucky++;
    }).end();
  }
  if (!(ivalnum % 40)) {
    console.log("stats at", (ivalnum / 40) + "s:");
    console.log("  running:", running);
    console.log("  200s:   ", twoHundred, "(avg " + avg + "ms)");
    console.log("  503s:   ", fiveOhThree, "(avg " + sadAvg + "ms)");
    console.log("  errors: ", yucky);
  }
  for (var i = 0; i < 5; i++) startOne();
}, 25);
