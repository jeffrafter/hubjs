// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*global window GLOBAL exports require Spin hub process */

var sys = require("sys"), fs = require("fs");
var argv = process.ARGV;

sys.print(argv[2] + ' ');

/* Prepare Tester */
var hub = require("../../hub");

// some basic functions (the definition of Spin, etc.)
var Spin = require("./src/core").Spin; 

GLOBAL.hub = hub;
GLOBAL.Spin = Spin;
GLOBAL.stdout = process.stdout ;

// load array test suites (they weren't packaged on their own)
Spin.ArraySuite = require("./src/array_suites").ArraySuite;

// run code
fs.readFile(argv[2], function(err, data){
  if (err) throw err;
  process.compile(data, argv[2]);
});

Spin.defaultPlan().run();

return 0;