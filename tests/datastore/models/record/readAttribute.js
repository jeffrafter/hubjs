// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

var store, Foo, json, foo ;
module("hub.Record#readAttribute", {
  setup: function() {
    store = hub.Store.create();
    Foo = hub.Record.extend();
    json = { 
      foo: "bar", 
      number: 123,
      bool: true,
      array: [1,2,3] 
    };
    
    foo = store.createRecord(Foo, json);
    store.writeStatus(foo.storeKey, hub.Record.READY_CLEAN); 
  }
});

test("returns unaltered JSON value for existing attributes", function() {
  var key ;
  for(key in json) {
    if (!json.hasOwnProperty(key)) continue;
    equals(foo.get(key), json[key], hub.fmt('should return value for predefined key %@', key));
  }
});

test("returns undefined for unknown JSON attributes", function() {
  equals(foo.get('imaginary'), undefined, 'should return undefined for unknown key "imaginary"');
});

test("returns new value if edited via writeAttribute", function() {
  foo.writeAttribute("bar", "baz");
  equals(foo.readAttribute("bar"), "baz", "should return value for new attribute 'bar'");
});

test("returns undefined when data hash is not present", function() {
  store.removeDataHash(foo.storeKey);
  equals(store.readDataHash(foo.storeKey), null, 'precond - data hash should be removed from store');
  equals(foo.readAttribute("foo"), undefined, "should return undefined if data hash is missing");
});
