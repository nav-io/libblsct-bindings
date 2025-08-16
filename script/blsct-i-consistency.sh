#!/bin/bash

set -euo pipefail

FILES=(
  "./ffi/ts/swig/blsct.i"
  "./ffi/python/blsct/blsct.i"
)

ref="${FILES[0]}"
ref_body=$(grep -v '^#include' "$ref")

for f in "${FILES[@]:1}"; do # from the second element onward
	if [[ ! -f "$f" ]]; then
		echo "❌ Expected blsct.i file is missing: $f, pwd=$(pwd), ls=$(ls -l)"
		exit 1
	fi
	echo "Checking consistency of $f against $ref..."

	# ignore #include lines for comparison
	file_body=$(grep -v '^#include' "$f")

  if ! diff_out=$(diff -u <(echo "$ref_body") <(echo "$file_body")); then
    echo "❌ Inconsistency detected between $ref and $f"
    echo
    echo "$diff_out"
    exit 1
  fi
done

echo "✅ All blsct.i files are consistent"

