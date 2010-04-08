// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

var store, Application;
module("hub.Record Error Methods", {
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
  var thing1 = store.find(Application.Thing, 1);
  var storeKey = thing1.get('storeKey');

  var thing2 = store.find(Application.Thing, 2);

  store.writeStatus(storeKey, hub.Record.BUSY_LOADING);
  store.dataSourceDidError(storeKey, hub.Record.GENERIC_ERROR);

  ok(thing1.get('isError'), "isError on thing1 should be true");
  ok(!thing2.get('isError'), "isError on thing2 should be false");

  equals(thing1.get('errorObject'), hub.Record.GENERIC_ERROR,
    "get('errorObject') on thing1 should return the correct error object");

  equals(thing2.get('errorObject'), null,
    "get('errorObject') on thing2 should return null");
});
