SRC = src/twig.core.js src/twig.fills.js src/twig.lib.js src/twig.logic.js src/twig.expression.js src/twig.expression.operator.js src/twig.filters.js src/twig.functions.js src/twig.tests.js src/twig.exports.js src/twig.module.js

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

twig.min.js: twig.js
	./node_modules/.bin/uglifyjs --no-mangle $< > $@

docs: test-docs annotated-docs

test-docs:
	make test REPORTER=doc > docs/test.html

annotated-docs:
	node_modules/.bin/docco $< 
    
clean:
	rm -f twig{,.min}.js

.PHONY: test docs test-docs clean