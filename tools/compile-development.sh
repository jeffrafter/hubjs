#!/bin/sh
cd src
cat ../BUILD | grep "[A-Za-z0-9_/]*.js$" | xargs cat > ../hub.js 
cd ..
