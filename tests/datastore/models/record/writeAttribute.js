// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

var store, Foo, json, foo ;
module("hub.Record#writeAttribute", {
  setup: function() {
    
    store = hub.Store.create();
    Foo = hub.Record.extend();
    json = { 
      foo: "bar", 
      number: 123,
      bool: true,
      array: [1,2,3],
      guid: 1
    };
    
    foo = store.createRecord(Foo, json);
    store.writeStatus(foo.storeKey, hub.Record.READY_CLEAN);
    
  }
});

test("returns receiver", function() {
  equals(foo.writeAttribute("bar", "baz"), foo, 'should return receiver');
});

test("first time writing should mark record as dirty", function() {
  // precondition
  equals(foo.get('status'), hub.Record.READY_CLEAN, 'precond - start clean');

  
  // action
  foo.writeAttribute("bar", "baz");
  
  
  // evaluate
  equals(foo.get('status'), hub.Record.READY_DIRTY, 'should make READY_DIRTY after write');
});

test("state change should be deferred if writing inside of a beginEditing()/endEditing() pair", function() {

  // precondition
  equals(foo.get('status'), hub.Record.READY_CLEAN, 'precond - start clean');

  
  // action
  foo.beginEditing();
  
  foo.writeAttribute("bar", "baz");
  
  equals(foo.get('status'), hub.Record.READY_CLEAN, 'should not change state yet');

  foo.endEditing();
  
  
  
  // evaluate
  equals(foo.get('status'), hub.Record.READY_DIRTY, 'should make READY_DIRTY after write');
  
}) ;

test("raises exception if you try to write an attribute before an attribute hash has been set", function() {
  store.removeDataHash(foo.storeKey);
  equals(store.readDataHash(foo.storeKey), null, 'precond - should not have store key');
  
  var cnt=0 ;
  try {
    foo.writeAttribute("foo", "bar");
  } catch(e) {
    equals(e, hub.Record.BAD_STATE_ERROR, 'should throw BAD_STATE_ERROR');
    cnt++;
  }
  equals(cnt, 1, 'should raise exception');
});


test("Writing to an attribute in chained store sets correct status", function() {
  
  var chainedStore = store.chain() ;
  
  var chainedRecord = chainedStore.find(Foo, foo.get('id'));
  equals(chainedRecord.get('status'), hub.Record.READY_CLEAN, 'precon - status should be READY_CLEAN');
  
  
  chainedRecord.writeAttribute('foo', 'newValue');
  
  //chainedRecord.set('foo', 'newValue');
  
  equals(chainedRecord.get('status'), hub.Record.READY_DIRTY, 'status should be READY_DIRTY');
  
});


test("Writing a new guid", function(){
  equals(foo.get('id'), 1, 'foo.id should be 1');
  foo.set('guid', 2);
  equals(foo.get('id'), 2, 'foo.id should be 2');
});

var PrimaryKeyId ;

test("Writing primaryKey of 'id'", function(){
  PrimaryKeyId = hub.Record.extend({ primaryKey: 'id' });
  var foo2 = store.createRecord(PrimaryKeyId, { id: 1 });

  equals(foo2.get('id'), 1, 'foo2.id should be 1');
  foo2.set('id', 2);
  equals(foo2.get('id'), 2, 'foo2.id should be 2');
});
