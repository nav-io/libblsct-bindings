using System.Reflection;
using System.Runtime.InteropServices;

namespace NavioBlsct.Tests;

internal static class BlsctFree
{
    [DllImport("blsct", EntryPoint = "free_obj", CallingConvention = CallingConvention.Cdecl)]
    private static extern void NativeFreeObj(IntPtr rv);

    public static void FreeObj(object? obj)
    {
        if (obj is null)
        {
            return;
        }

        var swigPtrField = obj.GetType().GetField("swigCPtr", BindingFlags.Instance | BindingFlags.NonPublic);
        if (swigPtrField?.GetValue(obj) is HandleRef handleRef)
        {
            NativeFreeObj(handleRef.Handle);
            var swigCmField = obj.GetType().GetField("swigCMemOwn", BindingFlags.Instance | BindingFlags.NonPublic);
            swigCmField?.SetValue(obj, false);
            return;
        }

        throw new ArgumentException($"Unsupported SWIG object type: {obj.GetType().FullName}", nameof(obj));
    }
}
