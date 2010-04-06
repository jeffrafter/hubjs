// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*global window GLOBAL exports require CoreTest hub process */

var sys = require("sys"), fs = require("fs");
var argv = process.ARGV;

sys.puts(argv[2]);

/* Prepare Tester */
var hub = require("../src/bootstrap");

// some basic functions (the definition of CoreTest, etc.)
var CoreTest = require("./src/coretest").CoreTest; 

GLOBAL.hub = hub;
GLOBAL.CoreTest = CoreTest;

// We need to load the core at some point so we have something to test
require("../src/core");

// turn of .log (comment to get ALL test results)
console.log = function() {  };

// load array test suites (they weren't packaged on their own)
hub.ArraySuite = require("./src/array_suites").ArraySuite;

// run code
fs.readFile(argv[2], function(err, data){
  if (err) throw err;
  process.compile(data, argv[2]);
});

var runner = CoreTest.Runner.create();
runner.begin();

return 0;