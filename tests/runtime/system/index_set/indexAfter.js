// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

var set ;

module("hub.IndexSet.indexAfter", {
  setup: function() {
    set = hub.IndexSet.create(5).add(10,5).add(100);
  }
});

test("no earlier index in set", function(){ 
  equals(set.indexAfter(3), 5, hub.fmt('set.indexAfter(3) in %@ should start of first index range', set));
});

test("with index after end of set", function() {
  equals(set.indexAfter(1000), -1, hub.fmt('set.indexAfter(1000) in %@ should return -1', set));
});

test("inside of multi-index range", function() {
  equals(set.indexAfter(12), 13, hub.fmt('set.indexAfter(12) in %@ should return next index', set));
});

test("end of multi-index range", function() {
  equals(set.indexAfter(14), 100, hub.fmt('set.indexAfter(14) in %@ should start of next range', set));
});


test("single index range", function() {
  equals(set.indexAfter(5), 10, hub.fmt('set.indexAfter(5) in %@ should start of next range multi-index range', set));
});
