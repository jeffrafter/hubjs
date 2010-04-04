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
  
  teardown: function() { MyApp = null ; }
});

test("comparing a single record type", function() {
  var set, q;
  
  q = hub.Query.create({ recordType: MyApp.Contact });
  set = hub.Set.create().add(MyApp.Contact);
  equals(q.containsRecordTypes(set), true, 'should return true when set includes recordType');
  
  set = hub.Set.create().add(MyApp.Person);
  equals(q.containsRecordTypes(set), true, 'should return true when set include subclass of recordType');
  
  set = hub.Set.create().add(MyApp.Group);
  equals(q.containsRecordTypes(set), false, 'should return false when set include unrelated of recordType');

  set = hub.Set.create().add(MyApp.Group).add(MyApp.Contact);
  equals(q.containsRecordTypes(set), true, 'should return true when set includes  recordType along with others');
  
});

test("comparing a multiple record type", function() {
  var set, q;
  
  q = hub.Query.create({ recordTypes: [MyApp.Contact, MyApp.Group] });

  set = hub.Set.create().add(MyApp.Contact);
  equals(q.containsRecordTypes(set), true, 'should return true when set includes one of recordTypes');

  set = hub.Set.create().add(MyApp.Group);
  equals(q.containsRecordTypes(set), true, 'should return true when set includes one of recordTypes');
  
  set = hub.Set.create().add(MyApp.Person);
  equals(q.containsRecordTypes(set), true, 'should return true when set include subclass of recordTypes'); 
  
  set = hub.Set.create().add(MyApp.Group).add(MyApp.Foo);
  equals(q.containsRecordTypes(set), true, 'should return true when set includes  recordType along with others');
  
});


test("comparing with no recordType set", function() {
  var set, q;
  
  // NOTE: no recordType or recordTypes
  q = hub.Query.create({  });

  set = hub.Set.create().add(MyApp.Contact);
  equals(q.containsRecordTypes(set), true, 'should always return true');

  set = hub.Set.create().add(MyApp.Group);
  equals(q.containsRecordTypes(set), true, 'should always return true');
  
  set = hub.Set.create().add(MyApp.Person);
  equals(q.containsRecordTypes(set), true, 'should always return true');
  
  set = hub.Set.create().add(MyApp.Group).add(MyApp.Foo);
  equals(q.containsRecordTypes(set), true, 'should always return true');
  
});
