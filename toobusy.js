var STANDARD_HIGHWATER = 70;
var STANDARD_INTERVAL = 500;

// A dampening factor.  When determining average calls per second or
// current lag, we weigh the current value against the previous value 2:1
// to smooth spikes.
var AVG_DECAY_FACTOR = 3;

var lastTime = new Date().valueOf(), now, lag, highWater = STANDARD_HIGHWATER, interval = STANDARD_INTERVAL, currentLag = 0;

var checkInterval = setInterval(function(){
  now = new Date().valueOf();
  lag = now - lastTime;
  lag = (lag < interval) ? 0 : lag - interval;
  currentLag = (lag + (currentLag * (AVG_DECAY_FACTOR - 1))) / AVG_DECAY_FACTOR;
  lastTime = now;
}, interval);

// Don't keep process open just for this timer.
checkInterval.unref();

var toobusy = function(){
  // If current lag is < 2x the highwater mark, we don't always call it 'too busy'. E.g. with a 50ms lag
  // and a 40ms highWater (1.25x highWater), 25% of the time we will block. With 80ms lag and a 40ms highWater,
  // we will always block.
  var pctToBlock = (currentLag - highWater) / highWater;
  var rand = Math.random();
  return rand < pctToBlock;
};

toobusy.lag = function(){
  return parseInt(currentLag, 10);
};

toobusy.maxLag = function(newLag){
  if(!newLag) return highWater;

  // If an arg was passed, try to set highWater.
  if(Object.prototype.toString.call(newLag) !== "[object Number]"){
    throw "Expected numeric first argument.";
  }
  newLag = parseInt(newLag, 10);
  if(newLag < 10){
    throw "Maximum lag should be greater than 10ms.";
  }
  highWater = newLag;
  return highWater;
};

toobusy.shutdown = function(){
  clearInterval(checkInterval);
};

module.exports = toobusy;