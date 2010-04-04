// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

var callCount, obj;

module("hub.Observers.isObservingSuspended", {
  setup: function() {
    callCount = 0;
    
    obj = hub.Object.create({ 
      foo: "bar",

      fooDidChange: function() { 
        callCount++; 
      }.observes('foo')
    });
  }
});

test("suspending observers stops notification", function() {
  hub.Observers.suspendPropertyObserving();
  hub.Observers.suspendPropertyObserving();
  obj.set("foo");
  equals(callCount, 0, 'should not notify observer while suspended');

  hub.Observers.resumePropertyObserving();
  equals(callCount, 0, 'should not notify observer while still suspended');
  
  hub.Observers.resumePropertyObserving();
  equals(callCount, 1, 'should notify observer when resumed');
  
});

// ..........................................................
// SPECIAL CASES
// 

// this test verifies a specific bug in the hub.Observing.propertyDidChange method.
test("suspended notifications should work when nesting property change groups", function() {
  
  hub.Observers.suspendPropertyObserving();
  obj.beginPropertyChanges();
  obj.set("foo");
  equals(callCount, 0, 'should not notify observer while suspended');

  obj.endPropertyChanges();
  equals(callCount, 0, 'should not notify observer while suspended');

  hub.Observers.resumePropertyObserving();
  equals(callCount, 1, 'should notify observer when resumed');
});
