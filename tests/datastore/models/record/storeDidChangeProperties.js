// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

var store, child, Foo, json, foo ;
module("hub.Record#storeDidChangeProperties", {
  setup: function() {
    hub.RunLoop.begin();
    
    store = hub.Store.create();
    Foo = hub.Record.extend({
      
      // record diagnostic change
      statusCnt: 0,
      statusDidChange: function() {
        this.statusCnt++;
      }.observes('status'),
      
      fooCnt: 0,
      fooDidChange: function() {
        this.fooCnt++;
      }.observes('foo')
      
    });
    
    
    json = { 
      foo: "bar", 
      number: 123,
      bool: true,
      array: [1,2,3] 
    };
    
    foo = store.createRecord(Foo, json);
    store.writeStatus(foo.storeKey, hub.Record.READY_CLEAN);
    
    hub.RunLoop.end();
  }
});

var checkPreconditions = function() {
  equals(foo.statusCnt, 0, 'precond - statusCnt');
  equals(foo.fooCnt, 0, 'precond - fooCnt');
};

var expect = function(fooObject, expectedStatusCnt, expectedFooCnt) {
  equals(fooObject.statusCnt, expectedStatusCnt, 'status should have changed');
  equals(fooObject.fooCnt, expectedFooCnt, 'foo should have changed');
};

// ..........................................................
// BASIC BEHAVIORS
// 

test("should change status only if statusOnly=true", function() {
  checkPreconditions();
  foo.storeDidChangeProperties(true);
  expect(foo,1,0);
});


test("should change attrs  & status if statusOnly=true", function() {
  checkPreconditions();
  foo.storeDidChangeProperties(false);
  expect(foo,1,1);
});

// ..........................................................
// VERIFY CALL SCENARIOS
// 

test("editing a clean record should change all", function() {
  checkPreconditions();
  
  hub.RunLoop.begin();
  foo.writeAttribute("foo", "baz"); // NB: Must be different from "foo"
  hub.RunLoop.end();
  
  expect(foo,2,1);
});

test("editing an attribute to same value should do nothing", function() {
  checkPreconditions();
  
  hub.RunLoop.begin();
  foo.writeAttribute("foo", "bar"); // NB: Must be "bar"
  hub.RunLoop.end();
  
  expect(foo,0,0);
});

test("destroying a record should change all", function() {
  checkPreconditions();
  hub.RunLoop.begin();
  foo.destroy();
  hub.RunLoop.end();
  expect(foo,1,1);
});

test("refreshing a record should change status", function() {
  checkPreconditions();
  hub.RunLoop.begin();
  foo.refresh();
  hub.RunLoop.end();
  expect(foo,1,0);
});

test("committing attribute changes from nested store should change attrs", function() {
  checkPreconditions();
  
  hub.RunLoop.begin();
  var child = store.chain();
  var foo2 = child.materializeRecord(foo.storeKey);

  foo2.writeAttribute('foo', 'baz'); // must not be 'bar'
  hub.RunLoop.end();
  // no changes should happen yet on foo.
  expect(foo,0,0);
  
  hub.RunLoop.begin();
  // commit
  child.commitChanges();

  // now changes
  expect(foo,1,1);
});

test("changing attributes on a parent store should notify child store if inherited", function() {
  var child = store.chain();
  var oldfoo = foo;
  var parentfoo = store.materializeRecord(foo.storeKey);
  var childfoo = child.materializeRecord(foo.storeKey);
  equals(child.storeKeyEditState(foo.storeKey), hub.Store.INHERITED, 'precond - foo should be inherited from parent store');
  
  hub.RunLoop.begin();
  parentfoo.writeAttribute('foo', 'baz'); // must not be bar
  hub.RunLoop.end();
  
  expect(childfoo,1,1); // should reflect on child
});

test("changing attributes on a parent store should NOT notify child store if locked", function() {
  
  var child = store.chain();
  var oldfoo = foo;
  var parentfoo = store.materializeRecord(foo.storeKey);
  var childfoo = child.materializeRecord(foo.storeKey);
  childfoo.readAttribute('foo');
  equals(child.storeKeyEditState(foo.storeKey), hub.Store.EDITABLE, 'precond - foo should be locked from parent store');
   
  hub.RunLoop.begin();
  parentfoo.writeAttribute('foo', 'baz'); // must not be bar
  hub.RunLoop.end();
  expect(childfoo,0,0); // should not reflect on child
  expect(parentfoo,2,1);
  // discarding changes should update

  // NOTE: recourds should change immediately on commit/discard changes.
  // test results here BEFORE run loop ends
  hub.RunLoop.begin();
  child.discardChanges(); // make it match parent again
  expect(childfoo,1,1); //the childfoo record is reset to whatever the parentValue is.
  hub.RunLoop.end();

});
