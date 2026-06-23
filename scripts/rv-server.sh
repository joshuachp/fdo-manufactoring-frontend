#!/usr/bin/env bash

set -exEuo pipefail

# Trap -e errors
trap 'echo "Exit status $? at line $LINENO from: $BASH_COMMAND"' ERR

if which podman; then
    container=podman
else
    container=docker
fi

$container run \
    --detach \
    --name fdo-rendezvous \
    --user 0:0 \
    --rm \
    --publish 8041:8041 \
    docker.io/astarte/go-fdo-server:ade68cda47-20251128 \
    --log-level=debug rendezvous 0.0.0.0:8041 \
    --db-type sqlite --db-dsn "file:/rendezvous.db"
