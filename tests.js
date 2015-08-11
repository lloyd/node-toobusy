const
should = require('should'),
toobusy = require('./');

function tightWork() {
  var start = new Date();
  while ((new Date() - start) < 250) {
    for (var i = 0; i < 1e5;) i++;
  }
}

describe('the library', function() {
  it('should export a couple functions', function(done) {
    (toobusy).should.be.a('function');
    (toobusy.maxLag).should.be.a('function');
    (toobusy.dampeningFactor).should.be.a('function');
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
      tightWork();
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
      tightWork();
      setTimeout(load, 0);
    }
    load();
  });
});

describe('dampeningFactor', function() {
  it('should default to 3', function(done) {
    (toobusy.dampeningFactor()).should.equal(3);
    done();
  });
  it('should throw an exception for values < 1', function(done) {
    (function() { toobusy.dampeningFactor(0); }).should.throw;
    done();
  });
  it('should be configurable', function(done) {
    (toobusy.dampeningFactor(10)).should.equal(10);
    (toobusy.dampeningFactor(5)).should.equal(5);
    (toobusy.dampeningFactor()).should.equal(5);
    done();
  });
});

describe('dampeningFactor\'s behaviour', function() {
  beforeEach(function resetToNotBusy(done) {
    var original_dampeningFactor = toobusy.dampeningFactor();
    toobusy.dampeningFactor(1); // for immediate reset

    var resetID = setInterval(waitForNotBusy, 50);
    function waitForNotBusy() {
      if (toobusy()) return;
      clearInterval(resetID);
      toobusy.dampeningFactor(original_dampeningFactor);
      done();
    }
  });

  it('No dampening gets toobusy immediately', function(done) {
    var cycles_to_toobusy = 0;
    toobusy.dampeningFactor(1); // no dampening

    function load(check) {
      if (toobusy()) {
        return check();
      }
      cycles_to_toobusy++;
      var start = new Date();
      while ((new Date() - start) < 250) {
          tightWork();
      }
      setTimeout(load, 0, check);
    }

    load(function(){
      (cycles_to_toobusy).should.equal(2);
      done();
    });
  });

  it('No dampening gets toobusy immediately', function(done) {
    var cycles_to_toobusy = 0;
    toobusy.dampeningFactor(25);

    function load(check) {
      if (toobusy()) {
        return check();
      }
      cycles_to_toobusy++;
      var start = new Date();
      while ((new Date() - start) < 250) {
          tightWork();
      }
      setTimeout(load, 0, check);
    }

    load(function(){
      (cycles_to_toobusy).should.be.above(2);
      done();
    });
  });
});
