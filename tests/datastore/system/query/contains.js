// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */
 
// test parsing of query string
var store, storeKey, foo1, foo2, bar1, bar2, baz, barChild, MyApp, q;
module("hub.Query comparison of records", {
  setup: function() {
    
    hub.RunLoop.begin();
    
    // setup dummy app and store
    MyApp = hub.Object.create({
      store: hub.Store.create()
    });
    
    // setup a dummy model
    MyApp.Foo = hub.Record.extend();
    MyApp.Bar = hub.Record.extend();
    MyApp.BarChild = MyApp.Bar.extend();
    MyApp.Baz = hub.Record.extend();
    
    // load some data
    MyApp.store.loadRecords(MyApp.Foo, [
      { guid: 1, firstName: "John", lastName: "Doe", year: 1974 },
      { guid: 2, firstName: "Jane", lastName: "Doe", year: 1975 }
    ]);
    
    MyApp.store.loadRecords(MyApp.Bar, [
      { guid: 3, firstName: "Emily", lastName: "Parker", year: 1975, active: null },
      { guid: 4, firstName: "Johnny", lastName: "Cash", active: false }
    ]);
    
    MyApp.store.loadRecords(MyApp.Baz, [
      { guid: 5, firstName: "Bert", lastName: "Berthold", active: true }
    ]);

    MyApp.store.loadRecords(MyApp.BarChild, [
      { guid: 6, firstName: "Bert", lastName: "Ernie", active: true }
    ]);
    
    hub.RunLoop.end();
    
    foo1 = MyApp.store.find(MyApp.Foo,1);
    foo2 = MyApp.store.find(MyApp.Foo,2);
    bar1 = MyApp.store.find(MyApp.Bar,3);
    bar2 = MyApp.store.find(MyApp.Bar,4);
    barChild = MyApp.store.find(MyApp.BarChild, 6);
    baz  = MyApp.store.find(MyApp.Baz,5);
    
  },
  
  teardown: function() {
    MyApp = foo1 = foo2 = bar1 = bar2 = baz = barChild = q = null;
  }
});

// ..........................................................
// BASIC TESTS
// 

test("should only contain records matching recordType or recordTypes", function() {
  
  q = hub.Query.create({ recordType: MyApp.Foo });
  equals(q.contains(foo1), true, 'q with recordType=Foo should contain record of type Foo');
  equals(q.contains(bar1), false, 'q with recordType=Foo should NOT contain record of type Bar');
  equals(q.contains(barChild), false, 'q with recordType=Foo should NOT contain record of type BarChild');
  
  equals(q.contains(baz),  false, 'q with recordType=Foo should NOT contain record of type Baz');
  
  q = hub.Query.create({ recordTypes: [MyApp.Foo, MyApp.Bar] });
  equals(q.contains(foo1), true, 'q with recordTypes=Foo,Bar should contain record of type Foo');
  equals(q.contains(bar1), true, 'q with recordTypes=Foo,Bar should contain record of type Bar');
  equals(hub.kindOf(barChild, MyApp.Bar), true, 'hub.kindOf(barChild, MyApp.Bar)');
  
  equals(q.contains(barChild), true, 'q with recordTypes=Foo,Bar should contain record of type BarChild');

  equals(q.contains(baz),  false, 'q with recordTypes=Foo,Bar should NOT contain record of type Baz');

  q = hub.Query.create();
  equals(q.contains(foo1), true, 'no recordType should contain record of type Foo');
  equals(q.contains(bar1), true, 'no recordType should contain record of type Foo');
  equals(q.contains(barChild), true, 'no recordType should contain record of type BarChild');
  equals(q.contains(baz), true, 'no recordType should contain record of type Foo');
  
});

test("should only contain records within parent scope, if one is defined", function() {
  
  q = hub.Query.create({ scope: hub.Set.create().add(foo1).add(bar1) });
  equals(q.contains(foo1), true, 'scope=[foo1,bar1] should return true for foo1');
  equals(q.contains(foo2), false, 'scope=[foo1,bar1] should return false for foo2');
  equals(q.contains(bar1), true, 'scope=[bar1] should return true for bar1');
  equals(q.contains(bar2), false, 'scope=[foo1,bar1] should return false for bar2');
});

test("should evaluate query against record", function() {
  q = hub.Query.create({ 
    conditions: "firstName = {firstName}", 
    parameters: { firstName: 'Bert' }
  });
  
  equals(q.contains(bar2), false, 'q(firstName=Bert) should return false for bar[firstName=Johnny]');
  equals(q.contains(baz), true, 'q(firstName=Bert) should return true for baz[firstName=Bert]');
  equals(q.contains(barChild), true, 'q(firstName=Bert) should return true for barChild[firstName=Bert]');

  var p  = { firstName: "Johnny" };
  equals(q.contains(bar2, p), true, 'q(firstName=Johnny) should return true for bar[firstName=Johnny]');
  equals(q.contains(baz, p), false, 'q(firstName=Johnny) should return false for baz[firstName=Bert]');
  equals(q.contains(barChild, p), false, 'q(firstName=Johnny) should return false for barChild[firstName=Bert]');
  
});

test("should consider recordType + query conditions", function() {
  q = hub.Query.create({
    conditions: "firstName = {firstName}",
    recordType: MyApp.Bar,
    parameters: { firstName: "Bert" }
  });
  
  equals(q.contains(bar1), false, 'should not contain bar1 (wrong firstName)');
  equals(q.contains(bar2), false, 'should not contain bar2 (wrong firstName)');
  equals(q.contains(barChild), true, 'should contain barChild');
  equals(q.contains(baz), false, 'should contain baz (wrong type)');
  
});
