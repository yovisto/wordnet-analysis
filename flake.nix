{
  description = "A Python package defined as a Nix Flake";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    nix-filter.url = "github:numtide/nix-filter";
  };

  outputs = { self, nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachSystem [ "x86_64-linux"] (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          # enable if unfree packages are required
          config.allowUnfree = false;
        };
        nix-filter = self.inputs.nix-filter.lib;
        python = pkgs.python310;
        
        ### list of python packages required to build / run the application
        python-packages-build = py-pkgs:
          with py-pkgs; [ nltk
                          beautifulsoup4
                          rdflib
                          urllib3
                          requests
                          gunicorn
                          flask
                          flask-cors

                          (pkgs.callPackage
                          ./pkgs/passivlingo-dictionary.nix
                          {
                            inherit
                              buildPythonPackage pytestCheckHook wn
                              nltk spacy pyttsx3 gtts playsound;
                            textblob = pkgs.callPackage
                              ./pkgs/textblob.nix
                              {inherit buildPythonPackage nltk;};
                          })
                        ];
        
        ### list of python packages to include in the development environment
        # the development installation contains all build packages,
        # plus some additional ones we do not need to include in production.
        python-packages-devel = py-pkgs:
          with py-pkgs; [ ipython
                          black
                          pyflakes
                          isort
                        ]
          ++ (python-packages-build py-pkgs);

        ### create the python package
        nltk-punkt = pkgs.fetchzip {
          url = "https://github.com/nltk/nltk_data/raw/5db857e6f7df11eabb5e5665836db9ec8df07e28/packages/tokenizers/punkt.zip";
          hash = "sha256-SKZu26K17qMUg7iCFZey0GTECUZ+sTTrF/pqeEgJCos=";
        };

        backend = python.pkgs.buildPythonApplication rec {
          pname = "wordnet-analysis-backend";
          version = "0.1.0";
          /*
          only include files that are related to the application
          this will prevent unnecessary rebuilds
          */
          src = nix-filter {
            root = ./backend;
            exclude = [ (nix-filter.matchExt "pyc") ];
          };
          propagatedBuildInputs = (python-packages-build python.pkgs);
          pythonImportsCheck = [ "backend" ];
        };

        ### build the docker image
        docker-img = pkgs.dockerTools.buildImage {
          name = backend.pname;
          tag = backend.version;
          config = {
            # name of command modified in setup.py
            Cmd = ["${backend}/bin/wordnet-analysis-backend-server"];
            # uncomment if the container needs access to ssl certificates
            # Env = [ "SSL_CERT_FILE=${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt" ];
          };
        };

      in rec {
        # the packages that we can build
        packages = rec {
          my-python-app = backend;
          docker = docker-img;
          default = my-python-app;
        };
        # the development environment
        devShells.default = pkgs.mkShell {
          buildInputs = [
            # the development installation of python
            (python.withPackages python-packages-devel)
            # python LSP server
            pkgs.nodePackages.pyright
            # for automatically generating nix expressions, e.g. from PyPi
            pkgs.nix-template
            pkgs.nix-init
          ];
        };
      }
    );
}
