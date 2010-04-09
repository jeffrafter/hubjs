// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

var source, indexes, observer, obj ; // base array to work with
module("hub.RangeObserver#objectPropertyDidChange", {
  setup: function() {
    
    // create array with 5 hub.Object's in them
    source = [1,2,3,4,5].map(function(x) {
      return hub.Object.create({ item: x, foo: "bar" }) ;
    }, this); 
    
    indexes = hub.IndexSet.create(2,2); // select 2..3
    
    observer = hub.Object.create({

      verify: false ,
      
      callCount: 0, 
      
      object: false,
      
      key: false,

      indexes: false,
      
      context: false,
      
      setupVerify: function(object, key, indexes, context) {
        this.verify = true ;  
        this.object = (object === undefined) ? false : object ;
        this.key = (key === undefined) ? false : key ;
        this.indexes = (indexes === undefined) ? false :indexes ;
        this.context = (context === undefined) ? false : context ;
        return this ;
      },
      
      // whenever this is called, verify proper params are passed
      changeObserver: function(inSource, inObject, inKey, inIndexes, inContext) { 
        this.callCount++;
        if (this.verify) {
          ok(source === inSource, 'source should match source array');
          
          if (this.object || this.object === null) {
            equals(inObject, this.object, 'passed object should match');  
          }

          if (this.key !== false) {
            equals(inKey, this.key, 'passed key should match');
          }
          
          if (this.indexes) {
            ok(inIndexes && inIndexes.isIndexSet, hub.fmt('passed indexes should be an index set (actual: %@)', inIndexes));
            if (this.indexes.isIndexSet) {
              ok(this.indexes.isEqual(inIndexes), hub.fmt('passed indexes should match %@ (actual: %@)', this.indexes, inIndexes));
            }
          } else if (this.indexes === null) {
            equals(inIndexes, null, 'passed indexes should be null');
          }

          if (this.context !== false) {
            equals(inContext, this.context, 'passed context should match');
          }

        }
      }
      
    });

  }
});

test("changing property on object that does not appear in range", function() {
  obj = hub.RangeObserver.create(source, indexes, observer, observer.changeObserver, null, true);
  source[4].set('foo', 'baz');
  equals(observer.callCount, 0, 'should not invoke observer callback') ;
});

test("changing property on object that appears one time in range", function() {
  observer.setupVerify(source[2], 'foo', hub.IndexSet.create(2));
  
  obj = hub.RangeObserver.create(source, indexes, observer, observer.changeObserver, null, true);
  source[2].set('foo', 'baz');
  equals(observer.callCount, 1, 'should not invoke observer callback') ;
}) ;

test("changing property on object that appears more than one time in range", function() {
  source[3] = source[2]; // copy item.  don't use KVO because we're testing it
  observer.setupVerify(source[2], 'foo', hub.IndexSet.create(2,2));
  
  obj = hub.RangeObserver.create(source, indexes, observer, observer.changeObserver, null, true);
  source[2].set('foo', 'baz');
  equals(observer.callCount, 1, 'should not invoke observer callback') ;
});

test("changing all properties on object that apepars one time in range", function() {
  observer.setupVerify(source[2], '*', hub.IndexSet.create(2));
  
  obj = hub.RangeObserver.create(source, indexes, observer, observer.changeObserver, null, true);
  source[2].allPropertiesDidChange();
  equals(observer.callCount, 1, 'should not invoke observer callback') ;
});

test("notifications with context", function() {
  observer.setupVerify(source[2], 'foo', hub.IndexSet.create(2), 'context');
  
  obj = hub.RangeObserver.create(source, indexes, observer, observer.changeObserver, 'context', true);
  source[2].set('foo', 'baz');
  equals(observer.callCount, 1, 'should not invoke observer callback') ;
});
