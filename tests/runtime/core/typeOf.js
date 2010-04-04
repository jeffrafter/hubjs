// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

var object;

module("hub.typeOf", {
  setup: function() {
     object = hub.Object.create({
  
      method:function(){
    
      }
     });
  
  }   
  
});

test("should return the type for the passed item", function() {
    var a = null;
    var arr = [1,2,3];
    var obj = {};
    
      equals(hub.T_NULL,hub.typeOf(a),"item of type null ");
    equals(hub.T_ARRAY,hub.typeOf(arr),"item of type array ");      
    equals(hub.T_HASH,hub.typeOf(obj),"item of type hash");
    equals(hub.T_OBJECT,hub.typeOf(object),"item of type object");
    equals(hub.T_FUNCTION,hub.typeOf(object.method),"item of type function") ;
    equals(hub.T_CLASS,hub.typeOf(hub.Object),"item of type class");
});
