// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

var store, Application;
module("hub.RecordArray Error Methods", {
  setup: function() {

    Application = {};
    Application.Thing = hub.Record.extend({
      name: hub.Record.attr(String)
    });

    
    store = hub.Store.create();

    var records = [
      { guid: 1, name: 'Thing One' },
      { guid: 2, name: 'Thing Two' }
    ];

    var types = [ Application.Thing, Application.Thing ];

    store.loadRecords(types, records);
    
  },

  teardown: function() {
    store = null;
    Application = null;
  }
});

test("Verify error methods behave correctly", function() {
  var q = hub.Query.local(Application.Thing);
  var things = store.find(q);

  
  things.set('status', hub.Record.BUSY_LOADING);
  store.dataSourceDidErrorQuery(q, hub.Record.GENERIC_ERROR);
  

  ok(things.get('isError'), "isError on things array should be true");

  equals(things.get('errorObject'), hub.Record.GENERIC_ERROR,
    "get('errorObject') on things array should return the correct error object");
});
