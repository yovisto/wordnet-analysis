from backend.lemmatizers.DefaultLemmatizer import DefaultLemmatizer
from backend.tokenizers.DefaultTokenizer import DefaultTokenizer
from backend.tokenizers.GenericTokenizer import GenericTokenizer
from backend.tokenizers.EnglishTokenizer import EnglishTokenizer
from backend.posTaggers.NltkPosTagger import NltkPosTagger
from backend.posTaggers.SpacyPosTagger import SpacyPosTagger
from urllib.parse import unquote
from nltk.corpus import wordnet as wn 

class FactoryMethods:        

    @classmethod
    def getTokenizer(cls, sent, lang):
        return GenericTokenizer(unquote(sent), lang, SpacyPosTagger(lang))    
        
    @classmethod
    def getLemmatizer(cls, lang):        
        return DefaultLemmatizer()    
