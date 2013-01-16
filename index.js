var bindings = require('bindings')('toobusy.node')
module.exports = bindings.toobusy;
module.exports.shutdown = bindings.shutdown;
module.exports.maxLag = bindings.maxLag;
module.exports.lag = bindings.lag;
