// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

// TODO: Make these unit tests more complete.

var set1, set2, content;
module("hub.SelectionSet.isEqual", {
  setup: function() {
    content = '1 2 3 4 5 6 7 8 9 0'.w();
    set1 = hub.SelectionSet.create();
    set2 = hub.SelectionSet.create();
  }
});

test("set.isEqual(same instance)", function() {
  ok(set1.isEqual(set1), 'same instance should return true');
});

test("set.isEqual(null)", function() {
  ok(!set1.isEqual(null), 'null should return false');
});


test("set1.isEqual(set2)", function() {
  ok(set1.isEqual(set2), 'same content should return true');
  
  set1.add(content, 4,4);
  set2.add(content, 4,4);
  ok(set1.isEqual(set2), 'same content should return true');

  set1.remove(content, 6);
  set2.remove(content, 6);
  ok(set1.isEqual(set2), 'same content should return true');

  set1.remove(content, 4,4);
  set2.remove(content, 4,4);
  ok(set1.isEqual(set2), 'same content should return true');
  
});

test("multiple content objects", function() {
  var content2 = "1 2 3 4 5".w();
  set1.add(content, 4,4).add(content2, 3);
  ok(!set1.isEqual(set2), 'should not be same when set2 is empty');

  set2.add(content2, 3);
  ok(!set1.isEqual(set2), 'should not be same when set2 has only one content');

  set2.add(content,4,4);
  ok(set1.isEqual(set2), 'should not be same when set2 has both content');
  
});

test("set1.isEqual(set2) after set2 is filled and emptied", function() {
  set2.add(content,4,4).remove(content,4,4);
  ok(set1.isEqual(set2), 'same content should return true');
});
