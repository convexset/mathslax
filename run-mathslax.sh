#!/bin/bash

# copy somewhere else because tokens
SLACK_AUTH_TOKENS="token1; token2"
SERVER="example.com"
PORT=12345

CURR_DIR=$(pwd)
SCRIPT_DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

iptables -A INPUT -p tcp --dport $PORT -m conntrack --ctstate NEW,ESTABLISHED -j ACCEPT
iptables -A OUTPUT -p tcp --sport $PORT -m conntrack --ctstate ESTABLISHED -j ACCEPT

cd [mathslax-directory]

SERVER=$SERVER PORT=$PORT SLACK_AUTH_TOKEN=$SLACK_AUTH_TOKEN node server.js

cd $CURR_DIR