// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

module("hub.IndexSet#create");

test("create with no params", function() {
  var set = hub.IndexSet.create();
  equals(set.get('length'), 0, 'should have no indexes');
});

test("create with just index", function() {
  var set = hub.IndexSet.create(4);
  equals(set.get('length'),1, 'should have 1 index');
  equals(set.contains(4), true, 'should contain index');
  equals(set.contains(5), false, 'should not contain 5');
});

test("create with index and length", function() {
  var set = hub.IndexSet.create(4, 2);
  equals(set.get('length'),2, 'should have 2 indexes');
  equals(set.contains(4), true, 'should contain 4');
  equals(set.contains(5), true, 'should contain 5');
});

test("create with other set", function() {
  var first = hub.IndexSet.create(4,2);

  var set = hub.IndexSet.create(first);
  equals(set.get('length'),2, 'should have same number of indexes (2)');
  equals(set.contains(4), true, 'should contain 4, just like first');
  equals(set.contains(5), true, 'should contain 5, just like first');
});
