// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

var store, storeKey, json;
var json1, json2, json3, json4, json5, json6, json7, json8, json9, json10, 
    json11, json12, json13, json14, json15, json16 ;
var storeKey1, storeKey2, storeKey3, storeKey4, storeKey5, storeKey6, 
    storeKey7, storeKey8, storeKey9, storeKey10, storeKey11, storeKey12, 
    storeKey13, storeKey14, storeKey15, storeKey16 ;

module("hub.Store#dataSourceCallbacks", {
  setup: function() {
    
    store = hub.Store.create();
    
    json1 = {
      id: "commitGUID1",
      string: "string",
      number: 23,
      bool:   true
    };
    json2 = {
      id: "commitGUID2",
      string: "string",
      number: 23,
      bool:   true
    };
    json3 = {
      id: "commitGUID3",
      string: "string",
      number: 23,
      bool:   true
    };
    json4 = {
      id: "commitGUID4",
      string: "string",
      number: 23,
      bool:   true
    };
    json5 = {
      id: "commitGUID5",
      string: "string",
      number: 23,
      bool:   true
    };
    json6 = {
      id: "commitGUID6",
      string: "string",
      number: 23,
      bool:   true
    };
    json7 = {
      id: "commitGUID7",
      string: "string",
      number: 23,
      bool:   true
    };
    json8 = {
      id: "commitGUID8",
      string: "string",
      number: 23,
      bool:   true
    };
    json9 = {
      id: "commitGUID9",
      string: "string",
      number: 23,
      bool:   true
    };
    json10 = {
      id: "commitGUID10",
      string: "string",
      number: 23,
      bool:   true
    };
    json11 = {
      id: "commitGUID11",
      string: "string",
      number: 23,
      bool:   true
    };
    json12 = {
      id: "commitGUID12",
      string: "string",
      number: 23,
      bool:   true
    };
    json13 = {
      id: "commitGUID13",
      string: "string",
      number: 23,
      bool:   true
    };
    json14 = {
      id: "commitGUID14",
      string: "string",
      number: 23,
      bool:   true
    };
    json15 = {
      id: "commitGUID15",
      string: "string",
      number: 23,
      bool:   true
    };
    json16 = {
      id: "commitGUID16",
      string: "string",
      number: 23,
      bool:   true
    };
    storeKey1 = hub.Store.generateStoreKey();
    store.writeDataHash(storeKey1, json1, hub.Record.READY_CLEAN);
    storeKey2 = hub.Store.generateStoreKey();
    store.writeDataHash(storeKey2, json2, hub.Record.BUSY_LOADING);
    storeKey3 = hub.Store.generateStoreKey();
    store.writeDataHash(storeKey3, json3, hub.Record.BUSY_CREATING);
    storeKey4 = hub.Store.generateStoreKey();
    store.writeDataHash(storeKey4, json4, hub.Record.BUSY_COMMITTING);
    storeKey5 = hub.Store.generateStoreKey();
    store.writeDataHash(storeKey5, json5, hub.Record.BUSY_REFRESH_CLEAN);
    storeKey6 = hub.Store.generateStoreKey();
    store.writeDataHash(storeKey6, json6, hub.Record.BUSY_REFRESH_DIRTY);
    storeKey7 = hub.Store.generateStoreKey();
    store.writeDataHash(storeKey7, json7, hub.Record.BUSY_DESTROYING);
    storeKey8 = hub.Store.generateStoreKey();
    store.writeDataHash(storeKey8, json8, hub.Record.BUSY);
  
    storeKey9 = hub.Store.generateStoreKey();
    store.writeDataHash(storeKey9, json9, hub.Record.READY_CLEAN);
    storeKey10 = hub.Store.generateStoreKey();
    store.writeDataHash(storeKey10, json10, hub.Record.BUSY_DESTROYING);
    storeKey11 = hub.Store.generateStoreKey();
    store.writeDataHash(storeKey11, json11, hub.Record.BUSY_CREATING);
  
    storeKey12 = hub.Store.generateStoreKey();
    store.writeDataHash(storeKey12, json12, hub.Record.READY_CLEAN);
    storeKey13 = hub.Store.generateStoreKey();
    store.writeDataHash(storeKey13, json13, hub.Record.BUSY_CREATING);
  
    storeKey14 = hub.Store.generateStoreKey();
    store.writeDataHash(storeKey14, json14, hub.Record.READY_CLEAN);
    storeKey15 = hub.Store.generateStoreKey();
    store.writeDataHash(storeKey15, json15, hub.Record.BUSY_CREATING);

    storeKey16 = hub.Store.generateStoreKey();
    store.writeDataHash(storeKey16, json16, hub.Record.BUSY_LOADING);
  
    
  
  },
  
  teardown: function() {
    
  }
});

test("Confirm that dataSourceDidCancel switched the records to the right states", function() {
  var msg='', status;
  try{
    store.dataSourceDidCancel(storeKey1);
    msg='';  
  }catch(error){
    msg=error.message;
  }
  equals(hub.Record.BAD_STATE_ERROR.message, msg, 
    "should throw the following error ");
  
  store.dataSourceDidCancel(storeKey2);
  status = store.readStatus( storeKey2);
  equals(status, hub.Record.EMPTY, "the status should have changed to EMPTY");
  
  store.dataSourceDidCancel(storeKey3);
  status = store.readStatus( storeKey3);
  equals(status, hub.Record.READY_NEW, "the status should have changed to READY_NEW");
  
  store.dataSourceDidCancel(storeKey4);
  status = store.readStatus( storeKey4);
  equals(status, hub.Record.READY_DIRTY, "the status should have changed to READY_DIRTY");
  
  store.dataSourceDidCancel(storeKey5);
  status = store.readStatus( storeKey5);
  equals(status, hub.Record.READY_CLEAN, "the status should have changed to READY_CLEAN");
  
  store.dataSourceDidCancel(storeKey6);
  status = store.readStatus( storeKey6);
  equals(status, hub.Record.READY_DIRTY, "the status should have changed to READY_DIRTY");
  
  store.dataSourceDidCancel(storeKey7);
  status = store.readStatus( storeKey7);
  equals(status, hub.Record.DESTROYED_DIRTY, "the status should have changed to DESTROYED_DIRTY");
  
  try{
    store.dataSourceDidCancel(storeKey8);  
    msg='';
  }catch(error2){
    msg=error2.message;
  }
  equals(hub.Record.BAD_STATE_ERROR.message, msg, 
    "should throw the following error ");
  
});


test("Confirm that dataSourceDidComplete switched the records to the right states", function() {
  var msg='', status;
  try{
    store.dataSourceDidComplete(storeKey9);
    msg='';  
  }catch(error){
    msg=error.message;
  }
  equals(hub.Record.BAD_STATE_ERROR.message, msg, 
    "should throw the following error ");

  try{
    store.dataSourceDidComplete(storeKey10);  
    msg='';
  }catch(error2){
    msg=error2.message;
  }
  equals(hub.Record.BAD_STATE_ERROR.message, msg, 
    "should throw the following error ");
  
  store.dataSourceDidComplete(storeKey11);
  status = store.readStatus( storeKey11);
  equals(status, hub.Record.READY_CLEAN, "the status should have changed to READY_CLEAN.");
  
});


test("Confirm that dataSourceDidDestroy switched the records to the right states", function() {
  var msg='', status;
  try{
    store.dataSourceDidDestroy(storeKey12);  
    msg='';
  }catch(error){
    msg=error.message;
  }  
  equals(hub.Record.BAD_STATE_ERROR.message, msg, 
    "should throw the following error ");
  
  store.dataSourceDidDestroy(storeKey13);
  status = store.readStatus( storeKey13);
  equals(status, hub.Record.DESTROYED_CLEAN, "the status should have changed to DESTROYED_CLEAN.");
  
});


test("Confirm that dataSourceDidError switched the records to the right states", function() {
  var msg='', status;
  try{
    store.dataSourceDidError(storeKey14, hub.Record.BAD_STATE_ERROR);  
    msg='';
  }catch(error){
    msg = error.message;
  }
  equals(hub.Record.BAD_STATE_ERROR.message, msg, 
    "should throw the following error ");

  store.dataSourceDidError(storeKey15, hub.Record.BAD_STATE_ERROR);
  status = store.readStatus( storeKey15);
  equals(status, hub.Record.ERROR, 
    "the status shouldn't have changed.");
});

test("Confirm that errors passed to dataSourceDidError make it into the recordErrors array", function() {
  var msg = '';

  ok(!store.recordErrors, "recordErrors should be null at this point");

  try {
    store.dataSourceDidError(storeKey16, hub.Record.GENERIC_ERROR);
  } catch (error) {
    msg = error.message;
  }
 
  equals(store.recordErrors[storeKey16], hub.Record.GENERIC_ERROR,
    "recordErrors[storeKey] should be the right error object");
});
