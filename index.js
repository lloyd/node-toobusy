var bindings = require('bindings')('toobusy.node')
module.exports = bindings.toobusy;
module.exports.shutdown = bindings.shutdown;
