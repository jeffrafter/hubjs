// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same MyApp */

// test querying through find() on the store
module("hub.Query querying find() on a store", {
  setup: function() {
    
    // setup dummy app and store
    MyApp = hub.Object.create({});
    
    // setup a dummy model
    MyApp.Foo = hub.Record.extend();
    MyApp.Bar = hub.Record.extend();
    
    // setup data source that just returns cached storeKeys
    MyApp.DataSource = hub.DataSource.create({

      fetch: function(store, query) {
        this.query = query;
        this.store = store;
        this.fetchCount++ ;
        
        // used by tests to verify remote queries
        if (query.get('location') === hub.Query.REMOTE) {
          if (query.get('recordType') === MyApp.Foo) {
            store.loadQueryResults(query, this.get('storeKeys'));    
          }
        }
        
        return true ;
      },
      
      reset: function() {
        this.query = this.store = null ;
        this.fetchCount = this.prepareCount = 0 ;
      },
      
      fetchEquals: function(store, query, count, desc) {
        if (desc===undefined && typeof count === 'string') {
          desc = count;  count = undefined;
        }
        if (count===undefined) count = 1; 
        
        equals(this.store, store, desc + ': should get store');
        equals(this.query, query, desc + ': should get query');
        equals(this.fetchCount, count, desc + ': should get count');
      },
      
      destroyRecord: function(store, storeKey){
        store.dataSourceDidDestroy(storeKey);
        return true;
      }
      
    });
    
    MyApp.store = hub.Store.create().from(MyApp.DataSource);
    
    var records = [
      { guid: 1, firstName: "John", lastName: "Doe", married: true },
      { guid: 2, firstName: "Jane", lastName: "Doe", married: false },
      { guid: 3, firstName: "Emily", lastName: "Parker", bornIn: 1975, married: true },
      { guid: 4, firstName: "Johnny", lastName: "Cash", married: true },
      { guid: 5, firstName: "Bert", lastName: "Berthold", married: true }
    ];
    
    // load some data
    MyApp.DataSource.storeKeys = MyApp.store.loadRecords(MyApp.Foo, records);
    
    
    
    // for sanity check, load two record types
    MyApp.store.loadRecords(MyApp.Bar, records);
    
    
  },
  
  teardown: function() {
    MyApp = null ;
    hub.Record.subclasses.clear(); //reset
  }
  
});

// ..........................................................
// FINDING SINGLE RECORDS
// 

test("find(recordType, id)", function() {
  
  equals(MyApp.store.find('MyApp.Foo', 1).get('firstName'), 'John', 'should return foo(1)');
  equals(MyApp.store.find(MyApp.Foo, 1).get('firstName'), 'John', 'should return foo(1)');  
});

test("find(record)", function() {
  
  var rec1 = MyApp.store.find(MyApp.Foo, 1);
  equals(MyApp.store.find(rec1), rec1, 'find(rec1) should return rec1');
  
  var rec2 = MyApp.store.chain().find(rec1);
  ok(rec2 !== rec1, 'nested.find(rec1) should not return same instance');
  equals(rec2.get('storeKey'), rec1.get('storeKey'), 'nested.find(rec1) should return same record in nested store');
});

// ..........................................................
// RECORD ARRAY CACHING
// 
 
test("caching for a single store", function() {
  var r1 = MyApp.store.find(MyApp.Foo);  
  var r2 = MyApp.store.find(MyApp.Foo);
  ok(!!r1, 'should return a record array');
  ok(r1.isEnumerable, 'returned item should be enumerable');
  equals(r1.get('store'), MyApp.store, 'return object should be owned by store');
  equals(r2, r1, 'should return same record array for multiple calls');
});

test("find() caching for a chained store", function() {
  var r1 = MyApp.store.find(MyApp.Foo);  
  
  var child = MyApp.store.chain();
  var r2 = child.find(MyApp.Foo);
  var r3 = child.find(MyApp.Foo);

  ok(!!r1, 'should return a record array from base store');
  equals(r1.get('store'), MyApp.store, 'return object should be owned by store');
  
  ok(!!r2, 'should return a recurd array from child store');
  equals(r2.get('store'), child, 'return object should be owned by child store');
  
  ok(r2 !== r1, 'return value for child store should not be same as parent');
  equals(r3, r2, 'return value from child store should be the same after multiple calls');
  
  // check underlying queries
  ok(!!r1.get('query'), 'record array should have a query');
  equals(r2.get('query'), r1.get('query'), 'record arrays from parent and child stores should share the same query');
});

test("data source must get the right calls", function() {
  var ds = MyApp.store.get('dataSource');
  
  ds.reset();  
  var records = MyApp.store.find(MyApp.Foo);
  var q = hub.Query.local(MyApp.Foo);
  ds.fetchEquals(MyApp.store, q, 'after fetch');
});

// ..........................................................
// RECORD PROPERTIES
// 

test("should find records based on boolean", function() {
  
  var q = hub.Query.local(MyApp.Foo, "married=true");
  var records = MyApp.store.find(q);
  equals(records.get('length'), 4, 'record length should be 4');
  
});

test("should find records based on query string", function() {
  
  
  var q = hub.Query.local(MyApp.Foo, { conditions:"firstName = 'John'" });
  var records = MyApp.store.find(q);
  equals(records.get('length'), 1, 'record length should be 1');
  equals(records.objectAt(0).get('firstName'), 'John', 'name should be John');
  
});

test("should find records based on hub.Query", function() {
  var q = hub.Query.create({
    recordType: MyApp.Foo, 
    conditions:"firstName = 'Jane'"
  });
  
  var records = MyApp.store.find(q);
  
  equals(records.get('length'), 1, 'record length should be 1');
  equals(records.objectAt(0).get('firstName'), 'Jane', 'name should be Jane');
});

test("modifying a record should update RecordArray automatically", function() {
  var q    = hub.Query.local(MyApp.Foo, "firstName = 'Jane'"),
      recs = MyApp.store.find(q);
      
  equals(recs.get('length'), 1, 'record length should be 1');
  equals(recs.objectAt(0).get('firstName'), 'Jane', 'name should be Jane');
  
  

  var r2 = MyApp.store.find(MyApp.Foo, 3);
  ok(r2.get('firstName') !== 'Jane', 'precond - firstName is not Jane');
  r2.set('firstName', 'Jane');

  
  
  equals(recs.get('length'), 2, 'record length should increase');
  same(recs.getEach('firstName'), ['Jane', 'Jane'], 'check all firstNames are Jane');
  
  // try the other direction...
  
  r2.set('firstName', 'Ester');
   
  
  equals(recs.get('length'), 1, 'record length should decrease');

});

test("should find records based on hub.Query without recordType", function() {
  
  var q = hub.Query.local(hub.Record, "lastName = 'Doe'");
  
  var records = MyApp.store.find(q);
  equals(records.get('length'), 4, 'record length should be 2');

  same(records.getEach('firstName'), hub.w('John John Jane Jane'), 'firstNames should match');
});

test("should find records within a passed record array", function() {

  
  
  var q = hub.Query.create({ 
    recordType: MyApp.Foo, 
    conditions: "firstName = 'Emily'" 
  });

  var recArray = MyApp.store.find(MyApp.Foo);
  var records  = recArray.find(q);
  
  equals(records.get('length'), 1, 'record length should be 1');
  equals(records.objectAt(0).get('firstName'), 'Emily', 'name should be Emily');

  
  
});

test("sending a new store key array from the data source should update record array", function() {
  
  var q       = hub.Query.remote(MyApp.Foo),
      records = MyApp.store.find(q);
  
  
  equals(records.get('length'), 5, 'record length should be 5');
  
  
  var newStoreKeys = MyApp.DataSource.storeKeys.copy();
  newStoreKeys.pop();
  
  // .replace() will call .enumerableContentDidChange()
  
  MyApp.store.loadQueryResults(q, newStoreKeys);
  
  
  equals(records.get('length'), 4, 'record length should be 4');

});


test("loading more data into the store should propagate to record array", function() {
  
  var records = MyApp.store.find(MyApp.Foo);
  
  equals(records.get('length'), 5, 'record length before should be 5');

  
  
  var newStoreKeys = MyApp.store.loadRecords(MyApp.Foo, [
    { guid: 10, firstName: "John", lastName: "Johnson" }
  ]);
  
  
  
  equals(records.get('length'), 6, 'record length after should be 6');
});

test("loading more data into the store should propagate to record array with query", function() {

  var q = hub.Query.local(MyApp.Foo, "firstName = 'John'"),
      records = MyApp.store.find(q);
  
  equals(records.get('length'), 1, 'record length before should be 1');

  
  var newStoreKeys = MyApp.store.loadRecords(MyApp.Foo, [
    { guid: 10, firstName: "John", lastName: "Johnson" }
  ]);
  
  
  // .replace() will call .enumerableContentDidChange()
  // and should fire original hub.Query again
  equals(records.get('length'), 2, 'record length after should be 2');
  
  // subsequent updates to store keys should also work
  
  var newStoreKeys2 = MyApp.store.loadRecords(MyApp.Foo, [
    { guid: 11, firstName: "John", lastName: "Norman" }
  ]);
  
  
  equals(records.get('length'), 3, 'record length after should be 3');
});

test("Loading records after hub.Query should show up", function() {
  
  var q = hub.Query.local(MyApp.Foo, "firstName = 'John'"),
      records = MyApp.store.find(q);
      
  equals(records.get('length'), 1, 'record length should be 1');
  equals(records.objectAt(0).get('firstName'), 'John', 'name should be John');
  
  var recordsToLoad = [
    { guid: 20, firstName: "John", lastName: "Johnson" },
    { guid: 21, firstName: "John", lastName: "Anderson" },
    { guid: 22, firstName: "Barbara", lastName: "Jones" }
  ];
  
  
  MyApp.store.loadRecords(MyApp.Foo, recordsToLoad);
  
  
  equals(records.get('length'), 3, 'record length should be 3');
  
  equals(records.objectAt(0).get('firstName'), 'John', 'name should be John');
  equals(records.objectAt(1).get('firstName'), 'John', 'name should be John');
  equals(records.objectAt(2).get('firstName'), 'John', 'name should be John');
});

test("Loading records after getting empty record array based on hub.Query should update", function() {
  
  var q = hub.Query.local(MyApp.Foo, "firstName = 'Maria'");
  var records = MyApp.store.find(q);
  equals(records.get('length'), 0, 'record length should be 0');
  
  var recordsToLoad = [
    { guid: 20, firstName: "Maria", lastName: "Johnson" }
  ];
  
  
  MyApp.store.loadRecords(MyApp.Foo, recordsToLoad);
  
  
  equals(records.get('length'), 1, 'record length should be 1');
  
  equals(records.objectAt(0).get('firstName'), 'Maria', 'name should be Maria');  
});

test("Changing a record should make it show up in RecordArrays based on hub.Query", function() {
  
  var q, records, record;
  
  q = hub.Query.local(MyApp.Foo, "firstName = 'Maria'");
  records = MyApp.store.find(q);
  equals(records.get('length'), 0, 'record length should be 0');
  
  
  record = MyApp.store.find(MyApp.Foo, 1);
  record.set('firstName', 'Maria');
  
  
  equals(records.get('length'), 1, 'record length should be 1');
  equals(records.objectAt(0).get('firstName'), 'Maria', 'name should be Maria');
});

test("Deleting a record should make the RecordArray based on hub.Query update accordingly", function() {
  
  var q, records;

  q = hub.Query.local(MyApp.Foo, "firstName = 'John'");
  records = MyApp.store.find(q);
  equals(records.get('length'), 1, 'record length should be 1');
  
  
  records.objectAt(0).destroy();
  
  
  equals(records.get('length'), 0, 'record length should be 0');
});

test("Using find() with hub.Query on store with no data source should work", function() {

  var q, records, recordsToLoad;
  
  
  
  // create a store with no data source
  MyApp.store3 = hub.Store.create();
  
  q = hub.Query.local(MyApp.Foo, "firstName = 'John'");
  records = MyApp.store3.find(q);
  equals(records.get('length'), 0, 'record length should be 0');
  
  recordsToLoad = [
    { guid: 20, firstName: "John", lastName: "Johnson" },
    { guid: 21, firstName: "John", lastName: "Anderson" },
    { guid: 22, firstName: "Barbara", lastName: "Jones" }
  ];

  MyApp.store3.loadRecords(MyApp.Foo, recordsToLoad);
  
  
  
  equals(records.get('length'), 2, 'record length should be 2');  
});

test("Using orderBy in hub.Query returned from find()", function() {
  
  var q, records;
  
  q = hub.Query.local(MyApp.Foo, { orderBy: "firstName ASC" });
  records = MyApp.store.find(q);
  equals(records.get('length'), 5, 'record length should be 5');
  
  same(records.getEach('firstName'), ["Bert", "Emily", "Jane", "John", "Johnny"], 'first name should be properly sorted');  
});

test("Using orderBy in hub.Query returned from find() and loading more records to original store key array", function() {

  var q, records, newStoreKeys2;
  
  q = hub.Query.local(MyApp.Foo, { orderBy:"firstName ASC" });
  records = MyApp.store.find(q);
  equals(records.get('length'), 5, 'record length should be 5');
  
  equals(records.objectAt(0).get('firstName'), 'Bert', 'name should be Bert');
  equals(records.objectAt(4).get('firstName'), 'Johnny', 'name should be Johnny');
  
  
  newStoreKeys2 = MyApp.store.loadRecords(MyApp.Foo, [
    { guid: 11, firstName: "Anna", lastName: "Petterson" }
  ]);
  
  
  equals(records.objectAt(0).get('firstName'), 'Anna', 'name should be Anna');
  equals(records.objectAt(1).get('firstName'), 'Bert', 'name should be Bert');
  equals(records.objectAt(5).get('firstName'), 'Johnny', 'name should be Johnny');
  
});


test("Using orderBy in hub.Query and loading more records to the store", function() {

  var q, records;
  
  
  q = hub.Query.local(MyApp.Foo, { orderBy:"firstName ASC" });
  records = MyApp.store.find(q);
  equals(records.get('length'), 5, 'record length should be 5');
  equals(records.objectAt(0).get('firstName'), 'Bert', 'name should be Bert');
  
  MyApp.store.loadRecords(MyApp.Foo, [
    { guid: 11, firstName: "Anna", lastName: "Petterson" }
  ]);
  
  
  equals(records.get('length'), 6, 'record length should be 6');
  
  equals(records.objectAt(0).get('firstName'), 'Anna', 'name should be Anna');
  equals(records.objectAt(5).get('firstName'), 'Johnny', 'name should be Johnny');
  
});

test("Chaining find() queries", function() {
  
  var q, records, q2, records2;
  
  q = hub.Query.local(MyApp.Foo, "lastName='Doe'");
  records = MyApp.store.find(q);
  equals(records.get('length'), 2, 'record length should be 2');
  
  q2 = hub.Query.local(MyApp.Foo, "firstName='John'");
  records2 = records.find(q2);

  equals(records2.get('length'), 1, 'record length should be 1');  
  equals(records2.objectAt(0).get('firstName'), 'John', 'name should be John');
  
});

test("Chaining find() queries and loading more records", function() {

  var q, q2, records;
  
  
  q = hub.Query.local(MyApp.Foo, "lastName='Doe'");
  q2 = hub.Query.local(MyApp.Foo, "firstName='John'");
  
  records = MyApp.store.find(q).find(q2);
  equals(records.get('length'), 1, 'record length should be 1');
  
  MyApp.store.loadRecords(MyApp.Foo, [
    { guid: 11, firstName: "John", lastName: "Doe" }
  ]);
  
  
  equals(records.get('length'), 2, 'record length should be 2');  
});


module("create record");
 
test("creating record appears in future find()", function() {
  var Rec, store, r;
  
  Rec = hub.Record.extend({ title: hub.Record.attr(String) });
  store = hub.Store.create();
  
  hub.run(function() {
    store.loadRecords(Rec, 
      [ { title: "A", guid: 1 }, 
        { title: "B", guid: 2 } ]);
  });
  
  equals(store.find(Rec).get('length'), 2, 'should have two initial record');

  hub.run(function() {
    store.createRecord(Rec, { title: "C" });
    
    // NOTE: calling find() here should flush changes to the record arrays
    // so that find() always returns an accurate result
    r = store.find(Rec);
    equals(r.get('length'), 3, 'should return additional record');
  });

  r = store.find(Rec);
  equals(r.get('length'), 3, 'should return additional record');  
});
