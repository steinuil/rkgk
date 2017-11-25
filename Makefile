.PHONY: dist/bundle.js
dist/bundle.js: dist
	yarn run browserify \
		--entry   src/main.tsx \
		--outfile dist/bundle.js \
		--plugin  tsify

dist:
	mkdir dist
