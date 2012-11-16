// first, we want to be able to get cpu usage stats in terms of percentage
var loaded = false;
var toobusy = require('../');

var work = 524288;

function worky() {
  var howBusy = toobusy();
  if (howBusy) {
    work /= 4;
    console.log("I can't work! I'm too busy:", howBusy + "ms behind");
  }
  work *= 2;
  for (var i = 0; i < work;) i++;
  console.log("worked:",  work);
};

var interval = setInterval(worky, 100);

process.on('SIGINT', function() {
  clearInterval(interval);
  toobusy.shutdown();
});
