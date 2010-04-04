// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

// NOTE: The test below are based on the Data Hashes state chart.  This models
// the "read_editable" event in the Store portion of the diagram.

var store, storeKey, json;
module("hub.Store#readEditableDataHash", {
  setup: function() {
    store = hub.Store.create();
    
    json = {
      string: "string",
      number: 23,
      bool:   true
    };
    
    storeKey = hub.Store.generateStoreKey();

    store.writeDataHash(storeKey, json, hub.Record.READY_CLEAN);
  }
});

test("data state=LOCKED", function() {
  
  // test preconditions
  store.editables = null ; // manually reset for testing state
  equals(store.storeKeyEditState(storeKey), hub.Store.LOCKED, 'precond - edit state should be LOCKED');
  var oldrev = store.revisions[storeKey] ;

  // perform read
  var ret = store.readEditableDataHash(storeKey);
  
  // validate
  same(ret, json, 'should return equivalent json object');
  ok(!(ret===json), 'should not return same json instance');
  
  equals(store.storeKeyEditState(storeKey), hub.Store.EDITABLE, 'edit state should be editable');
  
  // should not change revisions, but should copy it...
  equals(store.revisions[storeKey], oldrev, 'should not change revision');
  if (!hub.none(oldrev)) {
    ok(store.revisions.hasOwnProperty(storeKey), 'should clone revision reference');
  }
  
});

test("data state=EDITABLE", function() {
  
  // test preconditions
  equals(store.storeKeyEditState(storeKey), hub.Store.EDITABLE, 'precond - edit state should be EDITABLE');
  var oldrev = store.revisions[storeKey] ;

  // perform read
  var ret = store.readEditableDataHash(storeKey);
  
  // validate
  equals(ret, json, 'should return same editable json instance');
  
  equals(store.storeKeyEditState(storeKey), hub.Store.EDITABLE, 'edit state should be editable');
  
  // should not change revisions, but should copy it...
  equals(store.revisions[storeKey], oldrev, 'should not change revision');
  if (!hub.none(oldrev)) {
    ok(store.revisions.hasOwnProperty(storeKey), 'should clone revision reference');
  }
  
});
