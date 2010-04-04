// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

module("hub.SelectionSet.copy");

test("basic copy", function() {
  var content = "1 2 3 4 5 6 7 8 9".w(),
      set     = hub.SelectionSet.create().add(content,4,4).remove(content,6),
      copy    = set.copy();
  
  equals(set.get('length'), 3, 'precond - original set should have length');
  equals(copy.get('length'), 3, 'copy should have same length');
  same(copy, set, 'copy should be the same as original set');
});
