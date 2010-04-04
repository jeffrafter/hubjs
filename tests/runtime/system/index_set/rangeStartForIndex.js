// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

var set, start, len ;

module("hub.IndexSet#rangeStartForIndex", {
  setup: function() {
    start = hub.IndexSet.HINT_SIZE*2 + 10 ;
    len  = Math.floor(hub.IndexSet.HINT_SIZE * 1.5);
    set = hub.IndexSet.create().add(start, len);
  }
});

test("index is start of range", function() {
  equals(set.rangeStartForIndex(start), start, 'should return start');
  equals(set.rangeStartForIndex(0), 0, 'should return first range');
});

test("index is middle of range", function() {
  equals(set.rangeStartForIndex(start+20), start, 'should return start');
  equals(set.rangeStartForIndex(start+hub.IndexSet.HINT_SIZE), start, 'should return start');
  equals(set.rangeStartForIndex(20), 0, 'should return first range');
});

test("index last index", function() {
  equals(set.rangeStartForIndex(start+len), start+len, 'should return end of range');
});

test("index past last index", function() {
  equals(set.rangeStartForIndex(start+len+20), start+len, 'should return end of range');
});
