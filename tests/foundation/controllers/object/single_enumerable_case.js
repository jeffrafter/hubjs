// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

var src, content, controller;

// ..........................................................
// SINGLE OBSERVABLE OBJECT IN SET
// 

module("hub.ObjectController - single_enumerable_case - OBSERVABLE OBJECT", {
  setup: function() {
    src        = hub.Object.create({ foo: "foo1", bar: "bar1" });
    content    = hub.Set.create().add(src); // use generic enumerable
    controller = hub.ObjectController.create({ 
      content: content,
      allowsMultipleContent: false 
    });
  },
  
  teardown: function() {
    controller.destroy();
  }
});

test("getting any unknown value should pass through to object", function() {
  equals(controller.get("foo"), "foo1", 'controller.get(foo)');
  equals(controller.get("bar"), "bar1", 'controller.get(bar)');
});

test("setting any unknown value should pass through", function() {
  equals(controller.set("foo", "EDIT"), controller, 'controller.set(foo, EDIT) should return self');  
  equals(controller.set("bar", "EDIT"), controller, 'controller.set(bar, EDIT) should return self');
  equals(controller.set("baz", "EDIT"), controller, 'controller.set(baz, EDIT) should return self');
  
  equals(src.get("foo"), "EDIT", 'src.get(foo)');
  equals(src.get("bar"), "EDIT", 'src.get(bar)');
  equals(src.get("baz"), "EDIT", 'src.get(bar)');
});

test("changing a property on the content", function() {
  var callCount = 0;
  controller.addObserver("foo", function() { callCount++; });

  equals(controller.get("foo"), "foo1", "controller.get(foo) before edit should have original value");

  src.set("foo", "EDIT");
  equals(controller.get("foo"), "EDIT", "controller.get(foo) after edit should have updated value");
  equals(callCount, 1, 'observer on controller should have fired');
});

test("changing the content from one to another", function() {
  var callCount = 0 ;
  var src2 = hub.Object.create({ foo: "foo2", bar: "bar2" });
  var content2 = [src2]; // use another type of enumerable
  controller.addObserver("foo", function() { callCount++; });

  equals(controller.get("foo"), "foo1", "controller.get(foo) before edit should have original value");

  controller.set("content", content2);

  equals(controller.get("foo"), "foo2", "controller.get(foo) after content should contain new content");
  equals(callCount, 1, 'observer on controller should have fired');

  callCount = 0 ;
  src2.set("foo", "EDIT");
  equals(controller.get("foo"), "EDIT", "controller.get(foo) after edit should have updated value");
  equals(callCount, 1, 'observer on controller should have fired');
  
  callCount = 0;
  content.set("foo", "BAR");
  equals(controller.get("foo"), "EDIT", "controller.get(foo) after edit of non-content object should not change value");
  equals(callCount, 0, 'observer on controller should NOT have fired');
});

test("hasContent", function() {
  equals(controller.get("hasContent"), true, 'should have content');
  
  var callCount = 0;
  controller.addObserver("hasContent", function() { callCount++; });
  
  controller.set("content", null);
  equals(controller.get("hasContent"), false, "hasContent should be false after setting to null");
  ok(callCount > 0, 'hasContent observer should fire when setting to null');
  
  callCount = 0;
  controller.set("content", content);
  equals(controller.get("hasContent"), true, "hasContent should be true after setting back to content");
  ok(callCount > 0, "hasContent observer should fire");
});

// ..........................................................
// SINGLE OBSERVABLE OBJECT WITH ALLOWS MULTIPLE TRUE
// 

module("hub.ObjectController - single_enumerable_case - ALLOWS MULTIPLE", {
  setup: function() {
    src        = hub.Object.create({ foo: "foo1", bar: "bar1" });
    content    = hub.Set.create().add(src); // use generic enumerable
    controller = hub.ObjectController.create({ 
      content: content,
      allowsMultipleContent: true 
    });
  },
  
  teardown: function() {
    controller.destroy();
  }
});

test("getting any unknown value should pass through to object", function() {
  equals(controller.get("foo"), "foo1", 'controller.get(foo)');
  equals(controller.get("bar"), "bar1", 'controller.get(bar)');
});

test("setting any unknown value should pass through", function() {
  equals(controller.set("foo", "EDIT"), controller, 'controller.set(foo, EDIT) should return self');  
  equals(controller.set("bar", "EDIT"), controller, 'controller.set(bar, EDIT) should return self');
  equals(controller.set("baz", "EDIT"), controller, 'controller.set(baz, EDIT) should return self');
  
  equals(src.get("foo"), "EDIT", 'src.get(foo)');
  equals(src.get("bar"), "EDIT", 'src.get(bar)');
  equals(src.get("baz"), "EDIT", 'src.get(bar)');
});

test("changing a property on the content", function() {
  var callCount = 0;
  controller.addObserver("foo", function() { callCount++; });

  equals(controller.get("foo"), "foo1", "controller.get(foo) before edit should have original value");

  src.set("foo", "EDIT");
  equals(controller.get("foo"), "EDIT", "controller.get(foo) after edit should have updated value");
  equals(callCount, 1, 'observer on controller should have fired');
});

test("changing the content from one to another", function() {
  var callCount = 0 ;
  var src2 = hub.Object.create({ foo: "foo2", bar: "bar2" });
  var content2 = [src2]; // use another type of enumerable
  controller.addObserver("foo", function() { callCount++; });

  equals(controller.get("foo"), "foo1", "controller.get(foo) before edit should have original value");

  controller.set("content", content2);

  equals(controller.get("foo"), "foo2", "controller.get(foo) after content should contain new content");
  equals(callCount, 1, 'observer on controller should have fired');

  callCount = 0 ;
  src2.set("foo", "EDIT");
  equals(controller.get("foo"), "EDIT", "controller.get(foo) after edit should have updated value");
  equals(callCount, 1, 'observer on controller should have fired');
  
  callCount = 0;
  content.set("foo", "BAR");
  equals(controller.get("foo"), "EDIT", "controller.get(foo) after edit of non-content object should not change value");
  equals(callCount, 0, 'observer on controller should NOT have fired');
});

test("hasContent", function() {
  equals(controller.get("hasContent"), true, 'should have content');
  
  var callCount = 0;
  controller.addObserver("hasContent", function() { callCount++; });
  
  controller.set("content", null);
  equals(controller.get("hasContent"), false, "hasContent should be false after setting to null");
  ok(callCount > 0, 'hasContent observer should fire when setting to null');
  
  callCount = 0;
  controller.set("content", content);
  equals(controller.get("hasContent"), true, "hasContent should be true after setting back to content");
  ok(callCount > 0, "hasContent observer should fire");
});
