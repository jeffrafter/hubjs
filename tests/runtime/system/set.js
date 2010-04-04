// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

var a, b, c ; // global variables

module("creating hub.Set instances", {
  
  setup: function() {
    // create objects...
    a = { name: "a" } ;
    b = { name: "b" } ;
    c = { name: "c" } ;
  },
  
  teardown: function() {
    a = undefined ;
    b = undefined ;
    c = undefined ;
  }
  
});

test("hub.Set.create() should create empty set", function() {
  var set = hub.Set.create() ;
  equals(set.length, 0) ;
});

test("hub.Set.create([1,2,3]) should create set with three items in them", function() {
  var set = hub.Set.create([a,b,c]) ;
  equals(set.length, 3) ;
  equals(set.contains(a), true) ;
  equals(set.contains(b), true) ;
  equals(set.contains(c), true) ;
});

test("hub.Set.create() should accept anything that implements hub.Array", function() {
  var arrayLikeObject = hub.Object.create(hub.Array, {
    _hub_content: [a,b,c],
    length: 3,
    objectAt: function(idx) { return this._hub_content[idx]; } 
  }) ;
  
  var set = hub.Set.create(arrayLikeObject) ;
  equals(set.length, 3) ;
  equals(set.contains(a), true) ;
  equals(set.contains(b), true) ;
  equals(set.contains(c), true) ;
});

var set ; // global variables

// The tests below also end up testing the contains() method pretty 
// exhaustively.
module("hub.Set.add + hub.Set.contains", {
  
  setup: function() {
    set = hub.Set.create() ;
  },
  
  teardown: function() {
    set = undefined ;
  }
  
});

test("should add an hub.Object", function() {
  var obj = hub.Object.create() ;
  
  var oldLength = set.length ;
  set.add(obj) ;
  equals(set.contains(obj), true, "contains()") ;
  equals(oldLength+1, set.length, "new set length") ;
});

test("should add a regular hash", function() {
  var obj = {} ;
  
  var oldLength = set.length ;
  set.add(obj) ;
  equals(set.contains(obj), true, "contains()") ;
  equals(oldLength+1, set.length, "new set length") ;
});

test("should add a string", function() {
  var obj = "String!" ;
  
  var oldLength = set.length ;
  set.add(obj) ;
  equals(set.contains(obj), true, "contains()") ;
  equals(oldLength+1, set.length, "new set length") ;
});

test("should add a number", function() {
  var obj = 23 ;
  
  var oldLength = set.length ;
  set.add(obj) ;
  equals(set.contains(obj), true, "contains()") ;
  equals(oldLength+1, set.length, "new set length") ;
});

test("should add a bool", function() {
  var obj = true ;
  
  var oldLength = set.length ;
  set.add(obj) ;
  equals(set.contains(obj), true, "contains()") ;
  equals(oldLength+1, set.length, "new set length") ;
});

test("should add a function", function() {
  var obj = function() { return "Test function"; } ;
  
  var oldLength = set.length ;
  set.add(obj) ;
  equals(set.contains(obj), true, "contains()") ;
  equals(oldLength+1, set.length, "new set length") ;
});

test("should NOT add a null", function() {
  set.add(null) ;
  equals(set.length, 0) ;
  equals(set.contains(null), false) ;
});

test("should NOT add an undefined", function() {
  set.add(undefined) ;
  equals(set.length, 0) ;
  equals(set.contains(undefined), false) ;
});

test("adding an item, removing it, adding another item", function() {
  var item1 = "item1" ;
  var item2 = "item2" ;

  set.add(item1) ; // add to set
  set.remove(item1) ; //remove from set
  set.add(item2) ;
  
  equals(false, set.contains(item1), "set.contains(item1)") ;
  
  set.add(item1) ; // re-add to set
  equals(2, set.length, "set.length") ;
});

module("hub.Set.remove + hub.Set.contains", {
  
  // generate a set with every type of object, but none of the specific
  // ones we add in the tests below...
  setup: function() {
    set = hub.Set.create([
      hub.Object.create({ dummy: true }),
      { isHash: true },
      "Not the String",
      16, false]) ;
  },
  
  teardown: function() {
    set = undefined ;
  }
  
});

test("should remove an hub.Object and reduce length", function() {
  var obj = hub.Object.create() ;
  set.add(obj) ;
  equals(set.contains(obj), true) ;
  var oldLength = set.length ;
  
  set.remove(obj) ;
  equals(false, set.contains(obj), "should be removed") ;
  equals(oldLength-1, set.length, "should be 1 shorter") ;
});

test("should remove a regular hash and reduce length", function() {
  var obj = {} ;
  set.add(obj) ;
  equals(set.contains(obj), true) ;
  var oldLength = set.length ;
  
  set.remove(obj) ;
  equals(false, set.contains(obj), "should be removed") ;
  equals(oldLength-1, set.length, "should be 1 shorter") ;
});

test("should remove a string and reduce length", function() {
  var obj = "String!" ;
  set.add(obj) ;
  equals(set.contains(obj), true) ;
  var oldLength = set.length ;
  
  set.remove(obj) ;
  equals(false, set.contains(obj), "should be removed") ;
  equals(oldLength-1, set.length, "should be 1 shorter") ;
});

test("should remove a number and reduce length", function() {
  var obj = 23 ;
  set.add(obj) ;
  equals(set.contains(obj), true) ;
  var oldLength = set.length ;
  
  set.remove(obj) ;
  equals(false, set.contains(obj), "should be removed") ;
  equals(oldLength-1, set.length, "should be 1 shorter") ;
});

test("should remove a bool and reduce length", function() {
  var obj = true ;
  set.add(obj) ;
  equals(set.contains(obj), true) ;
  var oldLength = set.length ;
  
  set.remove(obj) ;
  equals(false, set.contains(obj), "should be removed") ;
  equals(oldLength-1, set.length, "should be 1 shorter") ;
});

test("should remove a function and reduce length", function() {
  var obj = function() { return "Test function"; } ;
  set.add(obj) ;
  equals(set.contains(obj), true) ;
  var oldLength = set.length ;
  
  set.remove(obj) ;
  equals(false, set.contains(obj), "should be removed") ;
  equals(oldLength-1, set.length, "should be 1 shorter") ;
});

test("should NOT remove a null", function() {
  var oldLength = set.length ;
  set.remove(null) ;
  equals(oldLength, set.length) ;
});

test("should NOT remove an undefined", function() {
  var oldLength = set.length ;
  set.remove(undefined) ;
  equals(oldLength, set.length) ;
});

test("should ignore removing an object not in the set", function() {
  var obj = hub.Object.create() ;
  var oldLength = set.length ;
  set.remove(obj) ;
  equals(oldLength, set.length) ;
});

// test("should remove all the elements in the set", function() {
//   var obj = [2,3,4];
//   set.add(obj) ;
//   var oldLength = set.length ;
//   equals(6, oldLength);
//   a = set.removeEach(obj);
//   equals(0, a.length);
// });

module("hub.Set.pop + hub.Set.clone", {
// generate a set with every type of object, but none of the specific
// ones we add in the tests below...
  setup: function() {
    set = hub.Set.create([
      hub.Object.create({ dummy: true }),
      { isHash: true },
      "Not the String",
      16, false]) ;
    },
    
    teardown: function() {
      set = undefined ;
    }
});

test("the pop() should remove an arbitrary object from the set", function() {
  var oldLength = set.length ;
  var obj = set.pop();
  equals(hub.T_OBJECT,hub.typeOf(obj),'pops up an object');
  equals(oldLength-1,set.length,'length shorter by 1');
});

test("the clone() should return an indentical set", function() {
  var oldLength = set.length ;
  var obj = set.clone();
  equals(oldLength,obj.length,'length of the clone should be same');
  equals(true,obj.contains(set[0]));
  equals(true,obj.contains(set[1]));
  equals(true,obj.contains(set[2]));
  equals(true,obj.contains(set[3]));
  equals(true,obj.contains(set[4]));
});
