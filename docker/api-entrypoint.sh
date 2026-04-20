#!/bin/sh
set -e

node ./node_modules/knex/bin/cli.js --knexfile dist/knexfile.js migrate:latest

exec node dist/src/server.js
