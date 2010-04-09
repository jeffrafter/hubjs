// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals GLOBAL hub module test ok equals same */

// test parsing of query string
var rec, q;
module("hub.Query comparison of record types", {
  setup: function() {
    // setup dummy app and store
    GLOBAL.MyApp = hub.Object.create({
      store: hub.Store.create()
    });
    
    // setup a dummy model
    GLOBAL.MyApp.Foo = hub.Record.extend({});
    
    // load some data
    GLOBAL.MyApp.store.loadRecords(GLOBAL.MyApp.Foo, [
      { id: 1, firstName: "John", lastName: "Doe" }
    ]);
    
    rec = GLOBAL.MyApp.store.find(GLOBAL.MyApp.Foo,1);
    
    q = hub.Query.create();
  }
});


  
test("should handle record types", function() {
  
  q.conditions = "TYPE_IS 'MyApp.Foo'";
  q.parse();
  equals(hub.Store.recordTypeFor(rec.storeKey), hub.objectForPropertyPath('MyApp.Foo'), 'record type should be MyApp.Foo');
  ok(q.contains(rec), 'record with proper type should match');
  
  q.conditions = "TYPE_IS 'MyApp.Baz'";
  q.parse();
  ok(!q.contains(rec), 'record with wrong type should not match');
});
