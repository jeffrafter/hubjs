// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*global window GLOBAL exports require hub Spin Q$ */

var Suite = /** @scope Spin.Suite.prototype */ {

  /**
    Call this method to define a new test suite.  Pass one or more hashes of
    properties you want added to the new suite.  
    
    @param {Hash} attrs one or more attribute hashes
    @returns {Spin.Suite} subclass of suite.
  */
  create: function(desc, attrs) {
    var len = arguments.length,
        ret = Spin.beget(this),
        idx;
        
    // copy any attributes
    for(idx=1;idx<len;idx++) Spin.mixin(ret, arguments[idx]);
    
    if (desc) ret.basedesc = desc;
    
    // clone so that new definitions will be kept separate
    ret.definitions = ret.definitions.slice();
    
    return ret ;
  },

  /**
    Generate a new test suite instance, adding the suite definitions to the 
    current test plan.  Pass a description of the test suite as well as one or
    more attribute hashes to apply to the test plan.
    
    The description you add will be prefixed in front of the 'desc' property
    on the test plan itself.
    
    @param {String} desc suite description
    @param {Hash} attrs one or more attribute hashes
    @returns {Spin.Suite} suite instance
  */
  generate: function(desc, attrs) {
    var len = arguments.length,
        ret = Spin.beget(this),
        idx, defs;
        
    // apply attributes - skip first argument b/c it is a string
    for(idx=1;idx<len;idx++) Spin.mixin(ret, arguments[idx]);    
    ret.subdesc = desc ;
    
    // invoke definitions
    defs = ret.definitions ;
    len = defs.length;
    for(idx=0;idx<len;idx++) defs[idx].call(ret, ret);
    
    return ret ;
  },
  
  /**
    Adds the passed function to the array of definitions that will be invoked
    when the suite is generated.
    
    The passed function should expect to have the TestSuite instance passed
    as the first and only parameter.  The function should actually define 
    a module and tests, which will be added to the test suite.
    
    @param {Function} func definition function
    @returns {Spin.Suite} receiver
  */
  define: function(func) {
    this.definitions.push(func);
    return this ;
  },
  
  /** 
    Definition functions.  These are invoked in order when  you generate a 
    suite to add unit tests and modules to the test plan.
  */
  definitions: [],
  
  /**
    Generates a module description by merging the based description, sub 
    description and the passed description.  This is usually used inside of 
    a suite definition function.
    
    @param {String} str detailed description for this module
    @returns {String} generated description
  */
  desc: function(str) {
    return Spin.fmt(this.basedesc, this.subdesc, str);
  },
  
  /**
    The base description string.  This should accept two formatting options,
    a sub description and a detailed description.  This is the description
    set when you call extend()
  */
  basedesc: "%@ > %@",
  
  /**
    Default setup method for use with modules.  This method will call the
    newObject() method and set its return value on the object property of 
    the receiver.
  */
  setup: function() {
    this.object = this.newObject();
  },
  
  /**
    Default teardown method for use with modules.  This method will call the
    destroyObejct() method, passing the current object property on the 
    receiver.  It will also clear the object property.
  */
  teardown: function() {
    if (this.object) this.destroyObject(this.object);
    this.object = null;
  },
  
  /**
    Default method to create a new object instance.  You will probably want
    to override this method when you generate() a suite with a function that
    can generate the type of object you want to test.
    
    @returns {Object} generated object
  */
  newObject: function() { return null; },
  
  /**
    Default method to destroy a generated object instance after a test has 
    completed.  If you override newObject() you can also overried this method
    to cleanup the object you just created.
    
    Default method does nothing.
  */
  destroyObject: function(obj) { 
    // do nothing.
  },
  
  /**
    Generates a default module with the description you provide.  This is 
    a convenience function for use inside of a definition function.  You could
    do the same thing by calling:
    
    {{{
      var T = this ;
      Spin.Plan.module(T.desc(description), {
        setup: function() { T.setup(); },
        teardown: function() { T.teardown(); }
      }
    }}}
    
    @param {String} desc detailed description
    @returns {Spin.Suite} receiver
  */
  module: function(desc) {
    var T = this ;
    Spin.Plan.module(T.desc(desc), {
      setup: function() { T.setup(); },
      teardown: function() { T.teardown(); }
    });
  }
  
};

exports.Suite = Suite ;
