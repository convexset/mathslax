# MathSlax

A typesetting solution for all of your [Slack](https://slack.com/) chat needs.

# Dependencies
Requires Java, nodejs and NPM.

```shell
$ sudo apt-get install nodejs npm default-jre
$ sudo apt-get install openjdk-7-jdk # unless a JDK is already installed
```

# Set up
```shell
$ cd mathslax
$ make install
$ SERVER=myhostname.com PORT=9999 node server.js
```

Set up an outgoing web hook in Slack pointing to `myhostname.com:9999/typeset`
(don't forget the `/typeset`). Use `math!` as the prefix.

Also see `run-mathslax.sh`. (Remember to fill in your configuration info.)

# Starting on Boot and Running Forever

An supervisord configuration (`mathslax-supervisord.conf`) has been provided.
It uses `userdown`, which should be installed during the set up via `make install`.

(Remember to fill in your configuration info. Do also replace the "non-root"
user name which is `www-data` by default.)


# Usage
In the Slack channel with the web hook configured, you should be able to
typeset equations by starting your message with `math!`. For example, `math!
x^2 * sin(x)` would cause the `mathslax` bot to comment with a link to a
typeset image of `x^2 * sin(x)`.

## Slash command

You can also use this as a slash command, provided the POST URL is `/command` instead of `/typeset`.

### Note About Debian/Ubuntu node vs nodejs

The npm install step can produce hard to diagnose errors on Debian derived systems
(such as Ubuntu 12.x and later). The binary /usr/bin/node was renamed to /usr/bin/nodejs
and many packages
in npm do not expect this. You can either create a link yourself from /usr/bin/node -> /usr/bin/nodejs or use one of the other various solutions out there (including attempting to use the package
    nodejs-legacy).  Good luck!

