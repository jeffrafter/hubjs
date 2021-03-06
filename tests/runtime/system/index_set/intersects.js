// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

var set ;
module("hub.IndexSet#intersects", {
  setup: function() {
    set = hub.IndexSet.create().add(1000, 10).add(2000,1);
  }
});

// ..........................................................
// SINGLE INDEX
// 

test("handle index in set", function() {
  equals(set.intersects(1001), true, hub.fmt('index 1001 should be in set %@', set));
  equals(set.intersects(1009), true, hub.fmt('index 1009 should be in set %@', set));
  equals(set.intersects(2000), true, hub.fmt('index 2000 should be in set %@', set));
});

test("handle index not in set", function() {
  equals(set.intersects(0), false, 'index 0 should not be in set');
  equals(set.intersects(10), false, 'index 10 should not be in set');
  equals(set.intersects(1100), false, 'index 1100 should not be in set');
});

test("handle index past end of set", function() {
  equals(set.intersects(3000), false, 'index 3000 should not be in set');
});

// ..........................................................
// RANGE
// 

test("handle range inside set", function() {
  equals(set.intersects(1001,4), true, '1001..1003 should be in set');
});

test("handle range outside of set", function() {
  equals(set.intersects(100,4), false, '100..1003 should NOT be in set');
});

test("handle range partially inside set", function() {
  equals(set.intersects(998,4), true,'998..1001 should be in set');
});

// ..........................................................
// INDEX SET
// 

test("handle set inside set", function() {
  var test = hub.IndexSet.create().add(1001,4).add(1005,2);
  equals(set.intersects(test), true, hub.fmt('%@ should be in %@', test, set));
});

test("handle range outside of set", function() {
  var test = hub.IndexSet.create().add(100,4).add(105,2);
  equals(set.intersects(test), false, hub.fmt('%@ should be in %@', test, set));
});

test("handle range partially inside set", function() {
  var test = hub.IndexSet.create().add(1001,4).add(100,2);
  equals(set.intersects(test), true, hub.fmt('%@ should be in %@', test, set));
});

test("handle self", function() {
  equals(set.contains(set), true, 'should return true when passed itself');  
});
