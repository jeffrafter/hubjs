// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

var obj, obj1, don, don1 ; // global variables

module("A new hub.Object instance", {
  
  setup: function() {
    obj = hub.Object.create({
      foo: "bar",
      total: 12345,
      aMethodThatExists: function() {},
      aMethodThatReturnsTrue: function() { return true; },
      aMethodThatReturnsFoobar: function() { return "Foobar"; },
      aMethodThatReturnsFalse: function() { return false; }
    });
  },
  
  teardown: function() {
    obj = undefined ;
  }
  
});

test("Should identify it's methods using the 'respondsTo' method", function() {
  equals(obj.respondsTo('aMethodThatExists'), true) ;
  equals(obj.respondsTo('aMethodThatDoesNotExist'), false) ;
});

test("Should return false when asked to perform a method it does not have", function() {
  equals(obj.tryToPerform('aMethodThatDoesNotExist'), false) ;
});

test("Should pass back the return true if method returned true, false if method not implemented or returned false", function() {
  equals(obj.tryToPerform('aMethodThatReturnsTrue'), true, 'method that returns true') ;
  equals(obj.tryToPerform('aMethodThatReturnsFoobar'), true, 'method that returns something other than true or false') ;
  equals(obj.tryToPerform('aMethodThatReturnsFalse'), false, 'method that returns false') ;
  equals(obj.tryToPerform('imaginaryMethod'), false, 'method that is not implemented') ;
});

test("Should return it's properties when requested using hub.Object#get", function() {
  equals(obj.get('foo'), 'bar') ;
  equals(obj.get('total'), 12345) ;
});

test("Should allow changing of those properties by calling hub.Object#set", function() {
  equals(obj.get('foo'), 'bar') ;
  equals(obj.get('total'), 12345) ;
  
  obj.set( 'foo', 'Chunky Bacon' ) ;
  obj.set( 'total', 12 ) ;
  
  equals(obj.get('foo'), 'Chunky Bacon') ;
  equals(obj.get('total'), 12) ;
});

test("Should only advertise changes once per request to hub.Object#didChangeFor", function() {
  obj.set( 'foo', 'Chunky Bacon' );
  equals(obj.didChangeFor( this, 'foo' ), true) ;
  equals(obj.didChangeFor( this, 'foo' ), false) ;
});

test("Should advertise changes once per request to hub.Object#didChangeFor when setting property to NULL", function() {
  obj.set( 'foo', null );
  equals(obj.didChangeFor( this, 'foo' ), true) ;
  equals(obj.didChangeFor( this, 'foo' ), false) ;
});

test("When the object is destroyed the 'isDestroyed' status should change accordingly", function() {
  equals(obj.get('isDestroyed'), false);
  obj.destroy();
  equals(obj.get('isDestroyed'), true);
});


module("hub.Object instance extended", {  
  setup: function() {
    obj = hub.Object.extend();
  obj1 = obj.create();
  don = hub.Object.extend();
  don1 = don.create();
  },
  
  teardown: function() {
    obj = undefined ;
    obj1 = undefined ;
    don = undefined ;
    don1 = undefined ;
  }
  
});

test("Checking the instance of method for an object", function() {
  equals(obj1.instanceOf(obj), true);
  equals(obj1.instanceOf(don), false);
});

test("Checking the kind of method for an object", function() {
  equals(obj1.kindOf(obj), true);
  equals(obj1.kindOf(don), false);
  
  equals(hub.kindOf(obj1, obj), true);
  equals(hub.kindOf(obj1, don), false);
  equals(hub.kindOf(null, obj1), false);
});


module("hub.Object superclass and subclasses", {  
  setup: function() {
    obj = hub.Object.extend ({
    method1: function() {
    return "hello";
    }
  });
  obj1 = obj.extend();
  don = obj1.create ({
    method2: function() {
      return this.superclass();
    }
  });
  },

  teardown: function() {
  obj = undefined ;
    obj1 = undefined ;
    don = undefined ;
  }
});

test("Checking the superclass method for an existing function", function() {
  equals(don.method2().method1(), "hello");
});

test("Checking the subclassOf function on an object and its subclass", function(){
  equals(obj1.subclassOf(obj), true);
  equals(obj.subclassOf(obj1), false);
});

test("subclasses should contain defined subclasses", function() {
  ok(obj.subclasses.contains(obj1), 'obj.subclasses should contain obj1');
  
  equals(obj1.subclasses.get('length'),0,'obj1.subclasses should be empty');
  
  var kls2 = obj1.extend();
  ok(obj1.subclasses.contains(kls2), 'obj1.subclasses should contain kls2');
});
