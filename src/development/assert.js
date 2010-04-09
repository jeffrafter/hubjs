// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================

// NOTE: All calls to these functions are stripped from production builds.

var hub_assert = function(test, msg) {
  if (!test) throw ("HUB_ASSERT: " + msg) ;
};

var hub_precondition = function(test, msg) {
  if (!test) throw ("HUB_PRECONDITION: " + msg) ;
};

var hub_postcondition = function(test, msg) {
  if (!test) throw ("HUB_POSTCONDITION: " + msg) ;
};
var hub_invariant = function(test, msg) {
  if (!test) throw ("HUB_INVARIANT: " + msg) ;
};

var hub_error = function(msg) {
  // Raise unconditionally.
  throw "HUB_ERROR: " + msg ;
};
