// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

// test core array-mapping methods for RecordArray
var store, storeKey, json, rec, storeKeys, recs, query;
module("hub.RecordArray core methods", {
  setup: function() {
    // setup dummy store
    store = hub.Store.create();

    storeKey = hub.Record.storeKeyFor('foo');
    json = {  guid: "foo", foo: "foo" };
    
    store.writeDataHash(storeKey, json, hub.Record.READY_CLEAN); 
    
    
    // get record
    rec = store.materializeRecord(storeKey);
    equals(rec.get('foo'), 'foo', 'record should have json');
    
    // get record array.
    query = hub.Query.create({ recordType: hub.Record });
    recs = hub.RecordArray.create({ store: store, query: query });
  }
});

// ..........................................................
// BASIC TESTS
// 

test("should not initially populate storeKeys array until we flush()", function() {

  equals(recs.get('storeKeys'), null, 'should not have storeKeys yet');
  
  recs.flush();
  
  var storeKeys = recs.get('storeKeys');
  same(storeKeys, [storeKey], 'after flush should have initial set of storeKeys');
  
});

test("length property should flush", function() {
  equals(recs.get('storeKeys'), null,' should not have storeKeys yet');
  equals(recs.get('length'), 1, 'should have length 1 when called');
  same(recs.get('storeKeys'), [storeKey], 'after flush should have initial set of storeKeys');
});

test("objectAt() should flush", function() {
  equals(recs.get('storeKeys'), null,' should not have storeKeys yet');
  equals(recs.objectAt(0), rec, 'objectAt(0) should return record');
  same(recs.get('storeKeys'), [storeKey], 'after flush should have initial set of storeKeys');
});


// ..........................................................
// storeDidChangeStoreKeys()
// 

test("calling storeDidChangeStoreKeys() with a matching recordType", function() {
  recs.flush(); // do initial setup
  var orig = recs.get('storeKeys').copy();
  
  // do it this way instead of using store.createRecord() to isolate the 
  // method call.
  storeKey = hub.Record.storeKeyFor("bar");
  json     = {  guid: "bar", foo: "bar" };
  store.writeDataHash(storeKey, json, hub.Record.READY_CLEAN);
  
  equals(recs.get('needsFlush'), false, 'PRECOND - should not need flush');
  
  recs.storeDidChangeStoreKeys([storeKey], hub.Set.create().add(hub.Record));
  
  equals(recs.get('needsFlush'), true, 'needs flush now');
  same(recs.get('storeKeys'), orig, 'storeKeys should not have changed yet');
  
  recs.flush();
  
  orig.unshift(storeKey); // update - must be first b/c id.bar < id.foo
  equals(recs.get('needsFlush'), false, 'should not need flush anymore');
  same(recs.get('storeKeys'), orig, hub.fmt('storeKeys should now be updated - rec1[%@]{%@} = %@, rec2[%@]{%@} = %@', 
    rec.get('id'), rec.get('storeKey'), rec, 
    
    store.materializeRecord(storeKey).get('id'), 
    storeKey, 
    store.materializeRecord(storeKey)));
    
});

test("calling storeDidChangeStoreKeys() with a non-mathcing recordType", function() {

  var Foo = hub.Record.extend(),
      Bar = hub.Record.extend();
      
  storeKey = Foo.storeKeyFor('foo2');
  json = { guid: "foo2" };
  
  store.writeDataHash(storeKey, json, hub.Record.READY_CLEAN);

  query = hub.Query.create({ recordType: Foo });
  recs = hub.RecordArray.create({ store: store, query: query });
  recs.flush();
  equals(recs.get('length'), 1, 'should have a Foo record');

  // now simulate adding a Bar record
  storeKey = Bar.storeKeyFor('bar');
  json = { guid: "bar" };
  store.writeDataHash(storeKey, json, hub.Record.READY_CLEAN);
  
  recs.storeDidChangeStoreKeys([storeKey], hub.Set.create().add(Bar));
  equals(recs.get('needsFlush'), false, 'should not have indicated it needed a flush');

});

test("calling storeDidChangeStoreKeys() to remove a record", function() {

  equals(recs.get('length'), 1, 'PRECOND - should have storeKey');
  
  store.writeStatus(storeKey, hub.Record.DESTROYED_CLEAN);
  recs.storeDidChangeStoreKeys([storeKey], hub.Set.create().add(hub.Record));
  
  equals(recs.get('needsFlush'), true, 'should need flush after change');
  equals(recs.get('storeKeys').length, 1, 'should still have storeKey');
  
  equals(recs.get('length'), 0, 'should remove storeKey on flush()');
});
