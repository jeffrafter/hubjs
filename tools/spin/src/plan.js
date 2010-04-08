// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*global GLOBAL exports hub Spin Q$ */

exports.Plan = {
  
  /**
    Define a new test plan instance.  Optionally pass attributes to apply 
    to the new plan object.  Usually you will call this without arguments.
    
    @param {Hash} attrs plan arguments
    @returns {exports.Plan} new instance/subclass
  */
  create: function(attrs) {
    var len = arguments.length,
        ret = Spin.beget(this),
        idx;
    for(idx=0;idx<len;idx++) Spin.mixin(ret, attrs);
    ret.queue = ret.queue.slice(); // want an independent queue
    return ret ;
  },

  // ..........................................................
  // RUNNING 
  // 
  
  /** @private - array of functions to execute in order. */
  queue: [],

  /**
    If true then the test plan is currently running and items in the queue
    will execute in order.
    
    @type {Boolean}
  */
  isRunning: false,

  /**
    Primitive used to add callbacks to the test plan queue.  Usually you will
    not want to call this method directly but instead use the context() or 
    test() methods.
    
    @returns {Spin.Plan} receiver
  */
  synchronize: function synchronize(callback) {
    this.queue.push(callback);
    if (this.isRunning) this.process(); // run queue    
    return this;
  },
  
  /**
    Processes items in the queue as long as isRunning remained true.  When
    no further items are left in the queue, calls finish().  Usually you will
    not call this method directly.  Instead call run().
    
    @returns {Spin.Plan} receiver
  */
  process: function process() {
    while(this.queue.length && this.isRunning) {
      this.queue.shift().call(this);
    }
    return this ;
  },
  
  /**
    Begins running the test plan after a slight delay to avoid interupting
    any current callbacks. 
  
    @returns {Spin.Plan} receiver
  */
  start: function() {
    var plan = this ;
    setTimeout(function() {
      if (plan.timeout) clearTimeout(plan.timeout);
      plan.timeout = null; 
      plan.isRunning = true;
      plan.process();
    }, 13);
    return this ;
  },
  
  /**
    Stops the test plan from running any further.  If you pass a timeout,
    it will raise an exception if the test plan does not begin executing 
    with the alotted timeout.
    
    @param {Number} timeout optional timeout in msec
    @returns {Spin.Plan} receiver
  */
  stop: function(timeout) {
    this.isRunning = false ;
    
    if (this.timeout) clearTimeout(this.timeout);
    if (timeout) {
      var plan = this;
      this.timeout = setTimeout(function() {
        plan.fail("Test timed out").start();
      }, timeout);
    } else this.timeout = null ;
    return this ;
  },
  
  /**
    Force the test plan to take a break.  Avoids slow script warnings.  This
    is called automatically after each test completes.
  */
  pause: function() {
    if (this.isRunning) {
      this.isRunning = false ;
      this.start();
    }
    return this ;
  },
  
  /**
    Initiates running the tests for the first time.  This will add an item 
    to the queue to call finish() on the plan when the run completes.

    @returns {Spin.Plan} receiver
  */
  run: function() {
    this.isRunning = true;
    this.prepare();
    
    // initialize new results
    this.results = {
      start: new Date().getTime(),
      finish: null,
      runtime: 0,
      tests: 0,
      total: 0,
      passed: 0,
      failed: 0,
      errors: 0,
      warnings: 0,
      assertions: []
    };

    // add item to queue to finish running the test plan when finished.
    this.begin().synchronize(this.finish).process();
    
    return this ;
  },

  /**
    Called when the test plan begins running. You will not normally call this 
    method directly.
    
    @returns {Spin.Plan} receiver
  */
  begin: function() {
    return this ;
  },
  
  /**
    When the test plan finishes running, this method will be called.

    @returns {Spin.Plan} receiver
  */
  finish: function() {
    var r = this.results;        
    r.finish = new Date().getTime();
    r.runtime = r.finish - r.start;

    return this ;
  },

  /**
    Sets the current context information.  This will be used when a test is
    added under the contact.

    @returns {Spin.Plan} receiver
  */
  module: function(desc, lifecycle) {
    if (typeof hub !== 'undefined' && hub.filename) {
      desc = hub.filename + '\n' + desc;
    }
    
    this.currentModule = desc;

    if (!lifecycle) lifecycle = {};
    this.setup(lifecycle.setup).teardown(lifecycle.teardown);
    
    return this ;
  },
  
  /**
    Sets the current setup method.
    
    @returns {Spin.Plan} receiver
  */
  setup: function(func) {
    this.currentSetup = func || Spin.K;
    return this;
  },
  
  /**
    Sets the current teardown method

    @returns {Spin.Plan} receiver
  */
  teardown: function teardown(func) {
    this.currentTeardown = func || Spin.K ;
    return this;
  },
  
  now: function() { return new Date().getTime(); },
  
  /**
    Generates a unit test, adding it to the test plan.
  */
  test: function test(desc, func) {
    if (!this.enabled(this.currentModule, desc)) return this; // skip

    // base prototype describing test
    var working = {
      module: this.currentModule,
      test: desc,
      expected: 0,
      assertions: []
    };
    
    var msg;
    var name = desc ;
    if (this.currentModule) name = this.currentModule + " module: " + name;
    
    var setup = this.currentSetup || Spin.K;
    var teardown = this.currentTeardown || Spin.K;
    
    // add setup to queue
    this.synchronize(function() {
      this.working = working;
      
      try {
        working.total_begin = working.setup_begin = this.now();
        setup.call(this);
        working.setup_end = this.now();
      } catch(e) {
        msg = (e && e.toString) ? e.toString() : "(unknown error)";
        this.error("Setup exception on " + name + ": " + msg);
      }
    });
    
    // now actually invoke test
    this.synchronize(function() {
      if (!func) {
        this.warn("Test not yet implemented: " + name);
      } else {
        //try {
          if (Spin.trace) hub.debug("run: " + name);
          this.working.test_begin = this.now();
          func.call(this);
          this.working.test_end = this.now();
        //} catch(e) {
        //  msg = (e && e.toString) ? e.toString() : "(unknown error)";
        //  this.error("Died on test #" + (this.working.assertions.length + 1) + ": " + msg);
        //}
      }
    });
    
    // cleanup
    this.synchronize(function() {
      try {
        this.working.teardown_begin = this.now();
        teardown.call(this);
        this.working.teardown_end = this.now();
      } catch(e) {
        msg = (e && e.toString) ? e.toString() : "(unknown error)";
        this.error("Teardown exception on " + name + ": " + msg);
      }
    });
    
    // finally, reset and report result
    this.synchronize(function() {
      
      if (this.reset) {
        try {
          this.working.reset_begin = this.now();
          this.reset();
          this.working.total_end = this.working.reset_end = this.now();
        } catch(ex) {
          msg = (ex && ex.toString) ? ex.toString() : "(unknown error)";
          this.error("Reset exception on " + name + ": " + msg) ;
        }
      }
      
      // check for expected assertions
      var w = this.working,
          exp = w.expected,
          len = w.assertions.length;
          
      if (exp && exp !== len) {
        this.fail("Expected " + exp + " assertions, but " + len + " were run");
      }
      
      // finally, record result
      this.working = null;
      this.record(w.module, w.test, w.assertions, w);

      if (!this.pauseTime) {
        this.pauseTime = new Date().getTime();
      } else {
        var now = new Date().getTime();
        if ((now - this.pauseTime) > 250) {
          this.pause();
          this.pauseTime = now ;
        }
      }
      
    });
  },
  
  /**
    Converts the passed string into HTML and then appends it to the main body 
    element.  This is a useful way to automatically load fixture HTML into the
    main page.
  */
  htmlbody: function htmlbody(string) {
    this.synchronize(function() {
      var html = Q$(string) ;
      var body = Q$('body')[0];

      // first, find the first element with id 'htmlbody-begin'  if exists,
      // remove everything after that to reset...
      var begin = Q$('body #htmlbody-begin')[0];
      if (!begin) {
        begin = Q$('<div id="htmlbody-begin"></div>')[0];
        body.appendChild(begin);
      } else {
        while(begin.nextSibling) body.removeChild(begin.nextSibling);
      }
      begin = null; 

      // now append new content
      html.each(function() { body.appendChild(this); });
    }) ;
  },
  
  /**
    Records the results of a test. The passed assertions array should contain 
    hashes with the result and message.
  */
  record: function(module, test, assertions, timings) {
    var r   = this.results,
        len = assertions.length,
        idx, cur;
        
    r.tests++;
    for(idx=0;idx<len;idx++) {
      cur = assertions[idx];
      cur.module = module;
      cur.test = test ;

      r.total++;
      r[cur.result]++;
      r.assertions.push(cur);
    }
    
    var name = test, 
        s    = { passed: 0, failed: 0, errors: 0, warnings: 0 }, 
        len  = assertions.length, 
        clean = '', 
        idx, cur, q;
    
    for(idx=0;idx<len;idx++) s[assertions[idx].result]++;
    if ((s.failed + s.errors + s.warnings) === 0) clean = "clean" ;
    
    if (clean=="clean") stdout.write(".") ;
    else stdout.write("F") ;
    
    if (!this.errors) this.errors = [];
    
  },
  
  /**
    Universal method can be called to reset the global state of the 
    application for each test.  The default implementation will reset any
    saved fixture.
  */
  reset: function() {
    if (this.fixture) {
      var mainEl = document.getElementById('main');
      if (mainEl) mainEl.innerHTML = this.fixture;
      mainEl = null;
    }  
    return this ;
  },
  
  /**
    Can be used to decide if a particular test should be enabled or not.  
    Current implementation allows a test to run.
    
    @returns {Boolean}
  */
  enabled: function(moduleName, testName) {
    return true;
  },
  
  // ..........................................................
  // MATCHERS
  // 
  
  /**
    Called by a matcher to record that a test has passed.  Requires a working
    test property.
  */
  pass: function(msg) {
    var w = this.working ;
    if (!w) throw "pass("+msg+") called outside of a working test";
    w.assertions.push({ message: msg, result: Spin.OK });
    return this ;
  },

  /**
    Called by a matcher to record that a test has failed.  Requires a working
    test property.
  */
  fail: function(msg) {
    var w = this.working ;
    if (!w) throw "fail("+msg+") called outside of a working test";
    w.assertions.push({ message: msg, result: Spin.FAIL });
    return this ;
  },

  /**
    Called by a matcher to record that a test issued a warning.  Requires a 
    working test property.
  */
  warn: function(msg) {
    var w = this.working ;
    if (!w) throw "warn("+msg+") called outside of a working test";
    w.assertions.push({ message: msg, result: Spin.WARN });
    return this ;
  },

  /**
    Called by a matcher to record that a test had an error.  Requires a 
    working test property.
  */
  error: function(msg, e) {
    var w = this.working ;
    if (!w) throw "error("+msg+") called outside of a working test";
    
    if (e) {
      hub.debug("ERROR", msg);
      hub.debug("ERROR", e);
    }
    
    w.assertions.push({ message: msg, result: Spin.ERROR });
    return this ;
  },
  
  /**
    Any methods added to this hash will be made global just before the first
    test is run.  You can add new methods to this hash to use them in unit
    tests.  "this" will always be the test plan.
  */
  fn: {

    /**
      Primitive will pass or fail the test based on the first boolean.  If you
      pass an actual and expected value, then this will automatically log the
      actual and expected values.  Otherwise, it will expect the message to
      be passed as the second argument.

      @param {Boolean} pass true if pass
      @param {Object} actual optional actual
      @param {Object} expected optional expected
      @param {String} msg optional message
      @returns {Spin.Plan} receiver
    */
    ok: function ok(pass, actual, expected, msg) {
      if (msg === undefined) {
        msg = actual ;
        if (!msg) msg = pass ? "OK" : "failed";
      } else {
        if (!msg) msg = pass ? "OK" : "failed";
        if (pass) {
          msg = msg + ": " + Spin.dump(expected) ;
        } else {
          msg = msg + ", expected: " + Spin.dump(expected) + " result: " + Spin.dump(actual);
        }
      }
      return !!pass ? this.pass(msg) : this.fail(msg);
    },

    /**
      Primitive performs a basic equality test on the passed values.  Prints
      out both actual and expected values.
      
      Preferred to ok(actual === expected, message);
      
      @param {Object} actual tested object
      @param {Object} expected expected value
      @param {String} msg optional message
      @returns {Spin.Plan} receiver
    */
    equals: function equals(actual, expected, msg) {
      if (msg === undefined) msg = null; // make sure ok logs properly
      return this.ok(actual == expected, actual, expected, msg);
    },
    
    /**
      Expects the passed function call to throw an exception of the given
      type. If you pass null or Error for the expected exception, this will
      pass if any error is received.  If you pass a string, this will check 
      message property of the exception.
      
      @param {Function} callback the function to execute
      @param {Error} expected optional, the expected error
      @param {String} a description
      @returns {Spin.Plan} receiver
    */
    should_throw: function should_throw(callback, expected, msg) {
      var actual = false ;
      
      try {
        callback();
      } catch(e) {
        actual = (typeof expected === "string") ? e.message : e;        
      }
      
      if (expected===false) {
        ok(actual===false, Spin.fmt("%@ expected no exception, actual %@", msg, actual));
      } else if (expected===Error || expected===null || expected===true) {
        ok(!!actual, Spin.fmt("%@ expected exception, actual %@", msg, actual));
      } else {
        equals(actual, expected, msg);
      }
    },
    
    /**
      Specify the number of expected assertions to gaurantee that a failed 
      test (no assertions are run at all) don't slip through

      @returns {Spin.Plan} receiver
    */
    expect: function expect(asserts) {
      this.working.expected = asserts;
    },
    
    /**
      Verifies that two objects are actually the same.  This method will do
      a deep compare instead of a simple equivalence test.  You should use
      this instead of equals() when you expect the two object to be different 
      instances but to have the same content.
      
      @param {Object} value tested object
      @param {Object} actual expected value
      @param {String} msg optional message
      @returns {Spin.Plan} receiver
    */
    same: function(actual, expected, msg) {
      if (msg === undefined) msg = null ; // make sure ok logs properly
      return this.ok(Spin.equiv(actual, expected), actual, expected, msg);
    },
    
    /**
      Stops the current tests from running.  An optional timeout will 
      automatically fail the test if it does not restart within the specified
      period of time.
      
      @param {Number} timeout timeout in msec
      @returns {Spin.Plan} receiver
    */
    stop: function(timeout) {
      return this.stop(timeout);
    },
    
    /**
      Restarts tests running.  Use this to begin tests after you stop tests.
      
      @returns {Spin.Plan} receiver
    */
    start: function() {
      return this.start();
    },
    
    reset: function() { 
      return this.reset(); 
    }
  
  },
  
  /**
    Exports the comparison functions into the global namespace.  This will
    allow you to call these methods from within testing functions.  This 
    method is called automatically just before the first test is run.
    
    @returns {Spin.Plan} receiver
  */
  prepare: function() {
    var fn   = this.fn,
        plan = this,
        key, func;
        
    for(key in fn) {
      if (!fn.hasOwnProperty(key)) continue ;
      func = fn[key];
      if (typeof func !== "function") continue ;
      GLOBAL[key] = this._hub_bind(func);
      if (!plan[key]) plan[key] = func; 
    }
    return this ;
  },
  
  _hub_bind: function(func) {
    var plan = this;
    return function() { return func.apply(plan, arguments); };
  }
  
};

// ..........................................................
// EXPORT BASIC API
// 

exports.defaultPlan = function defaultPlan() {
  var plan = Spin.plan;
  if (!plan) {
    plan = Spin.plan = Spin.Plan.create({});
  }
  return plan;
};

// create a module.  If this is the first time, create the test plan and
// runner.  This will cause the test to run on page load
GLOBAL._hub_module = GLOBAL.module = function(desc, l) {
  Spin.defaultPlan().module(desc, l); 
};

// create a test.  If this is the first time, create the test plan and
// runner.  This will cause the test to run on page load
GLOBAL.test = function(desc, func) {
  Spin.defaultPlan().test(desc, func); 
};
