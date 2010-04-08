// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

var store, storeKey1, storeKey2, storeKey3, storeKey4, storeKey5, storeKey6;
var storeKey7, storeKey8, json, json1, json2, json3, json4, json5, json6 ;
var json7, json8;

module("hub.Store#retrieveRecord", {
  setup: function() {
    
    store = hub.Store.create();
    
    json1 = {
      guid: "retrieveGUID1",
      string: "string",
      number: 23,
      bool:   true
    };
    json2 = {
      guid: "retrieveGUID2",
      string: "string",
      number: 23,
      bool:   true
    };
    json3 = {
      guid: "retrieveGUID3",
      string: "string",
      number: 23,
      bool:   true
    };
    json4 = {
      guid: "retrieveGUID4",
      string: "string",
      number: 23,
      bool:   true
    };
    json5 = {
      guid: "retrieveGUID5",
      string: "string",
      number: 23,
      bool:   true
    };
    json6 = {
      guid: "retrieveGUID6",
      string: "string",
      number: 23,
      bool:   true
    };
    json7 = {
      guid: "retrieveGUID7",
      string: "string",
      number: 23,
      bool:   true
    };
    json8 = {
      guid: "retrieveGUID8",
      string: "string",
      number: 23,
      bool:   true
    };
    
    storeKey1 = hub.Store.generateStoreKey();
    store.writeDataHash(storeKey1, json1, hub.Record.EMPTY);
    storeKey2 = hub.Store.generateStoreKey();
    store.writeDataHash(storeKey2, json2, hub.Record.ERROR);
    storeKey3 = hub.Store.generateStoreKey();
    store.writeDataHash(storeKey3, json3, hub.Record.DESTROYED_CLEAN);
    storeKey4 = hub.Store.generateStoreKey();
    store.writeDataHash(storeKey4, json4, hub.Record.BUSY_DESTROYING);
    storeKey5 = hub.Store.generateStoreKey();
    store.writeDataHash(storeKey5, json5, hub.Record.BUSY_CREATING);
    storeKey6 = hub.Store.generateStoreKey();
    store.writeDataHash(storeKey6, json6, hub.Record.BUSY_COMMITTING);
    storeKey7 = hub.Store.generateStoreKey();
    store.writeDataHash(storeKey7, json7, hub.Record.DESTROYED_DIRTY);
    storeKey8 = hub.Store.generateStoreKey();
    store.writeDataHash(storeKey8, json8, hub.Record.READY_CLEAN);
    }
});
  
function testStates(canLoad) {
  var msg, status;
  
  
  
  store.retrieveRecord(undefined, undefined, storeKey1, true);
  status = store.readStatus( storeKey1);
  if (canLoad) {
    equals(status, hub.Record.BUSY_LOADING, "the status should have changed to BUSY_LOADING");
  } else {
    equals(status, hub.Record.ERROR, "the status should remain empty");
  }
  
  
  store.retrieveRecord(undefined, undefined, storeKey2, true);
  status = store.readStatus( storeKey2);
  if (canLoad) {
    equals(status, hub.Record.BUSY_LOADING, "the status should have changed to BUSY_LOADING");
  } else {
    equals(status, hub.Record.ERROR, "the status should become empty");
  }
  
  store.retrieveRecord(undefined, undefined, storeKey3, true);
  status = store.readStatus( storeKey3);
  if (canLoad) {
    equals(status, hub.Record.BUSY_LOADING, "the status should have changed to BUSY_LOADING");
  } else {
    equals(status, hub.Record.ERROR, "the status should become empty");
  }
  
  try{
    store.retrieveRecord(undefined, undefined, storeKey4, true);
    msg='';
  }catch(error1){
    msg=error1.message;
  }
  equals(msg, hub.Record.BUSY_ERROR.message, "should throw error");

  try{
    store.retrieveRecord(undefined, undefined, storeKey5, true);
    msg='';
  }catch(error2){
    msg=error2.message;
  }
  equals(msg, hub.Record.BUSY_ERROR.message, "should throw error");
  
  try{
    store.retrieveRecord(undefined, undefined, storeKey6, true);
    msg='';
  }catch(error3){
    msg=error3.message;
  }
  equals(msg, hub.Record.BUSY_ERROR.message, "should throw error");

  try{
    store.retrieveRecord(undefined, undefined, storeKey7, true);
    msg='';
  }catch(error4){
    msg=error4.message;
  }
  equals(msg, hub.Record.BAD_STATE_ERROR.message, "should throw error");


  store.retrieveRecord(undefined, undefined, storeKey8, true);
  status = store.readStatus( storeKey8);
  if (canLoad) {
    ok(hub.Record.BUSY_REFRESH | (status & 0x03), "the status changed to BUSY_REFRESH.");
  } else {
    equals(status, hub.Record.READY_CLEAN, "the status should remain ready clean");
  }
  
  
}  

test("Retrieve a record without a data source", function() {
  testStates(false);
});

test("Retrieve a record without a working data source and check for different errors and states", function() {
  // build a fake data source that claims to NOT handle retrieval
  var source = hub.DataSource.create({
    retrieveRecords: function() { return false ; }
  });
  store.set('dataSource', source);

  testStates(false);

});

test("Retrieve a record with working data source and check for different errors and states", function() {
  // build a fake data source that claims to handle retrieval
  var source = hub.DataSource.create({
    retrieveRecords: function() { return true ; }
  });
  store.set('dataSource', source);

  testStates(true);

});
