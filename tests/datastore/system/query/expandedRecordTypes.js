// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */
 
// test parsing of query string
var store, storeKey, rec1, rec2, rec3, rec4, rec5, MyApp, q;

module("hub.Query#containsRecordTypes", {
  setup: function() {
    MyApp = hub.Object.create();
    
    MyApp.Contact  = hub.Record.extend();
    MyApp.Person   = MyApp.Contact.extend(); // person is a type of contact
    MyApp.Group    = hub.Record.extend() ; // NOT a subclass
    MyApp.Foo      = hub.Record.extend();
    
  },
  
  teardown: function() { 
    MyApp = null ; 
    hub.Record.subclasses = hub.Set.create(); // reset subclasses
  }
});

test("single recordType with no subclasses", function() {
  var q = hub.Query.local(MyApp.Foo),
      expected = hub.CoreSet.create().add(MyApp.Foo);
      
  same(q.get('expandedRecordTypes'), expected, 'should have only MyApp.Foo');
});

test("multiple recordTypes with no subclasses", function() {
  var q = hub.Query.local([MyApp.Foo, MyApp.Group]),
      expected = hub.CoreSet.create().add(MyApp.Foo).add(MyApp.Group);
      
  same(q.get('expandedRecordTypes'), expected, 'should have MyApp.Foo, MyApp.Group');
});

test("base hub.Record", function() {
  var q = hub.Query.local(),
      expected = hub.CoreSet.create().addEach([hub.Record, MyApp.Foo, MyApp.Group, MyApp.Contact, MyApp.Person]);
      
  same(q.get('expandedRecordTypes'), expected, 'should have all defined types');
});

test("type with subclass", function() {
  var q = hub.Query.local(MyApp.Contact),
      expected = hub.CoreSet.create().addEach([MyApp.Contact, MyApp.Person]);
      
  same(q.get('expandedRecordTypes'), expected, 'should have all Contact and Person');
});

test("adding new type should invalidate property", function() {
  var q = hub.Query.local(MyApp.Contact),
      expected = hub.CoreSet.create().addEach([MyApp.Contact, MyApp.Person]);    
  same(q.get('expandedRecordTypes'), expected, 'precond - should have all Contact and Person');

  var Bar = MyApp.Person.extend(); // add a new record
  expected.add(Bar);
  same(q.get('expandedRecordTypes'), expected, 'should have all Contact, Person, and Bar');
});
