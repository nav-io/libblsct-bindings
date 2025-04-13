# Development

## Setting up the environment

1. Swig

- macOS 

```bash
brew install swig
```

- Ubuntu

```bash
sudo apt-get install swig
```

1. Create a virtual environment

```bash
python3 -m venv venv
source venv/bin/activate
```

1. Install the required packages

```bash
pip install --upgrade pip
pip install setuptools build
```

## Building the package

```bash
python -m build
```

## Testing the package

```bash
pip install dist/*.whl
python -c "import blsct"
```

## Testing with locally installed package

1. cd to `ffi/python` directory

1. Install the package

```bash
python3 -m venv venv
source venv/bin/activate
pip install build setuptools
python -m build
pip install dist/*.whl
```

1. Move to a directory that is not `ffi/python` in order to avoid for your test script to use sources under `ffi/python` as the pacakge. Files under the directory don't contain c++ libraries and other required files.

1. Run your test script

```bash
python -c 'import blsct'
```


