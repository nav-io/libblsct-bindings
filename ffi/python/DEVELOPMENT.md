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

1. cd to `ffi/python` directory

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
cd ..
python -c "import blsct"
```

## Testing with locally installed navio-blsct package

1. cd to `ffi/python` directory

1. Install the navio-blsct package

- Install `venv`, `build` and `setuptools` (first time only)
```bash
python3 -m venv venv
pip install build setuptools
```

- Build and install the navio-blsct package
```bash
source venv/bin/activate
python -m build
pip install --force-reinstall dist/*.whl
```

1. Move to the parent directory to avoid using the source codes under `ffi/python`

1. Test that the installation was successful

```bash
python -c 'import blsct'
```


