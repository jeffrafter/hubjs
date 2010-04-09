// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

var StringA, StringB, StringC ;

Spin.Plan.module("hub.isEqual – String", {
  setup: function() {
    StringA = "Hello" ;
    StringB = "Hi" ;
    StringC = "Hello" ;
  }
}) ;

test("strings should be equal ",function() {
  equals(hub.isEqual(StringA, StringB), false) ;
  equals(hub.isEqual(StringA, StringC), true) ;
}) ;

var num1, num2, num3 ;

Spin.Plan.module("hub.isEqual – Number", {
  setup: function() {
    num1 = 24 ;
    num2 = 24 ;
    num3 = 21 ;
  }
}) ;
 
test("numericals should be equal", function() {
  equals(hub.isEqual(num1, num2), true) ;
  equals(hub.isEqual(num1, num3), false) ;
}) ; 

var objectA, objectB, objectC ; //global variables

Spin.Plan.module("hub.isEqual – Array", {  
  setup: function() {
    objectA = [1,2] ;
    objectB = [1,2] ;
    objectC = [1] ;  
  }
}) ;
  
test("array should be equal", function() {
  // NOTE: We don't test for array contents -- that would be too expensive.
  equals(hub.isEqual(objectA, objectB), false, 'two array instances with the same values should not be equal');
  equals(hub.isEqual(objectA, objectC), false, 'two array instances with different values should not be equal');
});
