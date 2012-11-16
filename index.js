const events = require('events');

// constants
const eventsEmitted = [ 'busy', 'normal' ];
const POLL_PERIOD_MS = 500;
var HIGH_WATER_MARK_MS = 300;

// state
var polling = false;
var timer = null;

// api
module.exports.stop = function() {
  stopPolling();
};

// implementation
function startPolling() {
  if (polling) return;
  polling = true;
  checkState();
}

function stopPolling() {
  if (!polling) return;
  clearTimeout(timer);
  timer = null;
  polling = false;
}

var lastMark = null;
var lagging = false;
function checkState() {
  if (!polling) return;
  if (lastMark) {
    var lag = new Date() - lastMark - POLL_PERIOD_MS;

    // have we transitioned across the high water mark?
    if (!lagging && lag > HIGH_WATER_MARK_MS) {
      lagging = lag;
    } else if (lagging && lag < HIGH_WATER_MARK_MS) {
      lagging = null;
    }
  }
  lastMark = new Date();
  timer = setTimeout(checkState, POLL_PERIOD_MS);
}

module.exports = function() {
  startPolling();
  if (lagging) return lagging;
  var curLag = new Date() - lastMark - POLL_PERIOD_MS;
  if (lastMark && curLag > HIGH_WATER_MARK_MS)
    return curLag;
  return null;
};

module.exports.shutdown = stopPolling;
