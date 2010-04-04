// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

// Unit test some standard hub.Array implementations.

// ..........................................................
// BUILT-IN ARRAY
// 

hub.ArraySuite.generate("built-in Array");

// ..........................................................
// DUMMY ARRAY (BASIC FAKE IMPLEMENTATION)
// 

// Test the hub.js Array interface on a custom object.
var DummyArray = hub.Object.extend(hub.Array, {
  
  length: 0,
  
  content: null,
  
  replace: function(idx, amt, objects) {
    if (!this.content) this.content = [] ;

    this.beginPropertyChanges() ;
    this.content.replace(idx,amt,objects) ;

    this.set('length', this.content.length) ;

    // figure out the range that changed.  If amt + objects are the same, use
    // amt.  Otherwise use total length.
    var len = objects ? objects.get('length') : 0;
    this.enumerableContentDidChange(idx, amt, len - amt) ;
    this.endPropertyChanges() ;
  },
  
  objectAt: function(idx) {
    if (!this.content) this.content = [] ;
    return this.content[idx] ;
  }
  
});

hub.ArraySuite.generate("DummyArray", {
  newObject: function(expected) {
    if (!expected || typeof expected === hub.T_NUMBER) {
      expected = this.expected(expected); 
    }
    return DummyArray.create({ content: expected, length: expected.length }) ;
  }
});
