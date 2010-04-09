// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

module("hub.isArray") ;

test("returns true/false when needed" ,function() {
  equals(hub.isArray([1,2,3]), true) ;
  equals(hub.isArray(["Hello","Hi"]), true) ;
  equals(hub.isArray("Hello"), false) ;
  equals(hub.isArray(23), false) ;
  equals(hub.isArray({}), false) ;
});
