namespace NavioBlsct.Tests;

/// <summary>
/// Initializes the native libblsct once per test class and drains all SWIG
/// finalizers before the test host exits. Without this, finalizer order at
/// process shutdown can race against native global teardown and crash the
/// xUnit host with a corrupted "Test host process crashed" message.
/// </summary>
public sealed class BlsctTestFixture : IDisposable
{
    public BlsctTestFixture()
    {
        blsct.init();
    }

    public void Dispose()
    {
        GC.Collect();
        GC.WaitForPendingFinalizers();
        GC.Collect();
        GC.WaitForPendingFinalizers();
    }
}
