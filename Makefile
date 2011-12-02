all:
	./tools/build.sh

test:
	./node_modules/.bin/mocha --reporter spec

.PHONY: test
