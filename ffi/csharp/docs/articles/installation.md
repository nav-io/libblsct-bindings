# Installation

NavioBlsct is available on [NuGet](https://www.nuget.org/packages/NavioBlsct).

## Requirements

- .NET 8, .NET 10, or .NET Standard 2.1
- The NuGet package ships native `runtimes/` assets for `linux-x64`,
  `osx-arm64`, and `win-x64`.

`LIBBLSCT_SO_PATH` is only needed for integration tests or when you want to
override the native shared library path manually.

## Adding the package

```xml
<PackageReference Include="NavioBlsct" Version="0.1.0" />
```

Or via the .NET CLI:

```bash
dotnet add package NavioBlsct
```
