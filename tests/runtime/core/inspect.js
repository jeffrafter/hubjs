// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

// FIXME: Find a better (and better tested) inspect() function.

var obj1,obj2,obj3; //global variables

module("hub.inspect()",{
  
      setup: function(){  
        obj1 = [1,3,4,9];
        obj2 = 24;     
        obj3 = {};
     }
});


test("hub.inspect module should give a string type",function(){
    var object1 = hub.inspect(obj1);   
  equals(true,hub.T_STRING === hub.typeOf(object1) ,'description of the array');
  
  var object2 = hub.inspect(obj2);
  equals(true,hub.T_STRING === hub.typeOf(object2),'description of the numbers');
  
  var object3 = hub.inspect(obj3);
  equals(true,hub.T_STRING === hub.typeOf(object3),'description of the object');
});
