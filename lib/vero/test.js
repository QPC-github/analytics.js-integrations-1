
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('segmentio/analytics.js-integration-tester@1.3.0');
var tick = require('next-tick');
var plugin = require('./');

describe('Vero', function(){
  var Vero = plugin.Integration;
  var vero;
  var analytics;
  var options = {
    apiKey: 'x'
  };

  beforeEach(function(){
    analytics = new Analytics;
    vero = new Vero(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(vero);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
  });

  after(function(){
    vero.reset();
  });

  it('should store the proper settings', function(){
    var Test = integration('Vero')
      .readyOnLoad()
      .global('_veroq')
      .option('apiKey', '');

    analytics.validate(Vero, Test);
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(vero, 'load');
    });

    afterEach(function(){
      vero.reset();
    });

    describe('#initialize', function(){
      it('should push onto window._veroq', function(){
        analytics.initialize();
        analytics.page();
        analytics.deepEqual(window._veroq[0], ['init', { api_key: options.apiKey }]);
      });

      it('should call #load', function(){
        analytics.initialize();
        analytics.page();
        analytics.called(vero.load);
      });
    });

    describe('#loaded', function(){
      it('should test window._veroq.push', function(){
        window._veroq = [];
        analytics.assert(!vero.loaded());
        window._veroq.push = function(){};
        analytics.assert(vero.loaded());
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(vero, done);
    });
  });

  describe('after loading', function(){
    beforeEach(function(done){
      analytics.once('ready', done);
      analytics.initialize();
      analytics.page();
    });

    describe('#page', function(){
      beforeEach(function(){
        analytics.stub(window._veroq, 'push');
      });

      it('should push "trackPageview"', function(){
        analytics.page();
        analytics.called(window._veroq.push, ['trackPageview']);
      });
    });

    describe('#identify', function(){
      beforeEach(function(){
        analytics.stub(window._veroq, 'push');
      });
      
      it('shouldnt send just an id', function(){
        analytics.identify('id');
        analytics.didNotCall(window._veroq.push);
      });

      it('shouldnt send without an id', function(){
        analytics.identify(null, { trait: true });
        analytics.didNotCall(window._veroq.push);
      });

      it('should send an id and email', function(){
        analytics.identify('id', { email: 'name@example.com' });
        analytics.called(window._veroq.push, ['user', {
          id: 'id',
          email: 'name@example.com'
        }]);
      });

      it('should send an id and traits', function(){
        analytics.identify('id', {
          email: 'name@example.com',
          trait: true
        });
        analytics.called(window._veroq.push, ['user', {
          id: 'id',
          email: 'name@example.com',
          trait: true
        }]);
      });
    });

    describe('#track', function(){
      beforeEach(function(){
        analytics.stub(window._veroq, 'push');
      });
      
      it('should send an event', function(){
        analytics.track('event');
        analytics.called(window._veroq.push, ['track', 'event', {}]);
      });

      it('should send an event and properties', function(){
        analytics.track('event', { property: true });
        analytics.called(window._veroq.push, ['track', 'event', { property: true }]);
      });
    });
  });
});