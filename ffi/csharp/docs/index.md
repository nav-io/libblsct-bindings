# NavioBlsct

**NavioBlsct** is a .NET SWIG binding for the
[libblsct](https://github.com/nav-io/navio-core) C library. It exposes the full
BLSCT ABI — key derivation, address encoding, range proofs, transaction
building, and more — to any .NET project targeting net8.0, net10.0, or
netstandard2.1.

## Quick start

```xml
<PackageReference Include="NavioBlsct" Version="0.1.0" />
```

Then:

```csharp
using NavioBlsct;

blsct.init();
blsct.set_blsct_chain(BlsctChain.Mainnet);

// Derive a sub-address from a seed scalar
var rvSeed = blsct.gen_scalar(12345);
var seed = blsct.cast_to_scalar(rvSeed.value);
var childKey = blsct.from_seed_to_child_key(seed);
var txKey = blsct.from_child_key_to_tx_key(childKey);
var viewKey = blsct.from_tx_key_to_view_key(txKey);
var spendPk = blsct.scalar_to_pub_key(blsct.from_tx_key_to_spending_key(txKey));

var subAddrId = blsct.gen_sub_addr_id(0, 0);
var subAddr = blsct.derive_sub_address(viewKey, spendPk, subAddrId);
var dpkVal = blsct.sub_addr_to_dpk(subAddr);

var rvEnc = blsct.encode_address(dpkVal, AddressEncoding.Bech32M);
var address = blsct.cast_to_const_char_ptr(rvEnc.value);

blsct.free_obj(rvSeed.value);
blsct.free_obj(rvEnc.value);
```

See the [API Reference](xref:NavioBlsct) or browse the
[Articles](articles/installation.md).
