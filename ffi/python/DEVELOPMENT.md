1. Create a virtual environment

```bash
python3 -m venv venv
source venv/bin/activate
```

1. Install the required packages

```bash
pip install --upgrade pip
pip install setuptools wheel build twine
```

1. Build the package

```bash
python -m build
```

1. Test the package

```bash
pip install dist/mypackage-0.1.0-py3-none-any.whl
python -c "import mypackage.mylibrary; print(mypackage.mylibrary.some_function())"
```

1. Upload the package

```bash
twine upload dist/*
```

