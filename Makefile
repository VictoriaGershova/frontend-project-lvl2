install:
	install-deps

install-deps:
	npm ci

build:
	npm run build --if-present

start:
	npx babel-node src/bin/gendiff.js

publish:
	npm publish --dry-run

lint:
	npx eslint .

test:
	npm test

test-coverage:
	npm test -- --coverage
	