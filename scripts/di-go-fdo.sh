#!/usr/bin/env bash

set -exEuo pipefail

# Trap -e errors
trap 'echo "Exit status $? at line $LINENO from: $BASH_COMMAND"' ERR

FDODIR=./.fdo

if which podman; then
    CONTAINER=podman
else
    CONTAINER=docker
fi

go-fdo-client() {
    $CONTAINER run --rm -it \
        --name fdo-client \
        --network host \
        --user 0:0 \
        -v "$FDODIR":/tmp/fdo:z \
        docker.io/joshuachp/go-fdo-client:latest \
        "$@"
}

go-fdo-client device-init 'http://localhost:8038' \
    --device-info gotest \
    --key ec256 \
    --debug \
    --blob /tmp/fdo/cred.bin
