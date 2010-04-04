// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

// test parsing of query string
var v = [];
module("hub.compare()", {
  setup: function() {
    // setup dummy data
    v[0]  = null;
    v[1]  = false;
    v[2]  = true;
    v[3]  = -12;
    v[4]  = 3.5;
    v[5]  = 'a string';
    v[6]  = 'another string';
    v[7]  = 'last string';
    v[8]  = [1,2];
    v[9]  = [1,2,3];
    v[10] = [1,3];
    v[11] = {a: 'hash'};
    v[12] = hub.Object.create();
    v[13] = function (a) {return a;};
  }
});


// ..........................................................
// TESTS
// 

test("ordering should work", function() {
  for (var j=0; j < v.length; j++) {
    equals(hub.compare(v[j],v[j]), 0, j +' should equal itself');
    for (var i=j+1; i < v.length; i++) {
      equals(hub.compare(v[j],v[i]), -1, 'v[' + j + '] (' + hub.typeOf(v[j]) + ') should be smaller than v[' + i + '] (' + hub.typeOf(v[i]) + ')' );
    }
    
  }
});
