#!/bin/bash

# copy somewhere else because tokens
export SLACK_AUTH_TOKENS="token1; token2"
export SERVER="example.com"
export PORT=12345
export MATHSLAX_DIRECTORY="/opt/mathslax"

CURR_DIR=$(pwd)
SCRIPT_DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

iptables -A INPUT -p tcp --dport $PORT -m conntrack --ctstate NEW,ESTABLISHED -j ACCEPT
iptables -A OUTPUT -p tcp --sport $PORT -m conntrack --ctstate ESTABLISHED -j ACCEPT

cd $MATHSLAX_DIRECTORY

node server.js

cd $CURR_DIR