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
        
        # build the spaCy language processing pipeline as a python package
        de_core_news_md = with pkgs.python3Packages;
          buildPythonPackage rec {
            pname = "de_core_news_md";
            version = "3.5.0";
            src = pkgs.fetchzip {
              url = "https://github.com/explosion/spacy-models/releases/download/${pname}-${version}/${pname}-${version}.tar.gz";
              hash = "sha256-6HfAX7qe2D27XpU0+KrCpRtHbDdbNWowW3/2PVKWcBI=";
            };
            doCheck = false;
            propagatedBuildInputs = [
              spacy
              spacy-transformers
            ];
          };
        
        en_core_web_sm = with pkgs.python3Packages;
          buildPythonPackage rec {
            pname = "en_core_web_sm";
            version = "3.5.0";
            src = pkgs.fetchzip {
              url = "https://github.com/explosion/spacy-models/releases/download/${pname}-${version}/${pname}-${version}.tar.gz";
              hash = "sha256-K6tjfcKZXuWL36AKijWbojzMtz5tSet+Ab7BRQ0Z+yA=";
            };
            doCheck = false;
            propagatedBuildInputs = [
              spacy
              spacy-transformers
            ];
          };

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

                          de_core_news_md
                          en_core_web_sm

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
        nltk-stopwords = pkgs.fetchzip {
          url = "https://github.com/nltk/nltk_data/raw/5db857e6f7df11eabb5e5665836db9ec8df07e28/packages/corpora/stopwords.zip";
          sha256 = "sha256-tX1CMxSvFjr0nnLxbbycaX/IBnzHFxljMZceX5zElPY=";
        };
        
        nltk-wordnet = pkgs.fetchzip {
          url = "https://github.com/nltk/nltk_data/raw/5db857e6f7df11eabb5e5665836db9ec8df07e28/packages/corpora/wordnet.zip";
          hash = "sha256-L+lpHoDd9NwaDFBejPppF5hWg6e1+Sa9ixh3M4MzQs0=";
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
          propagatedBuildInputs = (python-packages-build python.pkgs)
                                  ++ [ pkgs.graphviz ];
          pythonImportsCheck = [ "backend" ];
          preBuild = ''
            mkdir -p \
              $out/lib/nltk_data/corpora/stopwords \
              $out/lib/nltk_data/corpora/wordnet

            cp -r \
              ${nltk-stopwords}/* \
              $out/lib/nltk_data/corpora/stopwords

            cp -r \
              ${nltk-wordnet.out}/* \
              $out/lib/nltk_data/corpora/wordnet
          '';
          # make the created folder discoverable for NLTK
          makeWrapperArgs = ["--set NLTK_DATA $out/lib/nltk_data"];
        };

        frontend = pkgs.buildNpmPackage rec {
          pname = "wordnet-analysis-frontend";
          version = "0.1.0";
          src = ./frontend;
          npmDepsHash = "sha256-p4tBigqh8Ek6bdOpf0qjh6NY78+7trPSQet0oP4uLf8=";
          
          npmPackFlags = [ "--omit=dev" ];

          installPhase = ''
            cp -r dist $out/
          '';
        };

        nginx = let
          nginxPort = "80";
          nginxConf = pkgs.writeText "nginx.conf" ''
            user nobody nobody;
            daemon off;
            error_log /dev/stdout debug;
            pid /dev/null;
            events {}
            http {
              access_log /dev/stdout;
              add_header Access-Control-Allow-Origin *;
              include ${pkgs.nginx}/conf/mime.types;
              server {
                listen ${nginxPort};
                index index.html;
                location / {
                  root ${nginxWebRoot};
                }
              }
            }
          '';
          nginxWebRoot = "${frontend}";
        in
          pkgs.dockerTools.buildLayeredImage {
            name = "nginx-container";
            tag = "latest";
            contents = [
              pkgs.fakeNss
              pkgs.bashInteractive
              pkgs.coreutils-full
            ];

            extraCommands = ''
              mkdir -p tmp/nginx_client_body

              # nginx still tries to read this directory even if error_log
              # directive is specifying another file :/
              mkdir -p var/log/nginx
            '';

            config = {
              Cmd = [
                (pkgs.writeShellScript "run.sh" ''
                  ${backend}/bin/post-install-script &&
                  ${backend}/bin/${backend.pname} &
                  ${pkgs.nginx}/bin/nginx -c ${nginxConf}
                '')
              ];
              Env = [ "SSL_CERT_FILE=${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt" ];
              ExposedPorts = {
                "${nginxPort}/tcp" = {};
                "5000/tcp" = {};
              };
            };
          };

      in rec {
        # the packages that we can build
        packages = rec {
          inherit backend frontend nginx;
          docker = nginx;
          default = backend;
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
