// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

// NOTE: The test below are based on the Data Hashes state chart.  This models
// the "did_change" event in the NestedStore portion of the diagram.

var parent, store, child, storeKey, json;
module("hub.NestedStore#dataHashDidChange", {
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
    child = store.chain();  // test multiple levels deep
  }
});

// ..........................................................
// BASIC STATE TRANSITIONS
// 


function testStateTransition(fromState, toState) {

  // verify preconditions
  equals(store.get('hasChanges'), false, 'should not have changes');
  equals(store.storeKeyEditState(storeKey), fromState, 'precond - storeKey edit state');
  if (store.chainedChanges) {
    ok(!store.chainedChanges.contains(storeKey), 'changedChanges should NOT include storeKey');
  }

  var oldrev = store.revisions[storeKey];
  
  // perform action
  equals(store.dataHashDidChange(storeKey), store, 'should return receiver');

  // verify results
  equals(store.storeKeyEditState(storeKey), toState, 'store key edit state is in same state');

  // verify revision
  ok(oldrev !== store.revisions[storeKey], hub.fmt('revisions should change. was: %@ - now: %@', oldrev, store.revisions[storeKey]));
  ok(store.chainedChanges.contains(storeKey), 'changedChanges should now include storeKey');
  
  equals(store.get('hasChanges'), true, 'should have changes');
} 

test("edit state = INHERITED, parent editable = false", function() {

  // verify preconditions
  equals(parent.storeKeyEditState(storeKey), hub.Store.LOCKED, 'precond - parent store edit state is not EDITABLE');
  
  testStateTransition(hub.Store.INHERITED, hub.Store.LOCKED);
}) ;

test("edit state = INHERITED, parent editable = true", function() {

  // verify preconditions
  parent.readEditableDataHash(storeKey);
  equals(parent.storeKeyEditState(storeKey), hub.Store.EDITABLE, 'precond - parent store edit state is EDITABLE');

  testStateTransition(hub.Store.INHERITED, hub.Store.EDITABLE);
}) ;

test("edit state = LOCKED", function() {
  store.readDataHash(storeKey); // lock
  testStateTransition(hub.Store.LOCKED, hub.Store.LOCKED);
}) ;

test("edit state = EDITABLE", function() {
  store.readEditableDataHash(storeKey); // make editable
  testStateTransition(hub.Store.EDITABLE, hub.Store.EDITABLE);
}) ;

// ..........................................................
// SPECIAL CASES
// 

test("calling with array of storeKeys will edit all store keys", function() {
  
  var storeKeys = [storeKey, hub.Store.generateStoreKey()], idx ;
  store.dataHashDidChange(storeKeys, 2000) ;
  for(idx=0;idx<storeKeys.length;idx++) {
    equals(store.revisions[storeKeys[idx]], 2000, hub.fmt('storeKey at index %@ should have new revision', idx));
    ok(store.chainedChanges.contains(storeKeys[idx]), hub.fmt('chainedChanges should include storeKey at index %@', idx));
  }
});

test("marking change should update revision but leave lock alone", function() {
  parent.dataHashDidChange(storeKey); // make sure parent has a revision
  store.readDataHash(storeKey); // cause a lock
  store.dataHashDidChange(storeKey); // update revision
  
  equals(store.locks[storeKey], parent.revisions[storeKey], 'lock should have parent revision');
  ok(store.revisions[storeKey] !== parent.revisions[storeKey], 'revision should not match parent rev');  
});
