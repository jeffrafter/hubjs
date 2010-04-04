// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

var object ;

module("Cloned Objects", {
  setup: function() {
    
  object = hub.Object.create({
  
    name:'Cloned Object',
    value:'value1',
   
    clone: function(object) {
      var ret = object ;
      switch (hub.typeOf(object)) {
    
       case hub.T_ARRAY:
          ret = object.slice() ;
        break ;

       case hub.T_OBJECT:
          ret = {} ;
          for(var key in object) ret[key] = object[key] ;
      }

      return ret ;
    }
  });
  }
});


test("should return a cloned object", function() {
  var objectA = [1,2,3,4,5] ;
  var objectB = "hub" ;
  var objectC = hub.hashFor(objectA);  
  var objectE = 100;
  var a = hub.clone(objectA);
  var b = hub.clone(objectA);
  
    equals(hub.clone(objectB), hub.clone(objectB)) ;
  equals(hub.clone(objectC), hub.clone(objectC)) ;
  equals(hub.clone(objectE), hub.clone(objectE)) ;
  same(a, b);
});

test("should return cloned object when the object is null", function() {
  var objectD = null;
    equals(hub.clone(objectD), hub.clone(objectD)) ;
});

test("should return a cloned array ", function() {
  var arrayA  = ['value1','value2'] ;
  var resultArray = object.clone(arrayA);
    equals(resultArray[0], arrayA[0], 'check first array item');
    equals(resultArray[1], arrayA[1], 'check first array item');
    
});

test("should use copy() if isCopyable", function() {
  var obj = hub.Object.create(hub.Copyable, {
    isCopy: false,
    
    copy: function() {
      return hub.Object.create(hub.Copyable, { isCopy: true });
    }
    
  });
  
  var copy = hub.clone(obj);
  ok(!!copy, 'clone should return a copy');
  equals(copy.isCopy, true, 'copy.isCopy should be true');
});

test("hub.copy should be an alias for hub.clone", function() {
  equals(hub.copy, hub.clone, 'hub.copy should equal hub.clone');
});
