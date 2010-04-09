// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same MyApp */

var MyFoo = null ;
module("hub.Record#unknownProperty", {
  setup: function() {
    
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
    
    MyApp.FooStrict = hub.Record.extend();
    
    hub.mixin(MyApp.FooStrict, {
      ignoreUnknownProperties: true
    });
    
    MyApp.fooStrict = MyApp.store.createRecord(MyApp.FooStrict, MyApp.json);
    
  },
  
  teardown: function() {
    
  }
});

test("get() returns attributes with no type changes if they exist", function() {
  hub.w('foo number bool array').forEach(function(key) {
    equals(MyApp.foo.get(key), MyApp.json[key], "MyApp.foo.get(%@) should === attribute".fmt(key));
  });
});

test("get() unknown attribute returns undefined", function() {
  equals(MyApp.foo.get('imaginary'), undefined, 'imaginary property should be undefined');
});

test("set() unknown property should add to dataHash", function() {
  MyApp.foo.set('blue', '0x00f');
  equals(MyApp.store.dataHashes[MyApp.foo.storeKey].blue, '0x00f', 'should add blue attribute');
});

test("set() should replace existing property", function() {
  MyApp.foo.set('foo', 'baz');
  equals(MyApp.store.dataHashes[MyApp.foo.storeKey].foo, 'baz', 'should update foo attribute');
});

test("set() on unknown property if model ignoreUnknownProperties=true should not write it to data hash", function() {
  MyApp.fooStrict.set('foo', 'baz');
  equals(MyApp.store.dataHashes[MyApp.fooStrict.storeKey].foo, 'bar', 'should not have written new value to dataHash');
});
