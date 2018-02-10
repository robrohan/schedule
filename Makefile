
build:
	npm run build
	cp -R static dist/static
	cp index.html dist/index.html

publish:
	./publish.sh

clean:
	rm -rf dist

test:
	npm run test

start:
	npm run start

doco:
	dot -T png -O doc/core.dot

release: clean remove_mac_files test build publish

remove_mac_files:
	find ./ -name ".DS_Store" -exec rm {} \;

testfull:
	npm run test:full
