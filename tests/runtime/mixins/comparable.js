// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

var Rectangle = hub.Object.extend({
  length: 0,
  width: 0,
  
  area: function() {
    return this.get('length') * this.get('width');
  }
});

Rectangle.mixin(hub.Comparable, {
  compare: function(a, b) {
    return hub.compare(a.area(), b.area());
  }
});

var r1, r2;

module("Comparable", {
  
  setup: function() {
    r1 = Rectangle.create({length: 6, width: 12});
    r2 = Rectangle.create({length: 6, width: 13});
  },
  
  teardown: function() {
  }
  
});

test("should be comparable and return the correct result", function() {
  equals(r1.constructor.isComparable, true);
  equals(hub.compare(r1, r1), 0);
  equals(hub.compare(r1, r2), -1);
  equals(hub.compare(r2, r1), 1);
});
