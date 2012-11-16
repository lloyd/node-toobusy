# Is Your Node Process Too Busy?

What happens when your service is overwhelmed with traffic?  Your
server can do one of two things:

  * Stop working, or...
  * Keep serving as many requests as possible

This library helps you do the latter.

## How it works

`toobusy` polls the node.js event look and keeps track of "lag",
how long requests wait in node's event queue.  When a "high water mark"
of lag is is hit, `toobusy` tells you that you're *too busy*.  At 
this point you can stop request processing early
(before you spend too much time processing them and contribute to 
the problem), and return a "Server Too Busy" response.

## installation

    npm install toobusy

## usage

    var toobusy = require('toobusy'),
        express = require('express');

    var app = express();

    // Have grace under load
    app.use(function(req, res, next) {
      if (toobusy()) {
        res.send(503, 'I'm busy right now, sorry.');
      } else {
        next();
      } 
    });

    app.get('/', function(req, res) {
      res.send("hello world");
    });

    app.listen(3000);

    process.on('SIGINT', function() {
      app.stop();
      toobusy.shutdown();
    });


## license

http://wtfpl.org
