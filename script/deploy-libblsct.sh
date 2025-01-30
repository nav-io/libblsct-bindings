#!/bin/bash

repo_dir=./navio-core

cp $repo_dir/src/libblsct.a ./lib
cp $repo_dir/src/libunivalue_blsct.a ./lib
cp $repo_dir/src/bls/lib/libbls384_256.a ./lib
cp $repo_dir/src/bls/mcl/lib/libmcl.a ./lib

