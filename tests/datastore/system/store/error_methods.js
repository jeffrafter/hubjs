// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

var store, Application;

module("hub.Store Error Methods", {
  setup: function() {

    Application = {};
    Application.Thing = hub.Record.extend({
      name: hub.Record.attr(String)
    });

    hub.RunLoop.begin();
    store = hub.Store.create();

    var records = [
      { guid: 1, name: 'Thing One' },
      { guid: 2, name: 'Thing Two' }
    ];

    var types = [ Application.Thing, Application.Thing ];

    store.loadRecords(types, records);
    hub.RunLoop.end();
  },

  teardown: function() {
    store = null;
    Application = null;
  }
});

test("Verify readError() returns correct errors", function() {
  var thing1 = store.find(Application.Thing, 1);
  var storeKey = thing1.get('storeKey');

  hub.RunLoop.begin();
  store.writeStatus(storeKey, hub.Record.BUSY_LOADING);
  store.dataSourceDidError(storeKey, hub.Record.GENERIC_ERROR);
  hub.RunLoop.end();

  equals(store.readError(storeKey), hub.Record.GENERIC_ERROR,
    "store.readError(storeKey) should return the correct error object");
});

test("Verify readQueryError() returns correct errors", function() {
  var q = hub.Query.local(Application.Thing);
  var things = store.find(q);

  hub.RunLoop.begin();
  things.set('status', hub.Record.BUSY_LOADING);
  store.dataSourceDidErrorQuery(q, hub.Record.GENERIC_ERROR);
  hub.RunLoop.end();

  equals(store.readQueryError(q), hub.Record.GENERIC_ERROR,
    "store.readQueryError(q) should return the correct error object");
});
