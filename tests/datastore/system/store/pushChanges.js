// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

var store, storeKey, json;
var storeKey1, storeKey2, storeKey3, storeKey4, storeKey5, storeKey6 ;

module("hub.Store#pushChanges", {
  setup: function() {
    
    store = hub.Store.create();
    
    json = {
      string: "string",
      number: 23,
      bool:   true
    };
    
    storeKey1 = hub.Store.generateStoreKey();
    store.writeDataHash(storeKey1, json, hub.Record.EMPTY);

    storeKey2 = hub.Store.generateStoreKey();
    store.writeDataHash(storeKey2, json, hub.Record.EMPTY);

    storeKey3 = hub.Store.generateStoreKey();
    store.writeDataHash(storeKey3, json, hub.Record.EMPTY);

    storeKey4 = hub.Store.generateStoreKey();
    store.writeDataHash(storeKey4, json, hub.Record.BUSY_LOADING);

    storeKey5 = hub.Store.generateStoreKey();
    store.writeDataHash(storeKey5, json, hub.Record.BUSY_LOADING);

    storeKey6 = hub.Store.generateStoreKey();
    store.writeDataHash(storeKey6, json, hub.Record.BUSY_LOADING);
  }
});

test("Do a pushRetrieve and check if there is conflicts", function() {
  var res = store.pushRetrieve(hub.Record, undefined, undefined, storeKey1);
  ok(res, "There is no conflict, pushRetrieve was succesful.");
  res = store.pushRetrieve(hub.Record, undefined, undefined, storeKey4);
  ok(!res, "There is a conflict, because of the state, this is expected.");

});

test("Do a pushDestroy and check if there is conflicts", function() {
  var res = store.pushDestroy(hub.Record, undefined, storeKey2);
  ok(res, "There is no conflict, pushDestroy was succesful.");
  res = store.pushRetrieve(hub.Record, undefined, undefined, storeKey5);
  ok(!res, "There is a conflict, because of the state, this is expected.");
});

test("Issue a pushError and check if there is conflicts", function() {
  var res = store.pushError(hub.Record, undefined, hub.Record.NOT_FOUND_ERROR, storeKey3);
  ok(res, "There is no conflict, pushError was succesful.");
  res = store.pushRetrieve(hub.Record, undefined, undefined, storeKey6);
  ok(!res, "There is a conflict, because of the state, this is expected.");
});
