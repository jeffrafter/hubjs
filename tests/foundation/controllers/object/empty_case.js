// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

var content, controller;

// ..........................................................
// NULL ARRAY
// 

module("hub.ObjectController - empty_case - NULL", {
  setup: function() {
    content = null;
    controller = hub.ObjectController.create({ content: content });
  },
  
  teardown: function() {
    controller.destroy();
  }
});

test("getting any value should return undefined", function() {
  equals(controller.get("foo"), undefined, 'controller.get(foo)');
  equals(controller.get("bar"), undefined, 'controller.get(bar)');
});

test("setting any unknown value should have no effect", function() {
  equals(controller.set("foo", "FOO"), controller, 'controller.set(foo, FOO) should return self');  
  equals(controller.set("bar", "BAR"), controller, 'controller.set(bar, BAR) should return self');
  equals(controller.get("foo"), undefined, 'controller.get(foo)');
  equals(controller.get("bar"), undefined, 'controller.get(bar)');
});

test("hasContent", function() {
  equals(controller.get("hasContent"), false, 'hasContent should be false');
});


// ..........................................................
// EMPTY ARRAY
// 

module("hub.ObjectController - empty_case - EMPTY ARRAY", {
  setup: function() {
    content = null;
    controller = hub.ObjectController.create({ content: content });
  },
  
  teardown: function() {
    controller.destroy();
  }
});

test("getting any value should return undefined", function() {
  equals(controller.get("foo"), undefined, 'controller.get(foo)');
  equals(controller.get("bar"), undefined, 'controller.get(bar)');
});

test("setting any unknown value should have no effect", function() {
  equals(controller.set("foo", "FOO"), controller, 'controller.set(foo, FOO) should return self');  
  equals(controller.set("bar", "BAR"), controller, 'controller.set(bar, BAR) should return self');
  equals(controller.get("foo"), undefined, 'controller.get(foo)');
  equals(controller.get("bar"), undefined, 'controller.get(bar)');
});


test("hasContent", function() {
  equals(controller.get("hasContent"), false, 'hasContent should be false');
});

test("allowsMultipleContent should have no effect", function() {
  controller = hub.ObjectController.create({ 
    content: content,
    allowsMultipleContent: true
  });
  
  equals(controller.get("length"), undefined, "controller.get(length)");
  equals(controller.get('hasContent'), false, 'controller.hasContent');
});
