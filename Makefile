all:
	./tools/build.sh

test:
	./node_modules/.bin/mocha --reporter spec --growl

.PHONY: test
