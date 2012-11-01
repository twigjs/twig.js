SRC = src/twig.core.js src/twig.fills.js src/twig.lib.js src/twig.logic.js src/twig.expression.js src/twig.expression.operator.js src/twig.filters.js src/twig.functions.js src/twig.tests.js src/twig.exports.js src/twig.compiler.js src/twig.module.js

TESTS = test/*.js
REPORTER = spec

all: twig.js twig.min.js

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--require should \
		--reporter $(REPORTER) \
		--timeout 100 \
		--growl \
		$(TESTS)

twig.js: $(SRC)
	cat $^ > $@
	cp $@ demos/node_express/public/vendor/
	cp $@ demos/twitter_backbone/vendor/

twig.min.js: twig.js
	./node_modules/.bin/uglifyjs $< > $@

docs: test-docs annotated-docs

test-docs:
	make test REPORTER=doc > docs/test.html

annotated-docs: $(SRC)
	node_modules/.bin/docco $^ twig.js 
    
clean:
	rm -f twig.min.js twig.js

.PHONY: test docs test-docs clean
