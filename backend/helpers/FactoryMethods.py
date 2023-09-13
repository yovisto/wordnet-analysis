from lemmatizers.DefaultLemmatizer import DefaultLemmatizer
from tokenizers.DefaultTokenizer import DefaultTokenizer
from tokenizers.GenericTokenizer import GenericTokenizer
from tokenizers.EnglishTokenizer import EnglishTokenizer
from posTaggers.NltkPosTagger import NltkPosTagger
from posTaggers.SpacyPosTagger import SpacyPosTagger
from urllib.parse import unquote
from nltk.corpus import wordnet as wn 

class FactoryMethods:        

    @classmethod
    def getTokenizer(cls, sent, lang, hasNamedEntities=False):
        return GenericTokenizer(unquote(sent), lang, SpacyPosTagger(lang, hasNamedEntities=hasNamedEntities))    
        
    @classmethod
    def getLemmatizer(cls, lang):        
        return DefaultLemmatizer()    
