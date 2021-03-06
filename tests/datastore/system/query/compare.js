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
module("hub.Query comparison of records", {
  setup: function() {
    
    
    
    // setup dummy app and store
    MyApp = hub.Object.create({
      store: hub.Store.create()
    });
    
    // setup a dummy model
    MyApp.Foo = hub.Record.extend({});
    
    // load some data
    MyApp.store.loadRecords(MyApp.Foo, [
      { id: 1, firstName: "John", lastName: "Doe", year: 1974 },
      { id: 2, firstName: "Jane", lastName: "Doe", year: 1975 },
      { id: 3, firstName: "Emily", lastName: "Parker", year: 1975, active: null },
      { id: 4, firstName: "Johnny", lastName: "Cash", active: false },
      { id: 5, firstName: "Bert", lastName: "Berthold", active: true }
    ]);
    
    
    
    rec1 = MyApp.store.find(MyApp.Foo,1);
    rec2 = MyApp.store.find(MyApp.Foo,2);
    rec3 = MyApp.store.find(MyApp.Foo,3);
    rec4 = MyApp.store.find(MyApp.Foo,4);
    rec5 = MyApp.store.find(MyApp.Foo,5);
    
    
    q = hub.Query.create();
  }
});
 
 
// ..........................................................
// TESTS
// 

test("parse() should work with conditions = null", function(){
  q.parse();
});
 
test("building the order", function() {
  // undefined orderBy
  q.orderBy = null;
  q.parse();
  equals(q._hub_order.length, 0, 'order should be empty');
  
  // empty orderBy
  q.orderBy = "";
  q.parse();
  equals(q._hub_order.length, 0, 'order should be empty');
  
  // single property
  q.orderBy = "firstName";
  q.parse();
  equals(q._hub_order[0].propertyName,'firstName', 'propertyName should be firstName');
  
  // more properties
  q.orderBy = "lastName, firstName";
  q.parse();
  equals(q._hub_order[0].propertyName,'lastName', 'propertyName should be lastName');
  equals(q._hub_order[1].propertyName,'firstName', 'propertyName should be firstName');
  
  // more properties with direction
  q.orderBy = "lastName, firstName, year DESC";
  q.parse();
  equals(q._hub_order[0].propertyName,'lastName', 'propertyName should be lastName');
  ok(!q._hub_order[0].descending, 'descending should be false');
  equals(q._hub_order[1].propertyName,'firstName', 'propertyName should be firstName');
  ok(!q._hub_order[1].descending, 'descending should be false');
  equals(q._hub_order[2].propertyName,'year', 'propertyName should be year');
  ok(q._hub_order[2].descending, 'descending should be true');
});

test("no order should result in comparison by id", function() {
  q.orderBy = null;
  q.parse();
  equals(q.compare(rec1,rec2), -1, 'id 1 should be before id 2');
});

test("comparing non existant properties", function() {
  q.orderBy = "year";
  q.parse();
  equals(q.compare(rec5,rec1), -1, 'null should be before 1974');
});
 
test("comparing null and boolean properties", function() {
  q.orderBy = "active";
  q.parse();
  equals(q.compare(rec3,rec4), -1, 'null should be before false');
  equals(q.compare(rec4,rec5), -1, 'false should be before true');
});
 
test("comparing number properties", function() {
  q.orderBy = "year";
  q.parse();
  equals(q.compare(rec1,rec2), -1, '1974 should be before 1975');
  
  q.orderBy = "year DESC";
  q.parse();
  equals(q.compare(rec1,rec2), 1, '1974 should be after 1975 with DESC');
}); 
 
 
test("comparing string properties", function() {
  q.orderBy = "firstName";
  q.parse();
  equals(q.compare(rec1,rec2), 1, 'John should be after Jane');
  
  q.orderBy = "firstName DESC";
  q.parse();
  equals(q.compare(rec1,rec2), -1, 'John should be before Jane with DESC');
}); 

test("comparing by equal properties should use id for order", function() {
  q.orderBy = "lastName";
  q.parse();
  equals(q.compare(rec1,rec2), -1, 'id 1 should be before id 2');
});
