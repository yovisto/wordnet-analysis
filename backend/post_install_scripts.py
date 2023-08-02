import wn
import urllib.request
import zipfile
import nltk


urllib.request.urlretrieve('https://github.com/pssvlng/open-european-wordnets-inferred/raw/main/en_inferred.zip', 'en_inferred.zip')
with zipfile.ZipFile('en_inferred.zip', 'r') as zip_ref:
    zip_ref.extractall('')

urllib.request.urlretrieve('https://github.com/pssvlng/open-european-wordnets-hybrid/raw/main/de_hybrid.xml', 'de_hybrid.xml')

wn.download('ewn:2020')
wn.remove('ewn:2020')
wn.add('en_inferred.xml')
wn.add('de_hybrid.xml')

nltk.download('stopwords')
nltk.download('wordnet')

