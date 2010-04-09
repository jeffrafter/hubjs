// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

var set, ret ;

module("hub.IndexSet#without", {
  setup: function() {
    set = hub.IndexSet.create(1,9);
  }
});

function iter(s) {
  var ret = [];
  s.forEach(function(k) { ret.push(k); });
  return ret ;
}

test("should return empty set when removing self", function() {
  ret = set.without(set);
  ok(ret !== set, 'is not same instance');
  same(iter(ret), []);
});

test("should return set with range removed from middle", function() {
  ret = hub.IndexSet.create(2,6);
  ret = set.without(ret);
  ok(ret !== set, 'is not same instance');
  same(iter(ret), [1,8,9]);
});

test("should return set with range removed overlapping end", function() {
  ret = set.without(hub.IndexSet.create(6,6));
  ok(ret !== set, 'is not same instance');
  same(iter(ret), [1,2,3,4,5]);
});

test("should return set with range removed overlapping beginning", function() {
  ret = set.without(hub.IndexSet.create(0,6));
  ok(ret !== set, 'is not same instance');
  same(iter(ret), [6,7,8,9]);
});


test("should return set with multiple ranges removed", function() {
  ret = set.without(hub.IndexSet.create(2,2).add(6,2));
  ok(ret !== set, 'is not same instance');
  same(iter(ret), [1,4,5,8,9]);
});

test("using without should properly hint returned index set", function() {
  var set = hub.IndexSet.create(10000,5),
      set2 = hub.IndexSet.create(10000),
      actual = set.without(set2),
      loc = hub.IndexSet.HINT_SIZE;
      
  while(loc<2000) { // spot check
    equals(actual._hub_content[loc], 0, hub.fmt('index set should have hint at loc %@ - set: %@', loc, actual.inspect()));
    loc += hub.IndexSet.HINT_SIZE;
  }
});

// ..........................................................
// NORMALIZED PARAMETER CASES
// 

test("passing no params should return clone", function() {
  ret = set.without();
  ok(ret !== set, 'is not same instance');
  ok(ret.isEqual(set), 'has same content');
});

test("passing single number should remove just that index", function() {
  ret = set.without(5);
  same(iter(ret), [1,2,3,4,6,7,8,9]);
});

test("passing two numbers should remove range", function() {
  ret = set.without(2,6);
  same(iter(ret), [1,8,9]);
});

test("passing range object should remove range", function() {
  ret = set.without({ start: 2, length: 6 });
  same(iter(ret), [1,8,9]);
});
