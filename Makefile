SRC = src/twig.header.js src/twig.core.js src/twig.fills.js src/twig.lib.js src/twig.logic.js src/twig.expression.js src/twig.expression.operator.js src/twig.filters.js src/twig.functions.js src/twig.tests.js src/twig.exports.js src/twig.compiler.js src/twig.module.js

TESTS = test/*.js
TESTSEXT = test-ext/*.js
REPORTER = spec

UGLIFY = ./node_modules/uglify-js/bin/uglifyjs
DOCCO = ./node_modules/docco/bin/docco
MOCHA = ./node_modules/mocha/bin/mocha

all: twig.js twig.min.js

test:
	@NODE_ENV=test $(MOCHA) \
		--require should \
		--reporter $(REPORTER) \
		--timeout 100 \
		--growl \
		$(TESTS)

twig.php:
	./test-ext/checkout.sh

testphp: twig.php
	@NODE_ENV=test $(MOCHA) \
		--require should \
		--reporter $(REPORTER) \
		--timeout 100 \
		--growl \
		$(TESTSEXT)

twig.js: $(SRC)
	cat $^ > $@
	cp $@ demos/node_express/public/vendor/
	cp $@ demos/twitter_backbone/vendor/

twig.min.js: twig.js
	$(UGLIFY) \
		--source-map $@.map \
		--comments "@license" \
		$< > $@

docs: test-docs annotated-docs

test-docs:
	@NODE_ENV=test $(MOCHA) \
		--require should \
		--reporter markdown \
		--timeout 100 \
		--growl \
		$(TESTS) > docs/tests.md

annotated-docs: $(SRC)
	$(DOCCO) twig.js

clean:
	rm -f twig.min.js twig.js

.PHONY: test text-ext docs test-docs clean
