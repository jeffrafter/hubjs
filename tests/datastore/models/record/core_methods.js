// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

var MyApp, dataSource;
module("hub.Record core methods", {
  setup: function() {
    dataSource = hub.DataSource.create({ 
      
      gotParams: false,
      wasCommitted: false,
      
      createRecord: function(store, storeKey, params) {
        this.wasCommitted = true;
        this.gotParams = params && params['param1'] ? true: false;
      }});
    
    MyApp = hub.Object.create({
      store: hub.Store.create().from(dataSource)
    })  ;
  
    MyApp.Foo = hub.Record.extend({});
    MyApp.json = { 
      foo: "bar", 
      number: 123,
      bool: true,
      array: [1,2,3],
      guid: 1
    };
    
    hub.RunLoop.begin();
    MyApp.foo = MyApp.store.createRecord(MyApp.Foo, MyApp.json);
    hub.RunLoop.end();
    
  }
});

test("statusString", function() {
  equals(MyApp.foo.statusString(), 'READY_NEW', 'status string should be READY_NEW');
});

test("Can commitRecord() specific hub.Record instance", function() {
  
  MyApp.foo.set('foo', 'foobar');
  
  // commit the new record
  MyApp.foo.commitRecord({ param1: 'value1' });
  
  equals(dataSource.wasCommitted, true, 'Record was committed');
  equals(dataSource.gotParams, true, 'Params were properly passed through commitRecord');
  
});
