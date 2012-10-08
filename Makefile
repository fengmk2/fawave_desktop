TESTS = test/*.js
REPORTER = spec
TIMEOUT = 10000
NW_DIR = $HOME/apps/nw

test:
	@NODE_ENV=test ./node_modules/mocha/bin/mocha \
		--reporter $(REPORTER) \
		--timeout $(TIMEOUT) \
		$(TESTS)

test-cov:
	@rm -rf ./lib-cov
	@$(MAKE) lib-cov
	@FAWAVE_DESKTOP_COV=1 $(MAKE) test REPORTER=html-cov > coverage.html

lib-cov:
	@jscoverage lib $@

build-nw:
	zip -r ../${PWD##*/}.nw *

build-win32:
	unzip 

dev:
	/Applications/nw.app/Contents/MacOS/node-webkit ./ --developer

.PHONY: test-cov test dev
