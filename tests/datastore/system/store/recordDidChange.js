// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

var store, storeKey, json;
var json1, json2, json3, json4 ;
var storeKey1, storeKey2, storeKey3, storeKey4 ;

module("hub.Store#recordDidChange", {
  setup: function() {
    
      store = hub.Store.create();

      json1 = {
        guid: "commitGUID1",
        string: "string",
        number: 23,
        bool:   true
      };
      json2 = {
        guid: "commitGUID2",
        string: "string",
        number: 23,
        bool:   true
      };
      json3 = {
        guid: "commitGUID3",
        string: "string",
        number: 23,
        bool:   true
      };
      json4 = {
        guid: "commitGUID4",
        string: "string",
        number: 23,
        bool:   true
      };
      

      storeKey1 = hub.Store.generateStoreKey();
      store.writeDataHash(storeKey1, json1, hub.Record.BUSY_LOADING);
      storeKey2 = hub.Store.generateStoreKey();
      store.writeDataHash(storeKey2, json2, hub.Record.EMPTY);
      storeKey3 = hub.Store.generateStoreKey();
      store.writeDataHash(storeKey3, json3, hub.Record.READY_NEW);
      storeKey4 = hub.Store.generateStoreKey();
      store.writeDataHash(storeKey4, json4, hub.Record.READY_CLEAN);
    }
});

test("recordDidChange", function() {
  var status;
  try{
    store.recordDidChange(undefined, undefined, storeKey1);
  }catch(error1){
    equals(hub.Record.BUSY_ERROR.message, error1.message, "the status shouldn't have changed.");
  }
  
  try{
    store.recordDidChange(undefined, undefined, storeKey2);
  }catch(error2){
    equals(hub.Record.NOT_FOUND_ERROR.message, error2.message, "the status shouldn't have changed.");
  }
  
  store.recordDidChange(undefined, undefined, storeKey3);
   status = store.readStatus( storeKey3);
   equals(status, hub.Record.READY_NEW, "the status shouldn't have changed.");

   store.recordDidChange(undefined, undefined, storeKey4);
   status = store.readStatus( storeKey4);
   equals(status, hub.Record.READY_DIRTY, "the status shouldn't have changed.");
  
});
