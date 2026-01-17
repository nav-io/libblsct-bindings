/**
 * Minimal bitcoin-config.h for WASM builds
 * This provides the required defines without running the full configure script
 */

#ifndef BITCOIN_CONFIG_H
#define BITCOIN_CONFIG_H

// Client version - using placeholder values for WASM library
#define CLIENT_VERSION_MAJOR 1
#define CLIENT_VERSION_MINOR 0
#define CLIENT_VERSION_BUILD 0
#define CLIENT_VERSION_IS_RELEASE true
#define COPYRIGHT_YEAR 2024

// Package info
#define PACKAGE_NAME "navio-blsct-wasm"
#define PACKAGE_VERSION "1.0.0"
#define PACKAGE_STRING "navio-blsct-wasm 1.0.0"

// System feature detection
#define HAVE_DECL_STRERROR_R 0
#define HAVE_DECL_STRNLEN 1

// Emscripten provides endian.h with all the endian macros
// Setting these to 1 tells navio-core's compat/endian.h not to redefine them
#define HAVE_ENDIAN_H 1
#define HAVE_DECL_LE16TOH 1
#define HAVE_DECL_LE32TOH 1
#define HAVE_DECL_LE64TOH 1
#define HAVE_DECL_HTOLE16 1
#define HAVE_DECL_HTOLE32 1
#define HAVE_DECL_HTOLE64 1
#define HAVE_DECL_BE16TOH 1
#define HAVE_DECL_BE32TOH 1
#define HAVE_DECL_BE64TOH 1
#define HAVE_DECL_HTOBE16 1
#define HAVE_DECL_HTOBE32 1
#define HAVE_DECL_HTOBE64 1
// Emscripten provides byteswap.h with bswap_16/32/64 macros
#define HAVE_DECL_BSWAP_16 1
#define HAVE_DECL_BSWAP_32 1
#define HAVE_DECL_BSWAP_64 1
#define HAVE_BYTESWAP_H 1
#define HAVE_SYS_ENDIAN_H 0
#define HAVE_BUILTIN_CLZL 1
#define HAVE_BUILTIN_CLZLL 1

// Disable wallet features for minimal build
#define ENABLE_WALLET 0

// Use standard library features
#define HAVE_STD_FILESYSTEM 1

// Threading features
#define HAVE_THREAD_LOCAL 0

#endif // BITCOIN_CONFIG_H
