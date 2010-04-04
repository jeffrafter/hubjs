// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

// FIXME: Is this still relevant, now that we have hub.ArraySuite?

var objectA,objectB,objectC, objectD, objectE; //global variables

module("hub.isArray" , {
  
  setup: function(){
    objectA = [1,2,3];
    objectB = 23;
    objectC = ["Hello","Hi"];
    objectD = "Hello";
    objectE  = {};
  }
});

test("should check if a given object is an array or not " ,function(){
  equals(hub.isArray(objectA),true);
  equals(hub.isArray(objectB),false);
  equals(hub.isArray(objectC),true);
  equals(hub.isArray(objectD),false);
  equals(hub.isArray(objectE),false);
});
