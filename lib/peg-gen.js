var peg = require('./peg') ;
var sys = require('sys') ;
var posix = require('posix') ;

posix.cat("./ECMAScript_jsdoc.peg").addCallback(function (grammar) {
  var parser = peg.generateParser(grammar) ;
  sys.puts(parser) ;
});
