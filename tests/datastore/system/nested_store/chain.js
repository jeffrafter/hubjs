// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

// This file tests the initial state of the store when it is first created
// either independently or as a chained store.

var Rec = hub.Record.extend({
  
  title: hub.Record.attr(String),
  
  fired: false,
  
  reset: function() { 
    this.fired = false;
  },
  
  titleDidChange: function() {
    this.fired = true;
  }.observes('title')
    
});

// ..........................................................
// hub.Store#chain - init
// 
module("hub.Store#chain - init");

test("initial setup for chained store", function() {
  var parent = hub.Store.create();
  var store  = parent.chain();
  
  ok(store !== parent, 'chain should return new child store');
  
  equals(store.get('parentStore'), parent, 'should have parentStore');
  
  equals(hub.typeOf(store.dataHashes), hub.T_HASH, 'should have dataHashes');
  parent.dataHashes.foo = 'bar';
  equals(store.dataHashes.foo, 'bar', 'dataHashes should inherit from parent');
    
  equals(hub.typeOf(store.revisions), hub.T_HASH, 'should have revisions');
  parent.revisions.foo = 'bar';
  equals(store.revisions.foo, 'bar', 'revisions should inherit from parent');

  equals(hub.typeOf(store.statuses), hub.T_HASH, 'should have statuses');
  parent.statuses.foo = 'bar';
  equals(store.statuses.foo, 'bar', 'statuses should inherit from parent');
  
  ok(!store.locks, 'should not have locks');
  ok(!store.chainedChanges, 'should not have chainedChanges');
  ok(!store.editables, 'should not have editables');
});

test("allow for custom subclasses of hub.NestedStore", function() {
  var parent = hub.Store.create();
  
  // We should get an exception if we specify a "subclass" that's not a class
  var ex = null;
  try {
    var bogus = parent.chain({}, "I am not a class");
  }
  catch(e) {
    ex = e;
  }
  ok(ex  &&  ex.message  &&  ex.message.indexOf('not a valid class') !== -1, 'chain should report that our bogus "class" it is not a valid class');
  
  // We should get an exception if we specify a class that's not a subclass of
  // hub.NestedStore
  ex = null;
  try {
    bogus = parent.chain({}, hub.Store);
  }
  catch(e2) {
    ex = e2;
  }
  ok(ex  &&  ex.message  &&  ex.message.indexOf('is not a type of hub.NestedStore') !== -1, 'chain should report that our class needs to be a subclass of hub.NestedStore');
  
  
  // Our specified (proper!) subclass should be respected.
  var MyNestedStoreSubclass = hub.NestedStore.extend();
  var nested = parent.chain({}, MyNestedStoreSubclass);
  ok(nested.kindOf(MyNestedStoreSubclass), 'our nested store should be the hub.NestedStore subclass we specified');
}); 


// ..........................................................
// SPECIAL CASES
// 

test("chained store changes should propagate reliably", function() {
  var parent = hub.Store.create(), rec, store, rec2;

  hub.run(function() {
    parent.loadRecords(Rec, [{ title: "foo", guid: 1 }]);
  });
  
  rec = parent.find(Rec, 1);
  ok(rec && rec.get('title')==='foo', 'precond - base store should have record');

  // run several times to make sure this works reliably when used several 
  // times in the same app
  
  // trial 1
  
  store = parent.chain();
  rec2  = store.find(Rec, 1);
  ok(rec2 && rec2.get('title')==='foo', 'chain store should have record');
  
  rec.reset();
  rec2.set('title', 'bar');
  
  
  equals(rec2.get('title'), 'bar', 'chained rec.title should changed');
  equals(rec.get('title'), 'foo', 'original rec.title should NOT change');
  equals(store.get('hasChanges'), true, 'chained store.hasChanges');
  equals(rec.fired, false, 'original rec.title should not have notified');
  
  
  rec.reset();
  store.commitChanges();
  store.destroy();
  

  equals(rec.get('title'), 'bar', 'original rec.title should change');
  equals(rec.fired, true, 'original rec.title should have notified');  


  // trial 2
  
  store = parent.chain();
  rec2  = store.find(Rec, 1);
  ok(rec2 && rec2.get('title')==='bar', 'chain store should have record');
  
  rec.reset();
  rec2.set('title', 'baz');
  
  
  equals(rec2.get('title'), 'baz', 'chained rec.title should changed');
  equals(rec.get('title'), 'bar', 'original rec.title should NOT change');
  equals(store.get('hasChanges'), true, 'chained store.hasChanges');
  equals(rec.fired, false, 'original rec.title should not have notified');
  
  
  rec.reset();
  store.commitChanges();
  store.destroy();
  

  equals(rec.get('title'), 'baz', 'original rec.title should change');
  equals(rec.fired, true, 'original rec.title should have notified');  
  

  // trial 1
  
  store = parent.chain();
  rec2  = store.find(Rec, 1);
  ok(rec2 && rec2.get('title')==='baz', 'chain store should have record');
  
  rec.reset();
  rec2.set('title', 'FOO2');
  
  
  equals(rec2.get('title'), 'FOO2', 'chained rec.title should changed');
  equals(rec.get('title'), 'baz', 'original rec.title should NOT change');
  equals(store.get('hasChanges'), true, 'chained store.hasChanges');
  equals(rec.fired, false, 'original rec.title should not have notified');
  
  
  rec.reset();
  store.commitChanges();
  store.destroy();
  

  equals(rec.get('title'), 'FOO2', 'original rec.title should change');
  equals(rec.fired, true, 'original rec.title should have notified');  
  
});
