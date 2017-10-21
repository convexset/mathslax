server:
	node server.js

install:
	npm install
	npm install -g userdown forever

PHONY: install server
