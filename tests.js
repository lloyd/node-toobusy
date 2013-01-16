const
should = require('should'),
toobusy = require('./');

describe('the library', function() {
  it('should export a couple functions', function(done) {
    (toobusy).should.be.a('function');
    (toobusy.maxLag).should.be.a('function');
    (toobusy.shutdown).should.be.a('function');
    done();
  });
});

describe('maxLag', function() {
  it('should default to 70', function(done) {
    (toobusy.maxLag()).should.equal(70);
    done();
  });
  it('should throw an exception for values < 10', function(done) {
    (function() { toobusy.maxLag(9); }).should.throw;
    done();
  });
  it('should be configurable', function(done) {
    (toobusy.maxLag(50)).should.equal(50);
    (toobusy.maxLag(10)).should.equal(10);
    (toobusy.maxLag()).should.equal(10);
    done();
  });
});

describe('toobusy()', function() {
  it('should return true after a little load', function(done) {
    function load() {
      if (toobusy()) return done();
      var start = new Date();
      while ((new Date() - start) < 250) {
        for (var i = 0; i < 1e5;) i++;
      }
      setTimeout(load, 0);
    }
    load();
  });

  it('should return a lag value after a little load', function(done) {
    function load() {
      if (toobusy()) {
        var lag = toobusy.lag();
        should.exist(lag);
        lag.should.be.above(1);
        return done();
      }
      var start = new Date();
      while ((new Date() - start) < 250) {
        for (var i = 0; i < 1e5;) i++;
      }
      setTimeout(load, 0);
    }
    load();
  });
});

