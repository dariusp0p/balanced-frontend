#!/bin/sh
set -eu

CERT_DIR="/etc/nginx/certs"
CERT_FILE="$CERT_DIR/balanced.crt"
KEY_FILE="$CERT_DIR/balanced.key"
TLS_CERT_HOST="${TLS_CERT_HOST:-localhost}"

case "$TLS_CERT_HOST" in
  *[!0-9.]*)
    HOST_SAN="DNS:${TLS_CERT_HOST}"
    ;;
  *)
    HOST_SAN="IP:${TLS_CERT_HOST}"
    ;;
esac

ALT_NAMES="DNS:localhost,IP:127.0.0.1,${HOST_SAN}"
if [ -n "${TLS_CERT_EXTRA_SANS:-}" ]; then
  ALT_NAMES="${ALT_NAMES},${TLS_CERT_EXTRA_SANS}"
fi

mkdir -p "$CERT_DIR"

cat > /tmp/balanced-openssl.cnf <<EOF
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
x509_extensions = req_ext

[dn]
CN = ${TLS_CERT_HOST}

[req_ext]
subjectAltName = ${ALT_NAMES}
EOF

if [ ! -f "$CERT_FILE" ] || [ ! -f "$KEY_FILE" ]; then
  openssl req \
    -x509 \
    -nodes \
    -days 365 \
    -newkey rsa:2048 \
    -keyout "$KEY_FILE" \
    -out "$CERT_FILE" \
    -config /tmp/balanced-openssl.cnf
fi

exec nginx -g 'daemon off;'
