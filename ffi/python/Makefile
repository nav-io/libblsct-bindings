swig := ../../swig/swig
lib := ../../lib
cflags := $(shell python3-config --cflags | sed 's/-DNDEBUG//') -std=c++20
ldflags := $(shell python3-config --ldflags --embed)
src := ../../navio-core/src
bls := $(src)/bls
mcl := $(bls)/mcl
boost := ../../navio-core/depends/aarch64-apple-darwin24.0.0/include
incl := -I$(bls)/include -I$(mcl)/include -I$(src) -I$(boost)
cxxflags := -DCLIENT_VERSION_MAJOR=1 \
            -DCLIENT_VERSION_MINOR=0 \
            -DCLIENT_VERSION_BUILD=0 \
            -DCLIENT_VERSION_IS_RELEASE=1 \
            -DCOPYRIGHT_YEAR=2023
module := blsct
wrap := $(module)_wrap
intf := $(module).i
module_so := _$(module).so

$(module_so): $(wrap).o
	g++ -shared $(wrap).o \
	$(lib)/libbls384_256.a \
	$(lib)/libmcl.a \
	$(lib)/libunivalue_blsct.a \
	$(lib)/libblsct.a -std=c++20 $(ldflags) \
	-undefined dynamic_lookup -o $(module_so)

$(wrap).o: $(wrap).cxx $(module).py
	g++ -c -fpic $(wrap).cxx $(cflags) $(incl)

$(wrap).cxx: $(intf)
	$(swig) -python -c++ $(intf)

run:
	python3 test.py

clean:
	rm -f *.o
	rm -f *.so
	rm -f $(module_so)
	rm -f $(module).py
	rm -f $(wrap).*
	rm -rf __pycache__

.PHONY: clean run
