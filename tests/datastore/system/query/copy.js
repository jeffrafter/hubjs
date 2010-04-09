// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */
 
// test parsing of query string
module("hub.Query#copy");

test("basic copy", function() {
  var q=  hub.Query.create({
    conditions: "foo = bar",
    parameters: { foo: "bar" },
    orderBy: "foo",
    recordType: hub.Record,
    recordTypes: [hub.Record],
    location: hub.Query.REMOTE,
    scope: hub.CoreSet.create()
  }).freeze();
  
  var keys = hub.w('conditions orderBy recordType recordTypes parameters location scope');
  var copy = q.copy();
  
  equals(copy.isFrozen, false, 'copy should not be frozen');
  keys.forEach(function(key) {
    equals(copy.get(key), q.get(key), 'copy.%@ should = original.%@'.fmt(key, key));
  }, this);
  
});
