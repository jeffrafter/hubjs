// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

// NOTE: The test below are based on the Data Hashes state chart.  This models
// the "commit" event in the NestedStore portion of the diagram.

var parent, store, child, storeKey, json, args;
module("hub.NestedStore#commitChanges", {
  setup: function() {
    
    parent = hub.Store.create();
    
    json = {
      string: "string",
      number: 23,
      bool:   true
    };
    args = [];
    
    storeKey = hub.Store.generateStoreKey();

    store = parent.chain(); // create nested store
    child = store.chain();  // test multiple levels deep
    
    // override commitChangesFromNestedStore() so we can ensure it is called
    // save call history for later evaluation
    parent.commitChangesFromNestedStore =
    child.commitChangesFromNestedStore =
    store.commitChangesFromNestedStore = function(store, changes, force) {
      args.push({ 
        target: this, 
        store: store, 
        changes: changes, 
        force: force 
      });
    };
    
  }
});

// ..........................................................
// BASIC STATE TRANSITIONS
//

function testStateTransition(shouldIncludeStoreKey, shouldCallParent) {

  // attempt to commit
  equals(store.commitChanges(), store, 'should return receiver');
  
  // verify result
  equals(store.storeKeyEditState(storeKey), hub.Store.INHERITED, 'data edit state');

  if (shouldCallParent === false) {
    ok(!args || args.length===0, 'should not call commitChangesFromNestedStore');    
  } else {
    equals(args.length, 1, 'should have called commitChangesFromNestedStore');

    var opts = args[0] || {}; // avoid exceptions
    equals(opts.target, parent, 'should have called on parent store');

    // verify if changes passed to callback included storeKey
    var changes = opts.changes;
    var didInclude = changes && changes.contains(storeKey);
    if (shouldIncludeStoreKey) {
      ok(didInclude, 'passed set of changes should include storeKey');
    } else {
      ok(!didInclude, 'passed set of changes should NOT include storeKey');
    }
  }
  
  equals(store.get('hasChanges'), false, 'hasChanges should be cleared');
  ok(!store.chainedChanges || store.chainedChanges.length===0, 'should have empty chainedChanges set');
}

test("state = INHERITED", function() {

  // write in some data to parent
  parent.writeDataHash(storeKey, json);
  
  // check preconditions
  equals(store.storeKeyEditState(storeKey), hub.Store.INHERITED, 'precond - data edit state');

  testStateTransition(false, false);
});


test("state = LOCKED", function() {
  
  // write in some data to parent
  parent.writeDataHash(storeKey, json);
  parent.editables = null ; // manually force to lock state
  store.readDataHash(storeKey);
  
  // check preconditions
  equals(store.storeKeyEditState(storeKey), hub.Store.LOCKED, 'precond - data edit state');
  ok(!store.chainedChanges || !store.chainedChanges.contains(storeKey), 'locked record should not be in chainedChanges set');

  testStateTransition(false, false);
});

test("state = EDITABLE", function() {
  
  // write in some data to parent
  store.writeDataHash(storeKey, json);
  store.dataHashDidChange(storeKey);
  
  // check preconditions
  equals(store.storeKeyEditState(storeKey), hub.Store.EDITABLE, 'precond - data edit state');
  ok(store.chainedChanges  && store.chainedChanges.contains(storeKey), 'editable record should be in chainedChanges set');

  testStateTransition(true, true);
});


// ..........................................................
// SPECIAL CASES
// 

test("commiting a changed record should immediately notify outstanding records in parent store", function() {

  var Rec = hub.Record.extend({
    
    fooCnt: 0,
    fooDidChange: function() { this.fooCnt++; }.observes('foo'),
    
    statusCnt: 0,
    statusDidChange: function() { this.statusCnt++; }.observes('status'),
    
    reset: function() { this.fooCnt = this.statusCnt = 0; },
    
    equals: function(fooCnt, statusCnt, str) {
      if (!str) str = '' ;
      equals(this.get('fooCnt'), fooCnt, str + ':fooCnt');
      equals(this.get('statusCnt'), statusCnt, str + ':statusCnt');
    }
    
  });

  
    
  var store = hub.Store.create();
  var prec  = store.createRecord(Rec, { foo: "bar", id: 1 });
  
  var child = store.chain();
  var crec  = child.find(Rec, prec.get('id'));
  
  // check assumptions
  ok(!!crec, 'prerec - should find child record');
  equals(crec.get('foo'), 'bar', 'prerec - child record should have foo');
  
  // modify child record - should not modify parent
  prec.reset();
  crec.set('foo', 'baz');
  equals(prec.get('foo'), 'bar', 'should not modify parent before commit');
  prec.equals(0,0, 'before commitChanges');
  
  // commit changes - note: still inside runloop
  child.commitChanges();
  equals(prec.get('foo'), 'baz', 'should push data to parent');
  prec.equals(1,1, 'after commitChanges'); // should notify immediately
  
  
  
  // should not notify again after runloop - nothing to do
  prec.equals(1,1,'after runloop ends - should not notify again');
  
});
