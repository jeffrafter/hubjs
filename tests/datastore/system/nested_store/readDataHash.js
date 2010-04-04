// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

// NOTE: The test below are based on the Data Hashes state chart.  This models
// the "read" event in the NestedStore portion of the diagram.

var parent, store, child, storeKey, json;
module("hub.NestedStore#readDataHash", {
  setup: function() {
    parent = hub.Store.create();
    
    json = {
      string: "string",
      number: 23,
      bool:   true
    };
    
    storeKey = hub.Store.generateStoreKey();

    parent.writeDataHash(storeKey, json, hub.Record.READY_CLEAN);
    parent.editables = null; // manually patch to setup test state
    
    store = parent.chain(); // create nested store
    child = store.chain();  // for deep nested
  }
});

// ..........................................................
// BASIC STATE TRANSITIONS
// 

test("data state=INHERITED, lockOnRead=true, parent editable=false", function() {
  // preconditions
  equals(store.get('lockOnRead'), true, 'precond - lockOnRead should be true');
  equals(store.storeKeyEditState(storeKey), hub.Store.INHERITED, 'precond - storeKey should be inherited from parent');
  var oldrev = store.revisions[storeKey]; // save old rev for testing later

  // perform read
  equals(store.readDataHash(storeKey), json, 'should return json');

  // verify
  equals(store.storeKeyEditState(storeKey), hub.Store.LOCKED, 'storeKey should be read-locked now');
  ok(store.dataHashes.hasOwnProperty(storeKey), 'should copy reference to json');

  // test revisions...
  equals(store.revisions[storeKey], oldrev, 'should not change revision');
  if (!hub.none(oldrev)) {
    ok(store.revisions.hasOwnProperty(storeKey), 'should copy reference to revision');
  }
});


test("data state=INHERITED, lockOnRead=false, parent editable=false", function() {
  // preconditions
  store.set('lockOnRead', false);
  
  equals(store.get('lockOnRead'), false, 'precond - lockOnRead should be false');
  equals(store.storeKeyEditState(storeKey), hub.Store.INHERITED, 'precond - storeKey should be inherited from parent');
  var oldrev = store.revisions[storeKey]; // save old rev for testing later

  // perform read
  equals(store.readDataHash(storeKey), json, 'should return json');

  // verify
  equals(store.storeKeyEditState(storeKey), hub.Store.INHERITED, 'storeKey should still be inherited');
  ok(!store.dataHashes.hasOwnProperty(storeKey), 'should NOT copy reference to json');

  // test revisions...
  equals(store.revisions[storeKey], oldrev, 'should not change revision');
  if (!hub.none(oldrev)) {
    ok(store.revisions.hasOwnProperty(storeKey), 'should copy reference to revision');
  }
});


test("data state=INHERITED, lockOnRead=true, parent editable=true", function() {

  // preconditions
  
  // first, make parentStore record editable.  an editable record needs to be
  // cloned into nested stores on lock to avoid un-monitored edits
  parent.readEditableDataHash(storeKey);
  equals(parent.storeKeyEditState(storeKey), hub.Store.EDITABLE, 'precond - parent storeKey should be editable');
  equals(store.get('lockOnRead'), true, 'precond - lockOnRead should be true');
  equals(store.storeKeyEditState(storeKey), hub.Store.INHERITED, 'precond - storeKey should be inherited from parent');
  var oldrev = store.revisions[storeKey]; // save old rev for testing later

  // perform read
  var ret = store.readDataHash(storeKey);
  same(ret, json, 'should return equivalent json object');
  ok(!(ret === json), 'should return clone of json instance not exact same instance');

  // verify new state
  equals(store.storeKeyEditState(storeKey), hub.Store.EDITABLE, 'storeKey should be locked');
  ok(store.dataHashes.hasOwnProperty(storeKey), 'should have reference to json');

  // test revisions...
  equals(store.revisions[storeKey], oldrev, 'should not change revision');
  if (!hub.none(oldrev)) {
    ok(store.revisions.hasOwnProperty(storeKey), 'should copy reference to revision');
  }
});

test("data state=LOCKED", function() {
  
  // preconditions
  store.set('lockOnRead', true); // make sure reading will lock
  var ret1 = store.readDataHash(storeKey);
  equals(store.storeKeyEditState(storeKey), hub.Store.LOCKED, 'precond - data state should be LOCKED');
  var oldrev = store.revisions[storeKey];
  
  // perform read
  var ret2 = store.readDataHash(storeKey);
  
  // verify
  equals(ret1, ret2, 'should read same data hash once locked');
  equals(store.storeKeyEditState(storeKey), hub.Store.LOCKED, 'should remain in locked state');

  // test revisions
  equals(store.revisions[storeKey], oldrev, 'should not change revision');
  if (!hub.none(oldrev)) {
    ok(store.revisions.hasOwnProperty(storeKey), 'should copy reference to revision');
  }
});

test("data state=EDITABLE", function() {
  
  // preconditions
  store.set('lockOnRead', true); // make sure reading will lock
  var ret1 = store.readEditableDataHash(storeKey);
  equals(store.storeKeyEditState(storeKey), hub.Store.EDITABLE, 'precond - data state should be EDITABLE');
  var oldrev = store.revisions[storeKey];
  
  // perform read
  var ret2 = store.readDataHash(storeKey);
  
  // verify
  equals(ret1, ret2, 'should read same data hash once editable');
  equals(store.storeKeyEditState(storeKey), hub.Store.EDITABLE, 'should remain in editable state');

  // test revisions
  equals(store.revisions[storeKey], oldrev, 'should not change revision');
  if (!hub.none(oldrev)) {
    ok(store.revisions.hasOwnProperty(storeKey), 'should copy reference to revision');
  }
});

test("should return null when accessing an unknown storeKey", function() {
  equals(store.readDataHash(20000000), null, 'shuld return null for non-existant store key');
  equals(store.storeKeyEditState(20000000), hub.Store.LOCKED, 'should put into locked edit state');
});

// ..........................................................
// SPECIAL CASES
//

test("locking deep nested store when top-level parent is editable and middle store is inherited", function() {

  // first, make the parent store data hash editable
  json = parent.readEditableDataHash(storeKey);
  equals(parent.storeKeyEditState(storeKey), hub.Store.EDITABLE, 'parent edit state should be EDITABLE');
  equals(store.storeKeyEditState(storeKey), hub.Store.INHERITED, 'middle store edit state should be INHERITED');
  equals(child.storeKeyEditState(storeKey), hub.Store.INHERITED, 'child store edit state should be INHERITED');
  
  // now read data hash from child, locking child
  var json2 = child.readDataHash(storeKey);
  equals(child.storeKeyEditState(storeKey), hub.Store.EDITABLE, 'child store edit state should be locked after reading data');
  
  // now edit the root json and make sure it does NOT propogate.
  json.newItem = "bar";
  ok(child.readDataHash(storeKey).newItem !== 'bar', 'child json should not pick up edit from parent store since it is now locked');
});
