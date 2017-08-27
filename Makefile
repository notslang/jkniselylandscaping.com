.PHONY: all deploy

INPUT_IMGS := $(shell find content -type f -name '*.jpg' -not -path '*content/portfolio*')
OUTPUT_IMGS := $(patsubst content/%, public/%, $(INPUT_IMGS))
INPUT_HTML_FILES := $(shell find content -type f -name '*.html')
OUTPUT_HTML_FILES := $(patsubst content/%.html, public/%.html, $(INPUT_HTML_FILES))

BASE_DEPS = tmp/render.js tmp/view/layout.marko.js tmp/page-list.json

public/%/index.html: content/%/index.html tmp/view/normal.marko.js $(BASE_DEPS)
	mkdir -p "$(dir $@)"
	node tmp/render.js "$<" normal < "$<" > "$@"

public/index.html: content/index.html tmp/view/normal.marko.js $(BASE_DEPS)
	mkdir -p "$(dir $@)"
	node tmp/render.js "$<" normal < "$<" > "$@"

tmp/view/%.marko.js: view/%.marko tmp/npm-install-done
	mkdir -p "$(dir $@)"
	node_modules/.bin/markoc "$<"
	mv "$<.js" "$@"

tmp/%.js: %.coffee tmp/npm-install-done
	mkdir -p "$(dir $@)"
	echo "'use_strict'" \
	| cat - "$<" \
	| ./node_modules/.bin/coffee -b -c -s > "$@"

tmp/page-list.json: tmp/page-list.js $(INPUT_HTML_FILES) tmp/npm-install-done
	node tmp/page-list.js > "$@.compare"
	if cmp -s "$@.compare" "$@"; then \
		rm "$@.compare"; \
	else \
		mv "$@.compare" "$@"; \
	fi

tmp/npm-install-done: package.json
	if [ -d node_modules ]; then rm -R node_modules; fi
	npm install --production
	mkdir -p tmp
	touch "$@"

tmp/favicon-%.png: assets/img/logo-small.svg tmp/npm-install-done
	node_modules/.bin/svgexport assets/img/logo-small.svg "$@" $*:$* pad; \
	optipng "$@"

public/favicon.ico: tmp/favicon-16.png tmp/favicon-32.png tmp/favicon-48.png
	convert $^ "$@"

public/google%.html:
	mkdir -p "$(dir $@)"
	echo "google-site-verification: google$*.html" > "$@"

all: public/index.html $(OUTPUT_HTML_FILES) $(OUTPUT_IMGS) \
     public/googlea996c0920075fa0d.html
	cp -r assets/wp-* public

deploy: all
	# upload images before text files because they take the longest and are referenced by any new HTML pages
	rsync -r --delete --progress --include="*.jpg" --include='*/' --exclude='*' ./public/ core@slang.cx:/data/nginx/content/jkniselylandscaping.com/
	rsync -r --delete --progress --exclude="*.jpg" ./public/ core@slang.cx:/data/nginx/content/jkniselylandscaping.com
	rsync --progress ./nginx/config/jkniselylandscaping.conf core@slang.cx:/data/nginx/config
