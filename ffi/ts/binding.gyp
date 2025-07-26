{
  'targets': [
    {
      'target_name': 'blsct',
      'include_dirs': [
         '<(module_root_dir)/navio-core/src/bls/include',
         '<(module_root_dir)/navio-core/src/bls/mcl/include',
         '<(module_root_dir)/navio-core/src',
      ],
      'libraries': [
        'libblsct.a',
        'libunivalue_blsct.a',
        'libbls384_256.a',
        'libmcl.a',
      ],
      'sources': [
        './swig/blsct_wrap.cxx',
      ],
      'cflags_cc': ['-std=c++20', '-fPIC', '-fexceptions'],
      'xcode_settings': {
        'CLANG_CXX_LANGUAGE_STANDARD': 'c++20 -fexceptions',
        'OTHER_CFLAGS': ['-std=c++20 -fexceptios'],
        'OTHER_CPLUSPLUSFLAGS': ['-std=c++20', '-fexceptions'],
			  'OTHER_LDFLAGS': [
          '-L./lib',
        ],
			  'OTHER_LDFLAGS!': [
        ],
      }
    }
  ]
}
