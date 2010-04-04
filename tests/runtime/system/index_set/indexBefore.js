// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

var set ;

module("hub.IndexSet.indexBefore", {
  setup: function() {
    set = hub.IndexSet.create(5).add(10,5).add(100);
  }
});

test("no earlier index in set", function(){ 
  equals(set.indexBefore(4), -1, 'set.indexBefore(4) in %@ should not have index before it'.fmt(set));
});

test("with index after end of set", function() {
  equals(set.indexBefore(1000), 100, 'set.indexBefore(1000) in %@ should return last index in set'.fmt(set));
});

test("inside of multi-index range", function() {
  equals(set.indexBefore(12), 11, 'set.indexBefore(12) in %@ should return previous index'.fmt(set));
});

test("beginning of multi-index range", function() {
  equals(set.indexBefore(10), 5, 'set.indexBefore(10) in %@ should end of previous range'.fmt(set));
});


test("single index range", function() {
  equals(set.indexBefore(100), 14, 'set.indexBefore(100) in %@ should end of previous range multi-index range'.fmt(set));
});
