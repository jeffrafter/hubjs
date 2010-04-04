// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*global window GLOBAL exports require CoreTest hub process */

var sys = require("sys"), posix=require("posix");
var argv = process.ARGV;

sys.puts(argv[2]);

/* Prepare Tester */
// mix in globals
process.mixin(GLOBAL, {
  hub: require("../index")
});

// turn of .log (comment to get ALL test results)
console.log = function() {  };

// some basic functions (the definition of CoreTest, etc.)
var CoreTestGlobal = require("./src/coretest"); // has one export: CoreTest itself.
process.mixin(GLOBAL, CoreTestGlobal);

// load array test suites (they weren't packaged on their own)
hub.ArraySuite = require("./src/array_suites").ArraySuite;

// run code
posix.cat(argv[2]).addCallback(function(contents){
  process.compile(contents, argv[2]);
}).wait();

CoreTest.Runner.begin();

return 0;