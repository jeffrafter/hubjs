// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

var source, indexes, observer, obj ; // base array to work with
module("hub.RangeObserver#rangeDidChange", {
  setup: function() {
    
    // create array with 5 hub.Object's in them
    source = [1,2,3,4,5].map(function(x) {
      return hub.Object.create({ item: x, foo: "bar" }) ;
    }, this); 

    indexes = hub.IndexSet.create(2,2); // select 2..3
    
    observer = hub.Object.create({

      verify: false ,
      
      callCount: 0, 
      
      indexes: false,
      
      // whenever this is called, verify proper params are passed
      changeObserver: function(inSource, inObject, inKey, inIndexes, inContext) { 
        this.callCount++;
        if (this.verify) {
          ok(source === inSource, 'source should match source array');
          ok(!inObject, 'object param should be null');
          equals(inKey, '[]', 'passed key should be brackets');
          if (this.indexes) {
            ok(this.indexes.isEqual(inIndexes), hub.fmt('passed indexes should be %@.  actual: %@', this.indexes, inIndexes));
          } else if (this.indexes === null) {
            equals(inIndexes, null, 'passed indexes should be null');
          }
          
          equals(inContext, 'context', 'should pass context');
        }
      }
      
    });

    obj = hub.RangeObserver.create(source, indexes, observer, observer.changeObserver, "context", true);
    
  }
});

test("returns receiver", function() {
  ok(obj.rangeDidChange() === obj, 'should return receiver');
});

// ..........................................................
// CALLBACK
// 

test("invokes callback if no changes set is passed", function() {
  observer.verify = true ;
  observer.indexes = null ;
  obj.rangeDidChange();
  equals(observer.callCount, 1, 'should invoke callback');
});

test("invokes callback if changes set is passed and it intersects with observed range", function() {
  observer.verify = true ;
  observer.indexes = hub.IndexSet.create(1,2) ;
  obj.rangeDidChange(observer.indexes);
  equals(observer.callCount, 1, 'should invoke callback');
});

test("does NOT invoke callback if changes set is passed and it intersects with observed range", function() {
  obj.rangeDidChange(hub.IndexSet.create(4));
  equals(observer.callCount, 0, 'should NOT invoke callback');
});

// ..........................................................
// OBSERVER UPDATES
// 

test("if object in observed range changes, should stop observing old objects and start observing new objects - no previous changes", function() {
  
  var newObject = hub.Object.create({ item: 10, foo: "baz" });
  source[2] = newObject; // bypass KVO since we are testing it
  obj.rangeDidChange(hub.IndexSet.create(2));
  
  observer.callCount = 0 ;
  newObject.set('foo', 'bar');
  equals(observer.callCount, 1, 'should invoke observer when new object changes');
    
});

test("if object in observed range changes, should stop observing old objects and start observing new objects - previous changes", function() {
  
  source[2].set('foo', 'FOO2');
  equals(observer.callCount, 1, 'precond - should invoke observer on original object');
  
  var newObject = hub.Object.create({ item: 10, foo: "baz" });
  source[2] = newObject; // bypass KVO since we are testing it
  obj.rangeDidChange(hub.IndexSet.create(2));
  
  observer.callCount = 0 ;
  newObject.set('foo', 'bar');
  equals(observer.callCount, 1, 'should invoke observer when new object changes');
    
});
