// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

var source, indexes, observer, obj ; // base array to work with
module("hub.RangeObserver#update", {
  setup: function() {
    
    // create array with 5 hub.Object's in them
    source = [1,2,3,4,5].map(function(x) {
      return hub.Object.create({ item: x, foo: "bar" }) ;
    }, this); 

    indexes = hub.IndexSet.create(2,2); // select 2..3
    
    observer = hub.Object.create({
      
      callCount: 0, 
      
      rangeDidChange: function() { 
        this.callCount++;
      }
      
    });

    obj = hub.RangeObserver.create(source, indexes, observer, observer.rangeDidChange, "context", true);
    
  }
});

test("returns receiver", function() {
  ok(obj === obj.update(source, hub.IndexSet.create()), 'should return receiver');
});

test("switches to observing new range - no previous updated", function() {
  obj.update(source, hub.IndexSet.create(0));
  observer.callCount = 0 ;
  
  var len = source.length, idx;
  for(idx=0;idx<len;idx++) source[idx].set('foo', 'baz');
  
  // since new index set length is different use this as a proxy to verify
  // that range changed
  equals(observer.callCount, 1, 'range observer should fire on new range');
});

test("switches to observing new range - previously updated", function() {
  var len = source.length, idx;
  for(idx=0;idx<len;idx++) source[idx].set('foo', 'baz');
  observer.callCount = 0 ;

  obj.update(source, hub.IndexSet.create(0));
  observer.callCount = 0 ;
  
  for(idx=0;idx<len;idx++) source[idx].set('foo', 'bar');
  
  // since new index set length is different use this as a proxy to verify
  // that range changed
  equals(observer.callCount, 1, 'range observer should fire on new range');
});
