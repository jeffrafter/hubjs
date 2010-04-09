// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*global window GLOBAL exports require */

/**
  hub.js exports exactly one global: hub.  All hub methods and functions are 
  defined inside of this namespace.  Don't add new properties to this namespace 
  as it could confict with future versions of hub.js.
  
  In addition to the `hub` global, private properties and methods within the 
  hub namespace are prefixed with _hub_ and are reserved for use by hub.js. 
  Private properties and methods are not guaranteed to exist or have the same 
  meaning, signature or types from release to release.
  
  @namespace
*/
var hub ;

// Handle env differences when hub.js is running on node.js vs. in the browser.
if (typeof window === 'undefined') {
  if (typeof exports === 'object') {
    // We're running on node.js.
    hub = exports ;
    hub.isNode = true ;
    hub.root = GLOBAL ;
    var sys = require("sys") ;
    hub.debug = function(type, what) {
      if (typeof what === 'undefined') { what = type; type = 'LOG'; }
      sys.puts(type + ": " + sys.inspect(what)) ;
    };
  } else {
    // We're running on an unknown system.
    throw "hub.js currently requires node.js when run outside the browser" ;
  }
} else {
  // We're running in a web browser.
  hub = {
    isNode: false,
    root: window,
    debug: function(type, what) {
      if (typeof what === 'undefined') { what = type; type = 'LOG'; }
      console.log(type + ": ") ;
      console.log(what) ; // Doing `what` separately prints out the structure.
    }
  };
  
  // Prevent a console.log from blowing things up if we are on a browser that
  // does not support it.
  if (typeof console === 'undefined') {
    window.console = {} ;
    console.log = console.info = console.warn = console.error = function(){};
  }
}
