// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

module("hub.IndexSet#max");

test("newly created index", function() {
  var set = hub.IndexSet.create();
  equals(set.get('max'), 0, 'max should be 0');
});

test("after adding one range", function() {
  var set = hub.IndexSet.create().add(4,2);
  equals(set.get('max'),6, 'max should be one greater than max index');
});

test("after adding range then removing part of range", function() {
  var set = hub.IndexSet.create().add(4,4).remove(6,4);
  equals(set.get('max'),6, 'max should be one greater than max index');
});

test("after adding range several disjoint ranges", function() {
  var set = hub.IndexSet.create().add(4,4).add(6000);
  equals(set.get('max'),6001, 'max should be one greater than max index');
});

test("after removing disjoint range", function() {
  var set = hub.IndexSet.create().add(4,2).add(6000).remove(5998,10);
  equals(set.get('max'),6, 'max should be one greater than max index');
});

test("after removing all ranges", function() {
  var set = hub.IndexSet.create().add(4,2).add(6000).remove(3,6200);
  equals(set.get('max'), 0, 'max should be back to 0 with no content');
});
