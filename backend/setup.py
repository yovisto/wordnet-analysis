#!/usr/bin/env python3
from setuptools import setup, find_packages

setup(
    name="wordnet-analysis-backend",
    version="0.1.0",
    description="Backend of wordnet-analysis",
    author="",
    author_email="",
    packages=find_packages(),
    install_requires=[
        d for d in open("requirements.txt").readlines() if not d.startswith("--")
    ],
    package_dir={"": "."},
    entry_points={
        "console_scripts": [
            "wordnet-analysis-backend = backend.app:main",
            "post-install-script = backend.post_install_scripts:main"
        ]
    },

)
