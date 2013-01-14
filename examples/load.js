var http = require('http');

// a little load generate client that generates constant load over
// even if the server cannot keep up

var running = 0;
var twoHundred = 0;
var fiveOhThree = 0;
var yucky = 0;
var avg = 0;

// how many requests per second should we run?
const rps = (process.env['RPS'] || 40) / 40;
var curRPS = rps;
var started = 0;
const startTime = new Date();
var lastMark = startTime;

var ivalnum = 0;

setInterval(function() {
  ivalnum++;
  function startOne() {
    started++;
    running++;
    var start = new Date();
    var endOrError = false;
    function cEndOrError() {
      if (endOrError) console.log("end AND error");
      endOrError = true;
    }
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
          fiveOhThree++;
        } else {
          twoHundred++;
        }
        avg = ((new Date() - start) + avg * started) / (started + 1);
        running--;
        cEndOrError();
      });
    }).on('error', function(e) {
      process.stderr.write(e.toString() + " - " + (new Date() - start) + "ms\n");
      avg = ((new Date() - start) + avg * started) / (started + 1);
      running--;
      yucky++;
      cEndOrError();
    }).end();
  }

  for (var i = 0; i < curRPS ; i++) startOne();

  // report and scale up every 2s
  if (!(ivalnum % (40 * 2))) {
    var delta = (new Date() - lastMark) / 1000.0 ;
    console.log(Math.round((new Date() - startTime) / 1000.0),
                Math.round(started / delta),
                Math.round(twoHundred / delta),
                Math.round(fiveOhThree / delta),
                avg,
                Math.round(yucky / delta));
    curRPS = curRPS + .5;
    started = twoHundred = fiveOhThree = yucky = 0;
    lastMark = new Date();
  }
}, 25);
