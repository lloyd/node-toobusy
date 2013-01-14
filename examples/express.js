var toobusy = require('..'),
    express = require('express');

var app = express.createServer();

// Have grace under load
app.use(function(req, res, next) {
  if (toobusy()) {
    res.send(503, "I'm busy right now, sorry.");
  } else {
    next();
  }
});

app.get('/', function(req, res) {
  // processing the request requires some work!
  var i = 0;
  while (i < 1e5) i++;
  res.send("I counted to " + i);
});

app.listen(3000);

process.on('SIGINT', function() {
  app.close();
  toobusy.shutdown();
});
