// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

var objectA, objectB , arrayA, stringA; // global variables

module("Beget function Module", {
  setup: function() {
      objectA = {} ;
      objectB = {} ;
    arrayA  = [1,3];
    stringA ="stringA";
  }
});

test("should return a new object with same prototype as that of passed object", function() {
  equals(true, hub.beget(objectA) !== objectA, "Beget for an object") ;
  equals(true, hub.beget(stringA) !== stringA, "Beget for a string") ;
  equals(true, hub.beget(hub.hashFor(objectB))!==hub.hashFor(objectB), "Beget for a hash") ;
  equals(true, hub.beget(arrayA) !== arrayA, "Beget for an array") ;
});
