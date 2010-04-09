#!/bin/sh

#
# Does a *development* build of hub.js (including comments, assertions, 
# development code, etc.). Puts the result in hub.js.
cd src
cat ../BUILD | grep "^[A-Za-z0-9_/]*.js$"  | grep -v "^development[/]" | xargs -n 1 -P 1 node ../lib/strip_assertions.js > ../hub-production.js
cd ..
# for whatever reason, the pipe isn't fully flushed when the java command runs, resulting in an error
sleep 3
java -jar tools/yuicompressor-2.4.2/build/yuicompressor-2.4.2.jar -o hub.min.js hub-production.js
rm hub-production.js
