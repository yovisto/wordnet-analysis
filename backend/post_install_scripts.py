import wn
import urllib.request
import zipfile
import nltk


urllib.request.urlretrieve('https://github.com/pssvlng/open-european-wordnets-inferred/raw/main/en_inferred.zip', 'en_inferred.zip')
with zipfile.ZipFile('en_inferred.zip', 'r') as zip_ref:
    zip_ref.extractall('')

urllib.request.urlretrieve('https://github.com/pssvlng/open-european-wordnets-hybrid/raw/main/de_hybrid.zip', 'de_hybrid.zip')
with zipfile.ZipFile('de_hybrid.zip', 'r') as zip_ref:
    zip_ref.extractall('')

urllib.request.urlretrieve('https://github.com/pssvlng/open-european-wordnets-hybrid/raw/main/fr_hybrid.zip', 'fr_hybrid.zip')
with zipfile.ZipFile('fr_hybrid.zip', 'r') as zip_ref:
    zip_ref.extractall('')

urllib.request.urlretrieve('https://github.com/pssvlng/open-european-wordnets-hybrid/raw/main/es_hybrid.zip', 'es_hybrid.zip')
with zipfile.ZipFile('es_hybrid.zip', 'r') as zip_ref:
    zip_ref.extractall('')

urllib.request.urlretrieve('https://github.com/pssvlng/open-european-wordnets-hybrid/raw/main/it_hybrid.zip', 'it_hybrid.zip')
with zipfile.ZipFile('it_hybrid.zip', 'r') as zip_ref:
    zip_ref.extractall('')

urllib.request.urlretrieve('https://github.com/pssvlng/open-european-wordnets-hybrid/raw/main/nl_hybrid.zip', 'nl_hybrid.zip')
with zipfile.ZipFile('nl_hybrid.zip', 'r') as zip_ref:
    zip_ref.extractall('')

urllib.request.urlretrieve('https://github.com/pssvlng/open-european-wordnets-hybrid/raw/main/pt_hybrid.zip', 'pt_hybrid.zip')
with zipfile.ZipFile('pt_hybrid.zip', 'r') as zip_ref:
    zip_ref.extractall('')

wn.download('ewn:2020')
wn.remove('ewn:2020')
wn.add('en_inferred.xml')
wn.add('de_hybrid.xml')
wn.add('fr_hybrid.xml')
wn.add('es_hybrid.xml')
wn.add('it_hybrid.xml')
wn.add('nl_hybrid.xml')
wn.add('pt_hybrid.xml')

nltk.download('stopwords')
nltk.download('wordnet')

