var http = require('http'),
 toobusy = require('..');

http.createServer(function (req, res) {
  if (toobusy()) {
    res.writeHead(503, {'Content-Type': 'text/plain'});
    return res.end("I'm a bit busy right now, come back later\n");
  }
  // we're not too busy!  let's process a request!
  var i = 0;
  while (i < 1e5) i++; 
  
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('I counted to ' + i + '\n');
}).listen(3000, '127.0.0.1', 1024);
