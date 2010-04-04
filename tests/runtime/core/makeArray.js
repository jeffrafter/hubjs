// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

var objectA,objectB,objectC; //global variables

module("hub.makeArray", {
  setup: function() {
    var objectA = [1,2,3,4,5] ;
  var objectC = hub.hashFor(objectA);
  var objectD = null;
  var stringA = "string A" ; 
  }
});

test("should return an array for the object passed ",function(){
  var arrayA  = ['value1','value2'] ;
  var numberA = 100;
  var stringA = "hub" ;
  var obj = {} ;
  var ret = hub.makeArray(obj);
  equals(hub.isArray(ret),true);
  ret = hub.makeArray(stringA);
  equals(hub.isArray(ret), true) ;
  ret = hub.makeArray(numberA);
  equals(hub.isArray(ret),true) ;
  ret = hub.makeArray(arrayA);
  equals(hub.isArray(ret),true) ;
});
