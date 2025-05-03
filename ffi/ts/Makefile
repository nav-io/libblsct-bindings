lib := ../../../lib
swig := ../../swig/bin/swig
module := blsct
interface := ./$(module).i
wrap := $(module)_wrap.cxx

./build/Release/blsct.node: $(wrap)
	node-gyp configure && node-gyp build --silly 

$(wrap): $(interface)
	$(swig) -c++ -javascript -node $(interface)

run:
	npm run build && node ./test.js

clean:
	rm -f $(wrap)
	rm -rf build

.PHONY: clean run
