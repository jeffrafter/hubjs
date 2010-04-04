// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

var store, storeKey1,storeKey2,storeKey3,storeKey4,storeKey5, storeKey6, json;
var json1, json2, json3, json4, json5, json6;

module("hub.Store#destroyRecord", {
  setup: function() {
    
    store = hub.Store.create();
    
    json1 = {
      guid: "destroyGUID1",
      string: "string",
      number: 23,
      bool:   true
    };
    json2 = {
      guid: "destroyGUID2",
      string: "string",
      number: 23,
      bool:   true
    };
    json3 = {
      guid: "destroyGUID3",
      string: "string",
      number: 23,
      bool:   true
    };
    json4 = {
      guid: "destroyGUID4",
      string: "string",
      number: 23,
      bool:   true
    };
    json5 = {
      guid: "destroyGUID5",
      string: "string",
      number: 23,
      bool:   true
    };
    json6 = {
      guid: "destroyGUID6",
      string: "string",
      number: 23,
      bool:   true
    };
    
    storeKey1 = hub.Store.generateStoreKey();
    store.writeDataHash(storeKey1, json1, hub.Record.BUSY_DESTROYING);
    storeKey2 = hub.Store.generateStoreKey();
    store.writeDataHash(storeKey2, json2, hub.Record.DESTROYED);
    storeKey3 = hub.Store.generateStoreKey();
    store.writeDataHash(storeKey3, json3, hub.Record.EMPTY);
    storeKey4 = hub.Store.generateStoreKey();
    store.writeDataHash(storeKey4, json4, hub.Record.BUSY);
    storeKey5 = hub.Store.generateStoreKey();
    store.writeDataHash(storeKey5, json5, hub.Record.READY_NEW);
    storeKey6 = hub.Store.generateStoreKey();
    store.writeDataHash(storeKey6, json6, hub.Record.READY_CLEAN);
  }
});

test("Check for different states after/before executing destroyRecord", function() {
  var throwError=false, msg, status;

  store.destroyRecord(undefined, undefined, storeKey1);
  status = store.readStatus( storeKey1);
  equals(status, hub.Record.BUSY_DESTROYING, "the status shouldn't have changed. It should be BUSY_DESTROYING ");
  
  store.destroyRecord(undefined, undefined, storeKey2);
  status = store.readStatus( storeKey2);
  equals(status, hub.Record.DESTROYED, "the status shouldn't have changed. It should be DESTROYED ");
  
  try{
    store.destroyRecord(undefined, undefined, storeKey3);
    msg='';
  }catch(error1){
    msg=error1.message;
  }
  equals(msg, hub.Record.NOT_FOUND_ERROR.message, "destroyRecord should throw the following error");
  
  try{
    store.destroyRecord(undefined, undefined, storeKey4);
    msg='';
  }catch(error2){
    msg=error2.message;
  }
  equals(msg, hub.Record.BUSY_ERROR.message, "destroyRecord should throw the following error");
  
  store.destroyRecord(undefined, undefined, storeKey5);
  status = store.readStatus( storeKey5);
  equals(status, hub.Record.DESTROYED_CLEAN, "the status should have changed to DESTROYED_CLEAN ");
  
  store.destroyRecord(undefined, undefined, storeKey6);
  status = store.readStatus( storeKey6);
  equals(status, hub.Record.DESTROYED_DIRTY, "the status should have changed to DESTROYED_DIRTY ");
  
  equals(store.changelog.length, 1, "The changelog has the following number of entries:");
});
