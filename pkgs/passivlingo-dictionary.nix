{ lib
, buildPythonPackage
, pytestCheckHook
, fetchFromGitHub
, wn
, nltk
, spacy
, textblob
, pyttsx3
, gtts
, playsound
}:

buildPythonPackage rec {
  pname = "passivlingo-dictionary";
  version = "1.0.0";
  format = "setuptools";

  src = fetchFromGitHub {
    owner = "pssvlng";
    repo = "passivlingo-dictionary";
    rev = "7e587e99ace8f7312602b0f0d731e08bd31afa47";
    hash = "sha256-wWHBWf//v9gvTCdZ3PYtWtxA6vup4gqoerfgadcpVe4=";
  };

  pythonImportsCheck = [ "passivlingo_dictionary" ];

  propagatedBuildInputs = [
    wn
    nltk
    spacy
    textblob
    pyttsx3
    gtts
    playsound
  ];

  postPatch = ''
    substituteInPlace setup.py \
      --replace "setup_requires=['pytest-runner']," "" \
      --replace "==" ">="
  '';

  doCheck = false;

  meta = with lib; {
    description = "Python library for accessing own and nltk wordnet ontologies";
    homepage = "https://github.com/pssvlng/passivlingo-dictionary/commit/7e587e99ace8f7312602b0f0d731e08bd31afa47";
    license = licenses.gpl3Only;
    maintainers = with maintainers; [ ];
  };
}
