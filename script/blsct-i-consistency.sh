#!/bin/bash

set -euo pipefail

SHARED="./ffi/blsct.i"

declare -A EXPECTED_INCLUDE=(
    ["./ffi/ts/swig/blsct.i"]='%include "../../blsct.i"'
    ["./ffi/python/blsct/blsct.i"]='%include "../blsct.i"'
    ["./ffi/csharp/blsct.i"]='%include "../blsct.i"'
)

if [[ ! -f "$SHARED" ]]; then
    echo "❌ Shared blsct.i missing: $SHARED"
    exit 1
fi

for f in "${!EXPECTED_INCLUDE[@]}"; do
    if [[ ! -f "$f" ]]; then
        echo "❌ Expected blsct.i file is missing: $f, pwd=$(pwd), ls=$(ls -l)"
        exit 1
    fi

    expected="${EXPECTED_INCLUDE[$f]}"
    echo "Checking $f includes shared contract..."

    if ! grep -qF "$expected" "$f"; then
        echo "❌ $f must contain: $expected"
        exit 1
    fi
done

echo "✅ All blsct.i files include the shared ffi/blsct.i"
