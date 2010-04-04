// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

var object, object1,object3; //global variables

module("Checking the tuple for property path",{
  
  setup: function(){
     object = hub.Object.create({
      name:'hub',
      value:'',            //no value defined for the property
      objectA:hub.Object.create({
          propertyVal:"chainedProperty"
      })    
     });
   }

});
   

test("should check for the tuple property", function() {
  var object2 = [];
  object2 = hub.tupleForPropertyPath(object.name,'');
  ok(object2[0] === GLOBAL, "the global object");
  equals(object2[1],'hub',"the property name");
  
  object2 = hub.tupleForPropertyPath(object.objectA.propertyVal,'object');
  equals(object2[0],'object',"the root");
  equals(object2[1],'chainedProperty',"a chained property");
});

test("should check for the tuple property when path is undefined",function(){     //test case where no property defined
     var object2;
     object2 = hub.tupleForPropertyPath(object.value,'');
     equals(true,object2 === null,'returns null for undefined path');  
});
