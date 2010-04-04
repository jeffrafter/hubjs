// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

var testObject, fromObject, extraObject, TestObject, TestNamespace;

module("bind() method", {
  
  setup: function() {
    testObject = hub.Object.create({
      foo: "bar",
      bar: "foo",
      extraObject: null 
    });
    
    fromObject = hub.Object.create({
      bar: "foo",
      extraObject: null 
    }) ;
    
    extraObject = hub.Object.create({
      foo: "extraObjectValue"
    }) ;
    
    TestNamespace = {
      fromObject: fromObject,
      testObject: testObject
    } ;
  },
  
  teardown: function() { 
    testObject = null ;
    fromObject = null ;
    extraObject = null ;
  //  delete TestNamespace ;
  }
  
});
  
test("bind(TestNamespace.fromObject.bar) should follow absolute path", function() {
  // create binding
  testObject.bind("foo", "TestNamespace.fromObject.bar") ;
  hub.Binding.flushPendingChanges() ; // actually sets up up the binding
  
  // now make a change to see if the binding triggers.
  fromObject.set("bar", "changedValue") ;
  
  // support new-style bindings if available
  hub.Binding.flushPendingChanges();
  equals("changedValue", testObject.get("foo"), "testObject.foo");
});
  
test("bind(.bar) should bind to relative path", function() {
  // create binding
  testObject.bind("foo", ".bar") ;
  hub.Binding.flushPendingChanges() ; // actually sets up up the binding
  
  // now make a change to see if the binding triggers.
  testObject.set("bar", "changedValue") ;
  
  hub.Binding.flushPendingChanges();
  equals("changedValue", testObject.get("foo"), "testObject.foo");
});

test("hub.Binding.bool(TestNamespace.fromObject.bar)) should create binding with bool transform", function() {
  // create binding
  testObject.bind("foo", hub.Binding.bool("TestNamespace.fromObject.bar")) ;
  hub.Binding.flushPendingChanges() ; // actually sets up up the binding
  
  // now make a change to see if the binding triggers.
  fromObject.set("bar", 1) ;
  
  hub.Binding.flushPendingChanges();
  equals(true, testObject.get("foo"), "testObject.foo is true");
  
  fromObject.set("bar", 0) ;
  
  hub.Binding.flushPendingChanges();
  equals(false, testObject.get("foo"), "testObject.foo is false");
});

test("bind(TestNamespace.fromObject*extraObject.foo) should create chained binding", function() {
  testObject.bind("foo", "TestNamespace.fromObject*extraObject.foo");
  hub.Binding.flushPendingChanges() ; // actually sets up up the binding
  
  fromObject.set("extraObject", extraObject) ;
  
  hub.Binding.flushPendingChanges();
  equals("extraObjectValue", testObject.get("foo"), "testObject.foo") ;
});

test("bind(*extraObject.foo) should create locally chained binding", function() {
  testObject.bind("foo", "*extraObject.foo");
  hub.Binding.flushPendingChanges() ; // actually sets up up the binding
  
  testObject.set("extraObject", extraObject) ;
  
  hub.Binding.flushPendingChanges();
  equals("extraObjectValue", testObject.get("foo"), "testObject.foo") ;
});


module("fooBinding method", {
  
  setup: function() {
    TestObject = hub.Object.extend({
      foo: "bar",
      bar: "foo",
      extraObject: null 
    });
    
    fromObject = hub.Object.create({
      bar: "foo",
      extraObject: null 
    }) ;
    
    extraObject = hub.Object.create({
      foo: "extraObjectValue"
    }) ;
        
    TestNamespace = {
      fromObject: fromObject,
      testObject: TestObject
    } ;
  },
  
  teardown: function() { 
    TestObject = null ;
    fromObject = null ;
    extraObject = null ;
  //  delete TestNamespace ;
  }
  
});

test("fooBinding: TestNamespace.fromObject.bar should follow absolute path", function() {
  // create binding
  testObject = TestObject.create({
    fooBinding: "TestNamespace.fromObject.bar"
  }) ;
  hub.Binding.flushPendingChanges() ; // actually sets up up the binding
  
  // now make a change to see if the binding triggers.
  fromObject.set("bar", "changedValue") ;
  
  hub.Binding.flushPendingChanges();
  equals("changedValue", testObject.get("foo"), "testObject.foo");
});

test("fooBinding: .bar should bind to relative path", function() {
  
  testObject = TestObject.create({
    fooBinding: ".bar"
  }) ;
  hub.Binding.flushPendingChanges() ; // actually sets up up the binding
  
  // now make a change to see if the binding triggers.
  testObject.set("bar", "changedValue") ;
  
  hub.Binding.flushPendingChanges();
  equals("changedValue", testObject.get("foo"), "testObject.foo");
});

test("fooBinding: hub.Binding.bool(TestNamespace.fromObject.bar should create binding with bool transform", function() {
  
  testObject = TestObject.create({
    fooBinding: hub.Binding.bool("TestNamespace.fromObject.bar") 
  }) ;
  hub.Binding.flushPendingChanges() ; // actually sets up up the binding
  
  // now make a change to see if the binding triggers.
  fromObject.set("bar", 1) ;
  
  hub.Binding.flushPendingChanges();
  equals(true, testObject.get("foo"), "testObject.foo is true");
  
  fromObject.set("bar", 0) ;
  
  hub.Binding.flushPendingChanges();
  equals(false, testObject.get("foo"), "testObject.foo is false");
});

test("fooBinding: TestNamespace.fromObject*extraObject.foo should create chained binding", function() {
  
  testObject = TestObject.create({
    fooBinding: "TestNamespace.fromObject*extraObject.foo" 
  }) ;
  hub.Binding.flushPendingChanges() ; // actually sets up up the binding
  
  fromObject.set("extraObject", extraObject) ;
  
  hub.Binding.flushPendingChanges();
  equals("extraObjectValue", testObject.get("foo"), "testObject.foo") ;
});

test("fooBinding: *extraObject.foo should create locally chained binding", function() {
  
  testObject = TestObject.create({
    fooBinding: "*extraObject.foo" 
  }) ;
  hub.Binding.flushPendingChanges() ; // actually sets up up the binding
  
  testObject.set("extraObject", extraObject) ;
  
  hub.Binding.flushPendingChanges();
  equals("extraObjectValue", testObject.get("foo"), "testObject.foo") ;
});

module("fooBindingDefault: hub.Binding.Bool (old style)", {
  
  setup: function() {
    TestObject = hub.Object.extend({
      foo: "bar",
      fooBindingDefault: hub.Binding.bool(),
      bar: "foo",
      extraObject: null 
    });
    
    fromObject = hub.Object.create({
      bar: "foo",
      extraObject: null 
    }) ;
    
    TestNamespace = {
      fromObject: fromObject,
      testObject: TestObject
    } ;
  },
  
  teardown: function() { 
   TestObject = null ;
   fromObject = null ;
 //   delete TestNamespace ;
  }
  
});

test("fooBinding: TestNamespace.fromObject.bar should have bool binding", function() {
  // create binding
  testObject = TestObject.create({
    fooBinding: "TestNamespace.fromObject.bar"
  }) ;
  hub.Binding.flushPendingChanges() ; // actually sets up up the binding
  
  // now make a change to see if the binding triggers.
  fromObject.set("bar", 1) ;
  
  hub.Binding.flushPendingChanges();
  equals(true, testObject.get("foo"), "testObject.foo is true");
  
  fromObject.set("bar", 0) ;
  
  hub.Binding.flushPendingChanges();
  equals(false, testObject.get("foo"), "testObject.foo is false");
});

test("fooBinding: hub.Binding.not(TestNamespace.fromObject.bar should override default", function() {
  
  testObject = TestObject.create({
    fooBinding: hub.Binding.not("TestNamespace.fromObject.bar") 
  }) ;
  hub.Binding.flushPendingChanges() ; // actually sets up up the binding
  
  // now make a change to see if the binding triggers.
  fromObject.set("bar", 1) ;
  
  hub.Binding.flushPendingChanges();
  equals(false, testObject.get("foo"), "testObject.foo is false");
  
  fromObject.set("bar", 0) ;
  
  hub.Binding.flushPendingChanges();
  equals(true, testObject.get("foo"), "testObject.foo is true");
});

module("fooBindingDefault: hub.Binding.bool() (new style)", {
  
  setup: function() {
    TestObject = hub.Object.extend({
      foo: "bar",
      fooBindingDefault: hub.Binding.bool(),
      bar: "foo",
      extraObject: null 
    });
    
    fromObject = hub.Object.create({
      bar: "foo",
      extraObject: null 
    }) ;
    
    TestNamespace = {
      fromObject: fromObject,
      testObject: testObject
    } ;
  },
  
  teardown: function() { 
    TestObject = null ;
    fromObject = null ;
   // delete TestNamespace ;
  }
  
});

test("fooBinding: TestNamespace.fromObject.bar should have bool binding", function() {
  // create binding
  testObject = TestObject.create({
    fooBinding: "TestNamespace.fromObject.bar"
  }) ;
  hub.Binding.flushPendingChanges() ; // actually sets up up the binding
  
  // now make a change to see if the binding triggers.
  fromObject.set("bar", 1) ;
  
  hub.Binding.flushPendingChanges();
  equals(true, testObject.get("foo"), "testObject.foo is true");
  
  fromObject.set("bar", 0) ;
  
  hub.Binding.flushPendingChanges();
  equals(false, testObject.get("foo"), "testObject.foo is false");
});

test("fooBinding: hub.Binding.not(TestNamespace.fromObject.bar should override default", function() {
  
  testObject = TestObject.create({
    fooBinding: hub.Binding.not("TestNamespace.fromObject.bar") 
  }) ;
  hub.Binding.flushPendingChanges() ; // actually sets up up the binding
  
  // now make a change to see if the binding triggers.
  fromObject.set("bar", 1) ;
  
  hub.Binding.flushPendingChanges();
  equals(false, testObject.get("foo"), "testObject.foo is false");
  
  fromObject.set("bar", 0) ;
  
  hub.Binding.flushPendingChanges();
  equals(true, testObject.get("foo"), "testObject.foo is true");
});
