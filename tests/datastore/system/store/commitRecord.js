// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

var store, storeKey1, storeKey2, storeKey3, storeKey4, storeKey5, storeKey6;
var storeKey7, json, json1, json2, json3, json4, json5, json6, json7;
var ds ;

module("hub.Store#commitRecord", {
  setup: function() {

    ds = hub.DataSource.create({
      
      callCount: 0,
      
      commitRecords: function(store, toCreate, toUpdate, toDestroy, params) {
        this.toCreate = toCreate;
        this.toUpdate = toUpdate;
        this.toDestroy = toDestroy;
        this.params = params;
        this.callCount++;
      },
      
      reset: function() {
        this.toCreate = this.toUpdate = this.toDestroy = this.params = null;
        this.callCount = 0 ;
      },
      
      expect: function(callCount, toCreate, toUpdate, toDestroy, params) {
        if (callCount !== undefined) {
          equals(this.callCount, callCount, 'expect datasource.commitRecords to be called X times');
        }
        
        if (toCreate !== undefined) {
          same(this.toCreate, toCreate, 'expect toCreate to have items');
        }

        if (toUpdate !== undefined) {
          same(this.toUpdate, toUpdate, 'expect toUpdate to have items');
        }
        
        if (toDestroy !== undefined) {
          same(this.toDestroy, toDestroy, 'expect toDestroy to have items');
        }

        if (params !== undefined) {
          same(this.params, params, 'expect params to have items');
        }
      }
      
    });
    
    store = hub.Store.create().from(ds);
    
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
    json5 = {
      guid: "commitGUID5",
      string: "string",
      number: 23,
      bool:   true
    };
    json6 = {
      guid: "commitGUID6",
      string: "string",
      number: 23,
      bool:   true
    };
    json7 = {
      guid: "commitGUID7",
      string: "string",
      number: 23,
      bool:   true
    };
    
    
    storeKey1 = hub.Store.generateStoreKey();
    store.writeDataHash(storeKey1, json1, hub.Record.READY_CLEAN);
    storeKey2 = hub.Store.generateStoreKey();
    store.writeDataHash(storeKey2, json2, hub.Record.READY_NEW);
    storeKey3 = hub.Store.generateStoreKey();
    store.writeDataHash(storeKey3, json3, hub.Record.READY_DIRTY);
    storeKey4 = hub.Store.generateStoreKey();
    store.writeDataHash(storeKey4, json4, hub.Record.DESTROYED_DIRTY);
    storeKey5 = hub.Store.generateStoreKey();
    store.writeDataHash(storeKey5, json5, hub.Record.READY_EMPTY);
    storeKey6 = hub.Store.generateStoreKey();
    store.writeDataHash(storeKey6, json6, hub.Record.READY_ERROR);
    storeKey7 = hub.Store.generateStoreKey();
    store.writeDataHash(storeKey7, json7, hub.Record.READY_DESTROYED_CLEAN);
    
  }
});

test("Confirm that all the states are switched as expected after running commitRecord", function() {
  var throwError=false, msg, status;

  store.commitRecord(undefined, undefined, storeKey1);
  status = store.readStatus( storeKey1);
  equals(status, hub.Record.READY_CLEAN, "the status shouldn't have changed. It should be READY_CLEAN ");
  
  store.commitRecord(undefined, undefined, storeKey2);
  status = store.readStatus( storeKey2);
  equals(status, hub.Record.BUSY_CREATING, "the status should be hub.Record.BUSY_CREATING");

  store.commitRecord(undefined, undefined, storeKey3);
  status = store.readStatus( storeKey3);
  equals(status, hub.Record.BUSY_COMMITTING, "the status should be hub.Record.BUSY_COMMITTING");
  
  store.dataSourceDidComplete(storeKey3);
  status = store.readStatus( storeKey3);
  equals(status, hub.Record.READY_CLEAN, "the status should be hub.Record.READY_CLEAN");
  
  store.commitRecord(undefined, undefined, storeKey4);
  status = store.readStatus( storeKey4);
  equals(status, hub.Record.BUSY_DESTROYING, "the status should be hub.Record.BUSY_DESTROYING");
  
  try {
    store.commitRecord(undefined, undefined, storeKey5);
    throwError=false;
    msg='';
  }catch(error1){
    throwError=true;
    msg=error1.message;
  }
  equals(msg, hub.Record.NOT_FOUND_ERROR.message, "commitRecord should throw the following error");
  
  try{
    store.commitRecord(undefined, undefined, storeKey6);
    throwError=false;
    msg='';
  }catch(error2){
    throwError=true;
    msg=error2.message;
  }
  equals(msg, hub.Record.NOT_FOUND_ERROR.message, "commitRecord should throw the following error");
  
  try{
    store.commitRecord(undefined, undefined, storeKey7);
    throwError=false;
    msg='';
  }catch(error3){
    throwError=true;
    msg=error3.message;
  }
  equals(msg, hub.Record.NOT_FOUND_ERROR.message, "commitRecord should throw the following error");
  
});

test("calling commitRecords() without explicit storeKeys", function() {
  var st;
  store.changelog = [storeKey1, storeKey2, storeKey3, storeKey4];
  store.commitRecords();

  st = store.readStatus( storeKey1);
  equals(st, hub.Record.READY_CLEAN, "storeKey1 - the status shouldn't have changed. It should be READY_CLEAN ");
  
  st = store.readStatus( storeKey2);
  equals(st, hub.Record.BUSY_CREATING, "storeKey2 - the status should be hub.Record.BUSY_CREATING");

  st = store.readStatus( storeKey3);
  equals(st, hub.Record.BUSY_COMMITTING, "storeKey3 - the status should be hub.Record.BUSY_COMMITTING");
  
  st = store.readStatus( storeKey4);
  equals(st, hub.Record.BUSY_DESTROYING, "storeKey4 - the status should be hub.Record.BUSY_DESTROYING");
  
  ds.expect(1, [storeKey2], [storeKey3], [storeKey4]);
});

test("calling commitRecords() with params", function() {
  var p = { foo: "bar" };
  store.commitRecord(null, null, storeKey2, p);
  ds.expect(1, [storeKey2], [], [], p);
  ds.reset();

  // calling commit records with no storeKeys should still invoke if params
  store.commitRecords(null,null,null,p);
  ds.expect(1, [], [], [], p);
  ds.reset();
  
  // call commit records with no storeKeys and no params should not invoke ds
  store.commitRecords(null,null,null,null);
  ds.expect(0);
});
