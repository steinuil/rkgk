.PHONY: dist/bundle.js
dist/bundle.js: dist
	yarn run browserify -- \
		--entry   src/main.tsx \
		--outfile $(.TARGET) \
		--plugin  tsify

dist:
	mkdir dist
