// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================

var NUM_CORES = 1,
    sys = require("sys"),
    fs = require("fs"),
    child_process = require("child_process"),
    async = (process.ARGV.indexOf("async") > 0) ? true : false,
    running_count = 0,
    started = new Date().getTime(),
    _queue = [] ;

function queue(what) {
  _queue.push(what) ;
  process_queue() ;
}

function process_queue() {
  while (running_count < NUM_CORES && _queue.length > 0) run_next_test();
  if (running_count == 0 && _queue.length == 0) {
    sys.puts("\nDone in " + (new Date().getTime() - started) / 1000 + " seconds");
  }
}

function run_next_test() {
  var entry = _queue.shift() ;
  running_count ++ ;
  
  var node = child_process.spawn("node", ["testing/run_test.js", entry]) ;
  node.stdout.addListener("data", function (data) {
    sys.print(data) ;
  });
  node.addListener("exit", function(code) {
    sys.print("\n") ;
    running_count-- ;
    process_queue() ;
  });
}

function processDirectory(path) {
  fs.readdir(path, function(err, files) {
    for (var i = 0; i < files.length; i++) {
      var item = path + "/" + files[i];
      if (item.length > 3 && item.substr(item.length - 3) == ".js") {
        queue(item);
      }
      
      fs.stat(item, function(path) {
        return function(err, stats) {
          if (stats.isDirectory()) processDirectory(path) ;
        }
      }(item)); 
      
    }
  });
};

sys.puts("Starting unit tests:") ;
processDirectory("tests") ;