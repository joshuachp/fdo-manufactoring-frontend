#!/usr/bin/env bash

set -exEuo pipefail

# Trap -e errors
trap 'echo "Exit status $? at line $LINENO from: $BASH_COMMAND"' ERR

if which podman; then
    container=podman
else
    container=docker
fi

FDODIR=./.fdo

mkdir -p "$FDODIR"/{certs,db,files}

# Manufacturer key (DER format)
if [ ! -f "$FDODIR"/certs/manufacturer.key ]; then
    openssl ecparam -name prime256v1 -genkey -out "$FDODIR"/certs/manufacturer.key -outform der
fi

# Manufacturer certificate (PEM format)
if [ ! -f "$FDODIR"/certs/manufacturer.crt ]; then
    openssl req -x509 -key "$FDODIR"/certs/manufacturer.key -keyform der \
        -out "$FDODIR"/certs/manufacturer.crt -days 365 \
        -subj "/C=US/O=Example/CN=Manufacturer"
fi

# Device CA key (DER format)
if [ ! -f "$FDODIR"/certs/device_ca.key ]; then
    openssl ecparam -name prime256v1 -genkey -out "$FDODIR"/certs/device_ca.key -outform der
fi

# Device CA certificate (PEM format)
if [ ! -f "$FDODIR"/certs/device_ca.crt ]; then
    openssl req -x509 -key "$FDODIR"/certs/device_ca.key -keyform der \
        -out "$FDODIR"/certs/device_ca.crt -days 365 \
        -subj "/C=US/O=Example/CN=Device CA"
fi

# Owner key (DER format)
if [ ! -f "$FDODIR"/certs/owner.key ]; then
    openssl ecparam -name prime256v1 -genkey -out "$FDODIR"/certs/owner.key -outform der
fi

# Owner certificate (PEM format)
if [ ! -f "$FDODIR"/certs/owner.crt ]; then
    openssl req -x509 -key "$FDODIR"/certs/owner.key -keyform der \
        -out "$FDODIR"/certs/owner.crt -days 365 \
        -subj "/C=US/O=Example/CN=Owner"
fi

# Make files readable and writable by your user
chmod -R u+rwX "$FDODIR"

$container stop fdo-manufacturer || true

$container run --rm --detach \
    --name fdo-manufacturer \
    --user 0:0 \
    --publish 8038:8038 \
    -v "$FDODIR":/tmp/fdo:z \
    docker.io/astarte/go-fdo-server:ade68cda47-20251128 \
    --log-level=debug manufacturing 0.0.0.0:8038 \
    --db-type=sqlite --db-dsn "file:/tmp/fdo/db/manufacturer.db" \
    --manufacturing-key /tmp/fdo/certs/manufacturer.key \
    --owner-cert /tmp/fdo/certs/owner.crt \
    --device-ca-cert /tmp/fdo/certs/device_ca.crt \
    --device-ca-key /tmp/fdo/certs/device_ca.key

mf_info='[
  {"dns":"fdo-rendezvous.clea-dev.midgar.services","device_port":"443","owner_port":"443","protocol":"https","delay_seconds":10}
]'

try_curl() {
    curl --fail-with-body --location --retry 3 --retry-delay 2 --retry-connrefused "$@"
}

# Tries to update or create the info
send_req() {
    try_curl --request PUT "$1" --header 'Content-Type: text/plain' --data-raw "$2" ||
        try_curl --request POST "$1" --header 'Content-Type: text/plain' --data-raw "$2"
}

send_req 'http://localhost:8038/api/v1/rvinfo' "$mf_info"
