// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

module("hub.ERROR");

test("hub.Error.desc creates an error instance with description,label and code", function() {
  var c = hub.Error.desc('This is an error instance','Error Instance', "FOO", 99999);
  equals(hub.T_ERROR,hub.typeOf(c),'Error instance');
  equals('This is an error instance',c.message,'Description');
  equals('Error Instance',c.label,'Label');
  equals(c.get('errorValue'), "FOO", 'error value should be set');
  equals(99999,c.code,'Code');
});

test("hub.$error creates an error instance with description,label and code",function(){
  var d = hub.$error('This is a new error instance','New Error Instance', "FOO", 99999);
  equals(hub.T_ERROR,hub.typeOf(d),'New Error instance');
  equals('This is a new error instance',d.message,'Description');
  equals('New Error Instance',d.label,'Label');
  equals(d.get('errorValue'), "FOO", 'error value should be set');
  equals(99999,d.code,'Code');
});

test("hub.$ok should return true if the passed value is an error object or false", function() {
  ok(hub.$ok(true), '$ok(true) should be true');
  ok(!hub.$ok(false), '$ok(false) should be false');
  ok(hub.$ok(null), '$ok(null) should be true');
  ok(hub.$ok(undefined), '$ok(undefined) should be true');
  ok(hub.$ok("foo"), '$ok(foo) should be true');
  ok(!hub.$ok(hub.$error("foo")), '$ok(hub.Error) should be false');

  ok(!hub.$ok(new hub.Error()), '$ok(Error) should be false');
  ok(!hub.$ok(hub.Object.create({ isError: true })), '$ok({ isError: true }) should be false');
});

test("hub.$val should return the error value if it has one", function() {
  equals(hub.val(true), true, 'val(true) should be true');
  equals(hub.val(false), false, 'val(false) should be false');
  equals(hub.val(null), null, 'val(null) should be true');
  equals(hub.val(undefined), undefined, '$ok(undefined) should be true');
  equals(hub.val("foo"), "foo", 'val(foo) should be true');
  equals(hub.val(hub.$error("foo", "FOO", "BAZ")), "BAZ", 'val(hub.Error) should be BAZ');
  equals(hub.val(hub.$error("foo", "FOO")), undefined, 'val(hub.Error) should be undefined');
  equals(hub.val(new hub.Error()), null, 'val(Error) should be null');
  equals(hub.val(hub.Object.create({ isError: true, errorValue: "BAR" })), "BAR", 'val({ isError: true, errorValue: BAR }) should be BAR');
});

test("errorObject property should return the error itself", function() {
  var er = hub.$error("foo");
  equals(er.get('errorObject'), er, 'errorObject should return receiver');
});
