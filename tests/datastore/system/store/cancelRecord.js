// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

var store, storeKey1,storeKey2;
var json1, json2;
var storeKey6, storeKey7;

module("hub.Store#cancelRecord", {
  setup: function() {
    
    store = hub.Store.create();
    
    json1 = {
      id: "cancelGUID1",
      string: "string",
      number: 23,
      bool:   true
    };
    json2 = {
      id: "cancelGUID2",
      string: "string",
      number: 23,
      bool:   true
    };
    
    storeKey1 = hub.Store.generateStoreKey();
    store.writeDataHash(storeKey1, json1, hub.Record.EMPTY);
    storeKey2 = hub.Store.generateStoreKey();
    store.writeDataHash(storeKey2, json2, hub.Record.READY_NEW);
    }
});

test("Check for error state handling and make sure that the method executes.", function() {
  var throwError=false;
  try{
    store.cancelRecord(undefined, undefined, storeKey1);
    throwError=false;
  }catch (error){
    throwError=true;
  }
  ok(throwError, "cancelRecord should throw and error if the record status is EMPTY or ERROR");
  try{
    store.cancelRecord(undefined, undefined, storeKey2);
    throwError=true;    
  } catch (error2){
    throwError=false;
  }
  ok(throwError, " cancelRecord was succesfully executed.");
  
});
