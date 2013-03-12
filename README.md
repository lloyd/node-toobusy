# Is Your Node Process Too Busy?

[![Build Status](https://secure.travis-ci.org/lloyd/node-toobusy.png)](http://travis-ci.org/lloyd/node-toobusy)

What happens when your service is overwhelmed with traffic?
Your server can do one of two things:

  * Stop working, or...
  * Keep serving as many requests as possible

This library helps you do the latter.

## How it works

`toobusy` polls the node.js event loop and keeps track of "lag",
which is long requests wait in node's event queue to be processed.
When lag crosses a threshold, `toobusy` tells you that you're *too busy*.
At this point you can stop request processing early
(before you spend too much time on them and compound the problem),
and return a "Server Too Busy" response.
This allows your server to stay *responsive* under extreme load,
and continue serving as many requests as possible.

## installation

```
npm install toobusy
```


## usage

```javascript
var toobusy = require('toobusy'),
    express = require('express');
    
var app = express();
    
// middleware which blocks requests when we're too busy
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
  
var server = app.listen(3000);
  
process.on('SIGINT', function() {
  server.close();
  // calling .shutdown allows your process to exit normally
  toobusy.shutdown();
  process.exit();
});
```

## tunable parameters

The one knob that the library exposes is "maximum lag".
This number represents the maximum amount of time in milliseconds that the event queue is behind,
before we consider the process *too busy*.

```javascript
// set maximum lag to an aggressive value
require('toobusy').maxLag(10);
```

The default value is 70ms,
which allows an "average" server to run at 90-100% CPU
and keeps request latency at around 200ms.
For comparison, a value of 10ms results in 60-70% CPU usage,
while latency for "average" requests stays at about 40ms.

These numbers are only examples,
and the specifics of your hardware and application can change them drastically,
so experiment!
The default of 70 should get you started.

## references

> There is nothing new under the sun. (Ecclesiastes 1:9)

Though applying "event loop latency" to node.js was not directly inspired by anyone else's work,
this concept is not new.  Here are references to others who apply the same technique:

  * [Provos, Lever, and Tweedie 2000](http://www.kegel.com/c10k.html#tips) - "notes that dropping incoming connections when the server is overloaded improved the shape of the performance curve."

## license

[WTFPL](http://wtfpl.org)
