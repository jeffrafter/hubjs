// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals GLOBAL hub module test ok equals same MyApp */

// test core array-mapping methods for RecordArray with RecordAttribute
var storeKeys, rec, rec2, bar, MyApp;

module("hub.RecordAttribute core methods", {
  setup: function() {

    MyApp = hub.Object.create({
      store: hub.Store.create()
    });
    
    // stick it to the window object so that objectForPropertyPath works
    GLOBAL.MyApp = MyApp;
    
    MyApp.Foo = hub.Record.extend({
      
      // test simple reading of a pass-through prop
      firstName: hub.Record.attr(String),

      // test mapping to another internal key
      otherName: hub.Record.attr(String, { key: "firstName" }),
      
      // test mapping Date
      date: hub.Record.attr(Date),
      nonIsoDate: hub.Record.attr(Date, { useIsoDate: false }),
      
      // test Array
      anArray: hub.Record.attr(Array),
      
      // test Object
      anObject: hub.Record.attr(Object),
      
      // used to test default value
      defaultValue: hub.Record.attr(String, {
        defaultValue: "default"
      }),
      
      // used to test default value
      defaultComputedValue: hub.Record.attr(Number, {
        defaultValue: function() {
          return Math.floor(Math.random()*3+1);
        }
      }),
      
      // test toOne relationships
      relatedTo: hub.Record.toOne('MyApp.Foo'),
      
      // test toOne relationship with computed type
      relatedToComputed: hub.Record.toOne(function() {
        // not using .get() to avoid another transform which will 
        // trigger an infinite loop
        return (this.readAttribute('relatedToComputed').indexOf("foo")===0) ? MyApp.Foo : MyApp.Bar;
      })
      
    });
    
    MyApp.Bar = hub.Record.extend({
      parent: hub.Record.toOne('MyApp.Foo', { aggregate: true }),
      relatedMany: hub.Record.toMany('MyApp.Foo', { aggregate: true })
    });
    
    
    storeKeys = MyApp.store.loadRecords(MyApp.Foo, [
      { 
        id: 'foo1', 
        firstName: "John", 
        lastName: "Doe", 
        date: "2009-03-01T20:30-08:00",
        anArray: ['one', 'two', 'three'],
        anObject: { 'key1': 'value1', 'key2': 'value2' }
      },
      
      { 
        id: 'foo2', 
        firstName: "Jane", 
        lastName: "Doe", 
        relatedTo: 'foo1',
        relatedToAggregate: 'bar1',
        anArray: 'notAnArray',
        anObject: 'notAnObject',
        nonIsoDate: "2009/06/10 8:55:50 +0000"
      },
      
      { 
        id: 'foo3', 
        firstName: "Alex", 
        lastName: "Doe", 
        relatedToComputed: 'bar1',
        anArray: ['one', 'two', 'three'],
        anObject: { 'key1': 'value1', 'key2': 'value2' }
      }
      
    ]);
    
    MyApp.store.loadRecords(MyApp.Bar, [
      { id: 'bar1', city: "Chicago", parent: 'foo2', relatedMany: ['foo1', 'foo2'] }
    ]);
    
    
    
    rec = MyApp.store.find(MyApp.Foo, 'foo1');
    rec2 = MyApp.store.find(MyApp.Foo, 'foo2');
    
    bar = MyApp.store.find(MyApp.Bar, 'bar1');
    equals(rec.storeKey, storeKeys[0], 'should find record');
    
  }
});

// ..........................................................
// READING
// 

test("pass-through should return builtin value" ,function() {
  equals(rec.get('firstName'), 'John', 'reading prop should get attr value');
});

test("returns default value if underyling value is empty", function() {
  equals(rec.get('defaultValue'), 'default', 'reading prop should return default value');
});

test("naming a key should read alternate attribute", function() {
  equals(rec.get('otherName'), 'John', 'reading prop otherName should get attr from firstName');
});

test("getting an array and object", function() {
  equals(rec.get('anArray').length, 3, 'reading prop anArray should get attr as array');
  equals((typeof rec.get('anObject')), 'object', 'reading prop anObject should get attr as object');
});

test("getting an array and object attributes where underlying value is not", function() {
  equals(rec2.get('anArray').length, 0, 'reading prop anArray should return empty array');
  equals((typeof rec2.get('anObject')), 'object', 'reading prop anObject should return empty object');
});

test("reading date should parse ISO date", function() {
  var d = new Date(1235968200000); // should be proper date
  equals(rec.get('date').toString(), d.toString(), 'should have matched date');
});

test("reading date should parse non-ISO date", function() {
  var d = new Date(1244624150000);
  equals(rec2.get('nonIsoDate').toString(), d.toString(), 'should have matched date');
});

test("reading computed default value", function() {
  var value = rec.get('defaultComputedValue');
  var validValues = [1,2,3,4];
  ok(validValues.indexOf(value)!==-1, 'should have a value from 1 through 4');
});

// ..........................................................
// WRITING
// 

test("writing pass-through should simply set value", function() {
  rec.set("firstName", "Foo");
  equals(rec.readAttribute("firstName"), "Foo", "should write string");

  rec.set("firstName", 23);
  equals(rec.readAttribute("firstName"), 23, "should write number");

  rec.set("firstName", true);
  equals(rec.readAttribute("firstName"), true, "should write bool");
  
});

test("writing a value should override default value", function() {
  equals(rec.get('defaultValue'), 'default', 'precond - returns default');
  rec.set('defaultValue', 'not-default');
  equals(rec.get('defaultValue'), 'not-default', 'newly written value should replace default value');
});

test("writing a date should generate an ISO date" ,function() {
  var date = new Date(1238650083966);
  equals(rec.set('date', date), rec, 'returns reciever');
  equals(rec.readAttribute('date'), '2009-04-01T22:28:03-07:00', hub.fmt('should have new time (%@)', date.toString()));
});

test("writing an attribute should make relationship aggregate dirty" ,function() {
  equals(bar.get('status'), hub.Record.READY_CLEAN, "precond - bar should be READY_CLEAN");
  equals(rec2.get('status'), hub.Record.READY_CLEAN, "precond - rec2 should be READY_CLEAN");
  
  bar.set('city', 'Oslo');
  
  equals(rec2.get('status'), hub.Record.READY_DIRTY, "foo2 should be READY_DIRTY");
});

test("writing an attribute should make many relationship aggregate dirty" ,function() {
  equals(bar.get('status'), hub.Record.READY_CLEAN, "precond - bar should be READY_CLEAN");
  equals(rec2.get('status'), hub.Record.READY_CLEAN, "precond - rec2 should be READY_CLEAN");
  
  bar.set('city', 'Oslo');
  
  equals(rec.get('status'), hub.Record.READY_DIRTY, "foo1 should be READY_DIRTY");
  equals(rec2.get('status'), hub.Record.READY_DIRTY, "foo2 should be READY_DIRTY");
});
