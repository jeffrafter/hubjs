all: clean
	tools/compile-development.sh

release: clean-release
	tools/compile-production.sh

test: all
	node testing/run_test.js

clean:
	rm -f hub.js

clean-release:
	rm -f hub.min.js

.PHONY: all release test clean clean-release
