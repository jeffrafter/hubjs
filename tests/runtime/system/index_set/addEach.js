// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

var set ;
module("hub.IndexSet#addEach", {
  setup: function() {
    set = hub.IndexSet.create();
  }
});

function iter(s) {
  var ret = [];
  set.forEach(function(k) { ret.push(k); });
  return ret ;
}

// ..........................................................
// BASIC ADDS
// 

test("adding should iterate over an array", function() {
  set.addEach([1000, 1010, 1020, 1030]);
  equals(set.get('length'), 4, 'should have correct index count');  
  equals(set.get('max'), 1031, 'max should return 1 past last index');
  same(iter(set), [1000, 1010, 1020, 1030]);
});

test("adding should iterate over a set", function() {
  // add out of order...
  var input = hub.Set.create().add(1030).add(1010).add(1020).add(1000);
  set.addEach(input);
  equals(set.get('length'), 4, 'should have correct index count');  
  equals(set.get('max'), 1031, 'max should return 1 past last index');
  same(iter(set), [1000, 1010, 1020, 1030]);
});


test("adding should iterate over a indexset", function() {
  // add out of order...
  var input = hub.IndexSet.create().add(1000,2).add(1010).add(1020).add(1030);
  set.addEach(input);
  equals(set.get('length'), 5, 'should have correct index count');  
  equals(set.get('max'), 1031, 'max should return 1 past last index');
  same(iter(set), [1000, 1001, 1010, 1020, 1030]);
});
