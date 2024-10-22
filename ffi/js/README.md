## Preparation  

### Install `libblsct.a`, `libbls384_256.a` and `libmcl.a`

Follow the steps described in the top-level [README.md](../../README.md)

### Install `Node.js`

Install Node.js that comes with a reasonably recent Python such as the current LTS v20.18.0 using nvm etc.

### Install `node-gyp` build tool

```bash
npm i -g node-gyp
```

### Install dependencies

```bash
npm i
```

## Build `blsct.node` module

```bash
make
```

## Run `test.js`

```bash
make run
```
