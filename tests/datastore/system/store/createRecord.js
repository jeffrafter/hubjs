// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

var store, storeKey, json, hash, hash2, MyRecordType;

module("hub.Store#createRecord", {
  setup: function() {
    
    MyRecordType = hub.Record.extend({
      string: hub.Record.attr(String, { defaultValue: "Untitled" }),
      number: hub.Record.attr(Number, { defaultValue: 5 }),
      bool: hub.Record.attr(Boolean, { defaultValue: true })
    });
    
    store = hub.Store.create();
    
    json = {
      string: "string",
      number: 23,
      bool:   true
    };
    
    storeKey = hub.Store.generateStoreKey();

    store.writeDataHash(storeKey, json, hub.Record.READY_CLEAN);
  }
});

test("create a record", function() {
  var sk;
  var rec = hub.Record.create();
  hash = {
    id: "1234abcd",
    string: "abcd",
    number: 1,
    bool:   false
    };
  hash2 = {
    string: "abcd",
    number: 1,
    bool:   false
  };

  rec = store.createRecord(hub.Record, hash);
  ok(rec, "a record was created");
  sk=store.storeKeyFor(hub.Record, rec.id());
  equals(store.readDataHash(sk), hash, "data hashes are equivalent");
  equals(rec.id(), "1234abcd", "ids are the same");

  rec = store.createRecord(hub.Record, hash2, "priKey");
  ok(rec, "a record with a custom id was created");
  sk=store.storeKeyFor(hub.Record, "priKey");
  equals(store.readDataHash(sk), hash2, "data hashes are equivalent");
  equals(rec.id(), "priKey", "ids are the same");
  
  equals(store.changelog.length, 2, "The changelog has the following number of entries:");
  
  
});

test("Creating an empty (null) record should make the hash available", function() {
  
  store.createRecord(MyRecordType, null, 'id8');
  var storeKey = store.storeKeyFor(MyRecordType, 'id8');
  
  ok(store.readDataHash(storeKey), 'data hash should not be empty/undefined');
  
});
