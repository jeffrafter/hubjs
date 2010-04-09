// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

// This file tests the initial state of the store when it is first created
// either independently or as a child store.

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
// hub.Store#createEditingContext - init
// 
module("hub.Store#createEditingContext - init");

test("initial setup for child store", function() {
  var parent = hub.Store.create(),
      store  = parent.createEditingContext();
  
  ok(store !== parent, 'createEditingContext should return new child store');
  
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

test("allow for custom classes mixing in hub.ChildStore", function() {
  var parent = hub.Store.create();
  
  // We should get an exception if we specify a "subclass" that's not a class
  var ex = null;
  try {
    var bogus = parent.createEditingContext({}, "I am not a class");
  }
  catch(e) {
    ex = e;
  }
  ok(ex  &&  ex.message  &&  ex.message.indexOf('not a valid class') !== -1, 'createEditingContext should report that our bogus "class" it is not a valid class');
  
  // We should get an exception if we specify a class that has not mixed in 
  // hub.ChildStore
  ex = null;
  try {
    bogus = parent.createEditingContext({}, hub.Store);
  }
  catch(e2) {
    ex = e2;
  }
  ok(ex  &&  ex.message  &&  ex.message.indexOf('did not mixin hub.ChildStore') !== -1, 'createEditingContext should report that our class needs to mixin hub.ChildStore');
  
  
  // Our specified (proper!) subclass should be respected.
  var MyChildStoreSubclass = hub.Object.extend(hub.ChildStore, {});
  var child = parent.createEditingContext({}, MyChildStoreSubclass);
  ok(child.kindOf(MyChildStoreSubclass), 'our editing context should be the subclass we specified');
}); 


// ..........................................................
// SPECIAL CASES
// 

test("child store changes should propagate reliably", function() {
  var parent = hub.Store.create(), rec, store, rec2;

  hub.run(function() {
    parent.loadRecords(Rec, [{ title: "foo", id: 1 }]);
  });
  
  rec = parent.find(Rec, 1);
  ok(rec && rec.get('title')==='foo', 'precond - base store should have record');

  // run several times to make sure this works reliably when used several 
  // times in the same app
  
  // trial 1
  
  store = parent.createEditingContext();
  rec2  = store.find(Rec, 1);
  ok(rec2 && rec2.get('title')==='foo', 'child store should have record');
  
  rec.reset();
  rec2.set('title', 'bar');
  
  
  equals(rec2.get('title'), 'bar', 'child store rec.title should change');
  equals(rec.get('title'), 'foo', 'parent rec.title should NOT change');
  equals(store.get('hasChanges'), true, 'child store.hasChanges');
  equals(rec.fired, false, 'parent rec.title should not have notified');
  
  
  rec.reset();
  store.commitChanges();
  store.destroy();
  

  equals(rec.get('title'), 'bar', 'original rec.title should change');
  equals(rec.fired, true, 'original rec.title should have notified');  


  // trial 2
  
  store = parent.createEditingContext();
  rec2  = store.find(Rec, 1);
  ok(rec2 && rec2.get('title')==='bar', 'child store should have record');
  
  rec.reset();
  rec2.set('title', 'baz');
  
  
  equals(rec2.get('title'), 'baz', 'child store rec.title should change');
  equals(rec.get('title'), 'bar', 'parent rec.title should NOT change');
  equals(store.get('hasChanges'), true, 'child store.hasChanges');
  equals(rec.fired, false, 'parent rec.title should not have notified');
  
  
  rec.reset();
  store.commitChanges();
  store.destroy();
  

  equals(rec.get('title'), 'baz', 'parent rec.title should change');
  equals(rec.fired, true, 'parent rec.title should have notified');  
  

  // trial 1
  
  store = parent.createEditingContext();
  rec2  = store.find(Rec, 1);
  ok(rec2 && rec2.get('title')==='baz', 'child store should have record');
  
  rec.reset();
  rec2.set('title', 'FOO2');
  
  
  equals(rec2.get('title'), 'FOO2', 'child store rec.title should change');
  equals(rec.get('title'), 'baz', 'parent rec.title should NOT change');
  equals(store.get('hasChanges'), true, 'child store.hasChanges');
  equals(rec.fired, false, 'parent rec.title should not have notified');
  
  
  rec.reset();
  store.commitChanges();
  store.destroy();
  

  equals(rec.get('title'), 'FOO2', 'original rec.title should change');
  equals(rec.fired, true, 'original rec.title should have notified');  
  
});
