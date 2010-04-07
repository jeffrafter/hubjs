#!/bin/sh
cd src
cat ../BUILD | grep "[A-Za-z0-9_/]*.js$" | xargs cat | java -jar ../java/yuicompressor-2.4.2/build/yuicompressor-2.4.2.jar --type js -o ../hub.js 
cd ..
