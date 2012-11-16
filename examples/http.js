var http = require('http'),
 toobusy = require('..');

function processRequest(res, num) {
  if (num === undefined) {
    return process.nextTick(function() {
      processRequest(res, 0);
    });
  }
  if (num >= 7) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('I counted to ' + i + '\n');
  } else {
    var i = 0;
    while (i < 1e6) i++;
    processRequest(res, num + 1);
  }
}

http.createServer(function (req, res) {
  if (toobusy()) {
    res.writeHead(503);
    return res.end();
  }
  // we're not too busy!  let's process a request!
  processRequest(res);
}).listen(3000, '10.0.0.20', 2048);
