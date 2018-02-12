
build:
	npm run build
	cp src/rohan-schedule.html dist/rohan-schedule.html

publish:
	./publish.sh

clean:
	rm -rf dist

test:
	npm run test

start:
	npm run start

release: clean remove_mac_files test build publish

remove_mac_files:
	find ./ -name ".DS_Store" -exec rm {} \;

