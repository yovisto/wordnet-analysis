{ lib
, buildPythonPackage
, fetchPypi
, fetchzip
, nltk
}:

buildPythonPackage rec {
  pname = "textblob";
  version = "0.17.1";
  format = "setuptools";

  src = fetchPypi {
    inherit pname version;
    hash = "sha256-jcCHXfqx6vDcdyqdvEr6qcqT0ONc1iy3kvOjjgZ6to8=";
  };

  propagatedBuildInputs = [
    nltk
  ];

  pythonImportsCheck = [ "textblob" ];

  doCheck = false;

  nltk-wordnet = fetchzip {
    url = "https://github.com/nltk/nltk_data/raw/5db857e6f7df11eabb5e5665836db9ec8df07e28/packages/corpora/wordnet.zip";
    hash = "sha256-L+lpHoDd9NwaDFBejPppF5hWg6e1+Sa9ixh3M4MzQs0=";
  };

  preBuild = ''
    mkdir -p $out/lib/nltk_data/corpora/wordnet.zip
    cp -r ${nltk-wordnet.out}/* $out/lib/nltk_data/corpora/wordnet.zip
  '';
  # make the created folder discoverable for NLTK
  makeWrapperArgs = ["--set NLTK_DATA $out/lib/nltk_data"];


  meta = with lib; {
    description = "Simple, Pythonic text processing. Sentiment analysis, part-of-speech tagging, noun phrase parsing, and more";
    homepage = "https://pypi.org/project/textblob";
    license = licenses.mit;
    maintainers = with maintainers; [ ];
  };
}
