# Configuration file for the Sphinx documentation builder.
#
# For the full list of built-in configuration values, see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Project information -----------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#project-information

project = 'navio_blsct'
copyright = '2025, The Navio Developers'
author = 'The Navio Developers'

# -- General configuration ---------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#general-configuration

templates_path = ['_templates']
exclude_patterns = []

autodoc_type_aliases = {
  "DoublePublickey": "blsct.keys.double_public_key.DoublePublicKey",
  "PublicKey": "blsct.keys.public_key.PublicKey",
  "RangeProof": "blsct.RangeProof",
  "ViewKey": "blsct.keys.child_key_desc.tx_key_desc.view_key.ViewKey",
}

# -- Options for HTML output -------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#options-for-html-output

html_theme = 'classic'
html_static_path = ['_static']

extensions = [
  'sphinx.ext.doctest',
  'sphinx.ext.autodoc',
]

