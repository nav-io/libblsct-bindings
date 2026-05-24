// Stubs for symbols that libblsct.a references but are normally provided
// by the full navio-core binary. Only needed when linking into a standalone
// shared library for C# P/Invoke.

#include <cstdint>
#include <cstdio>
#include <functional>
#include <limits>
#include <string>

#ifdef _WIN32
#include <windows.h>
#include <bcrypt.h>
#include <shlobj.h>
#pragma comment(lib, "bcrypt.lib")
#endif

#include "random.h"
#include "uint256.h"

// TODO(upstream): G_TRANSLATION_FUN is declared extern in util/translation.h and
// must be defined by the consuming binary. libblsct.a should either define it
// internally (as nullptr) or remove the dependency on the translation system.
std::function<std::string(const char*)> G_TRANSLATION_FUN = nullptr;

static bool ReadBytes(void* buf, size_t n) noexcept
{
#ifdef _WIN32
    if (n > static_cast<size_t>(std::numeric_limits<ULONG>::max())) return false;
    return BCryptGenRandom(nullptr, static_cast<PUCHAR>(buf), static_cast<ULONG>(n),
                           BCRYPT_USE_SYSTEM_PREFERRED_RNG) == 0;
#else
    FILE* f = fopen("/dev/urandom", "rb");
    if (!f) return false;
    size_t got = fread(buf, 1, n, f);
    fclose(f);
    return got == n;
#endif
}

// TODO(upstream): FastRandomContext::rand256() and GetRandInternal() are defined
// in random.cpp, which is not included in libblsct_a_SOURCES. A crypto library
// must own its randomness — random.cpp should be part of libblsct.a.
uint256 FastRandomContext::rand256() noexcept
{
    uint256 result;
    if (!ReadBytes(result.data(), 32))
        result.SetNull();
    return result;
}

uint64_t GetRandInternal(uint64_t nMax) noexcept
{
    if (nMax == 0) return 0;

    // Rejection sampling to eliminate modulo bias.
    // Discard values in the range [threshold, UINT64_MAX] where the modulo
    // distribution would be uneven.
    const uint64_t threshold = (UINT64_MAX - nMax + 1) % nMax;
    uint64_t val = 0;
    do {
        if (!ReadBytes(&val, sizeof(val))) return 0;
    } while (val < threshold);

    return val % nMax;
}

// TODO(upstream): GetSpecialFolderPath is called from args.cpp via a #ifdef WIN32
// path, but fs_helpers.cpp is not included in libblsct_a_SOURCES for the
// --enable-build-libblsct-only build. Fix in navio-core: either add
// fs_helpers.cpp to libblsct_a_SOURCES, or remove the args.cpp dependency
// from libblsct entirely (args/config parsing has no place in a crypto library).
#ifdef _WIN32
// Must use the real fs::path from util/fs.h — it is a subclass of
// std::filesystem::path, so the mangled name differs from returning
// std::filesystem::path directly (no B5cxx11 ABI tag).
#include <util/fs.h>

fs::path GetSpecialFolderPath(int nFolder, bool fCreate)
{
    WCHAR pszPath[MAX_PATH] = L"";
    if (SHGetSpecialFolderPathW(nullptr, pszPath, nFolder, fCreate)) {
        return fs::path(pszPath);
    }
    return fs::path();
}
#endif
