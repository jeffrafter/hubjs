// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

var a,b;

module("hub.none",{
  setup: function() {
    a = null;
    b = undefined; 
  }
});

test("should return true for null and undefined ",function(){
  equals(true,hub.none(a),"for a null parameter passed  ");
  equals(true,hub.none(b),"for a undefined parameter passed ");
});
