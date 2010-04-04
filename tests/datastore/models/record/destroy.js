// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same MyApp */

var MyFoo = null, callInfo ;
module("hub.Record#destroy", {
  setup: function() {
    hub.RunLoop.begin();
    MyApp = hub.Object.create({
      store: hub.Store.create()
    })  ;
  
    MyApp.Foo = hub.Record.extend();
    MyApp.json = { 
      foo: "bar", 
      number: 123,
      bool: true,
      array: [1,2,3] 
    };
    
    MyApp.foo = MyApp.store.createRecord(MyApp.Foo, MyApp.json);
    
    // modify store so that everytime refreshRecords() is called it updates 
    // callInfo
    callInfo = null ;
    MyApp.store._hub__orig = MyApp.store.destroyRecord;
    MyApp.store.destroyRecord = function(records) {
      callInfo = hub.A(arguments) ; // save method call
      MyApp.store._hub__orig.apply(MyApp.store, arguments); 
    };
    hub.RunLoop.end();
  }
});

test("calling destroy on a newRecord will mark the record as destroyed and calls destroyRecords on the store", function() {
  equals(MyApp.foo.get('status'), hub.Record.READY_NEW, 'precond - status is READY_NEW');
  hub.RunLoop.begin();
  MyApp.foo.destroy();
  hub.RunLoop.end();
  same(callInfo, [null, null, MyApp.foo.storeKey], 'destroyRecords() should not be called');
  
  equals(MyApp.foo.get('status'), hub.Record.DESTROYED_CLEAN, 'status should be hub.Record.DESTROYED_CLEAN');
});

test("calling destroy on existing record should call destroyRecord() on store", function() {

  // Fake it till you make it...
  MyApp.store.writeStatus(MyApp.foo.storeKey, hub.Record.READY_CLEAN)
    .dataHashDidChange(MyApp.foo.storeKey, null, true);
    
  equals(MyApp.foo.get('status'), hub.Record.READY_CLEAN, 'precond - status is READY CLEAN');
  
  hub.RunLoop.begin();
  MyApp.foo.destroy();
  hub.RunLoop.end();
  
  same(callInfo, [null, null, MyApp.foo.storeKey], 'destroyRecord() should not be called');
  equals(MyApp.foo.get('status'), hub.Record.DESTROYED_DIRTY, 'status should be hub.Record.DESTROYED_DIRTY');
});

test("calling destroy on a record that is already destroyed should do nothing", function() {

  // destroy once
  hub.RunLoop.begin();
  MyApp.foo.destroy();
  hub.RunLoop.end();
  equals(MyApp.foo.get('status'), hub.Record.DESTROYED_CLEAN, 'status should be DESTROYED_CLEAN');
  
  hub.RunLoop.begin();
  MyApp.foo.destroy();
  hub.RunLoop.end();
  equals(MyApp.foo.get('status'), hub.Record.DESTROYED_CLEAN, 'status should be DESTROYED_CLEAN');
});

test("should return receiver", function() {
  equals(MyApp.foo.destroy(), MyApp.foo, 'should return receiver');
});

test("destroy should update status cache", function() {
  var st = MyApp.foo.get('status');
  ok(st !== hub.Record.DESTROYED_CLEAN, 'precond - foo should not be destroyed');

  hub.RunLoop.begin();
  MyApp.foo.destroy();
  equals(MyApp.foo.get('status'), hub.Record.DESTROYED_CLEAN, 'status should be DESTROYED_CLEAN immediately when destroyed directly by record');
  hub.RunLoop.end();
});
