// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

var TestRunner;
module("Sample Model from TestRunner Application", { 
  setup: function() {

    // namespace
    TestRunner = hub.Object.create({
      store: hub.Store.create()
    });

    // describes a single target.  has target name, target type, and url to 
    // load tests.
    TestRunner.Target = hub.Record.extend({

      /** test name */
      name: hub.Record.attr(String),
      
      /** test type - one of 'app', 'framework', 'sproutcore' */
      type: hub.Record.attr(String, { only: 'single group all'.w() }),

      /** Fetches list of tests dynamically */
      tests: hub.Record.fetch('TestRunner.Test')

    });

    /* JSON:
    
     { 
       link_test:  "url to laod test",
        },
    */ 
    TestRunner.Test = hub.Record.extend({
      
      // testName
      testUrl: hub.Record.attr({
        key: 'link_test'
      }),
      
      target: hub.Record.attr('TestRunner.Target', {
        inverse: 'tests',
        isMaster: true,
        isEditable: false
      })
      
    });

  }
});
