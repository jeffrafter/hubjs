// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals GLOBAL hub module test ok equals same */

// An ObjectController will make a content object or an array of content objects 
module("hub.objectForPropertyPath") ;

test("should be able to resolve an object on the window", function() {
  var myLocal = (GLOBAL.myGlobal = { test: 'this '}) ;
  
  same(myLocal, { test: 'this '}) ;
  same(GLOBAL.myGlobal, { test: 'this '}) ;
  
  // verify we can resolve our binding path
  same(hub.objectForPropertyPath('myGlobal'), { test: 'this '}) ;
  
  GLOBAL.myGlobal =null ;
});
