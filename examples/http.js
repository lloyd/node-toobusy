var http = require('http'),
 toobusy = require('..');

console.log("Maximum allowed event loop lag: " + toobusy.maxLag(50) + "ms");

function processRequest(res, num, startTime) {
  if (!startTime) startTime = new Date();

  if (num === undefined) {
    return process.nextTick(function() {
      processRequest(res, 0);
    });
  }
  if (num >= 5) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('I counted to ' + num + ' in ' + (new Date() - startTime) + 'ms\n');
  } else {
    // 1ms of computation
    var targetTime = (new Date() - startTime) + 1;
    while (new Date() - startTime < targetTime);
    processRequest(res, num + 1, startTime);
  }
}

http.createServer(function (req, res) {
  if (toobusy()) {
    res.writeHead(503);
    return res.end();
  }

  // we're not too busy!  let's process a request!
  processRequest(res);
}).listen(3000, '127.0.0.1', 2048);
