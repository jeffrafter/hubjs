// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

module("hub.Store#init");

test("initial setup for root store", function() {
  var store = hub.Store.create();
  
  equals(hub.typeOf(store.dataHashes), hub.T_HASH, 'should have dataHashes');
  equals(hub.typeOf(store.revisions), hub.T_HASH, 'should have revisions');
  equals(hub.typeOf(store.statuses), hub.T_HASH, 'should have statuses');
  ok(!store.editables, 'should not have editables');
  ok(!store.recordErrors, 'should not have recordErrors');
  ok(!store.queryErrors, 'should not have queryErrors');
});
