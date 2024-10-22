# libblsct-bindings

## How to set up the environment

1. Move to the repository root


1. Fetch navio-core and swig submodules

   ```bash
   git submodule update --init --remote --recursive
   ```

1. Build `src/libblsct.a`:

   ```bash
   ./script/build-libblsct.sh
   ```

1. Install `PCRE2` and `bison`

   On Ubuntu:

   ```bash
   sudo apt install libpcre2-dev bison
   ```

   On macOS:

   Regarding bison, although Xcode includes bison, the version is 2.3 which  does not work with swig. Newer version of bison needs to installed.

   ```bash
   brew install pcre2 bison 
   ```

   and add bison to the path
   ```bash
   export PATH="/opt/homebrew/opt/bison/bin:$PATH"
   ```

1. Build `swig`

   ```bash
   ./script/build-swig.sh
   ```

1. Add locally built `swig` to the PATH

   ```bash
   source ./script/activate-swig.sh
   ```

