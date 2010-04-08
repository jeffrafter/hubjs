// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same MyApp */

var MyFoo = null, callInfo ;
module("hub.Record#refresh", {
  setup: function() {
    MyApp = hub.Object.create({
      store: hub.Store.create()
    });
    
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
    MyApp.store.refreshRecord = function(records) {
      callInfo = hub.A(arguments) ; // save method call
    };
  }
});

test("calling refresh should call refreshRecord() on store", function() {
  MyApp.foo.refresh();
  same(callInfo, [null,null,MyApp.foo.storeKey], 'refreshRecord() should be called on parent');
});

test("should return receiver", function() {
  equals(MyApp.foo.refresh(), MyApp.foo, 'should return receiver');
});
