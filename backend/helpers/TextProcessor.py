from ast import List
import nltk
from urllib.parse import unquote
from helpers.FactoryMethods import FactoryMethods
from posTaggers.SpacyPosTagger import SpacyPosTagger
from tokenizers.GenericTokenizer import GenericTokenizer

class TextProcessor:    

    def __init__(self, lang = None, hasNamedEntities = False, spacyModel = None):
        self.tokenizer = None
        self.hasNameEntities = hasNamedEntities        
        if lang:
            self.tokenizer = GenericTokenizer('', lang, SpacyPosTagger(lang, hasNamedEntities=self.hasNameEntities, spacyModel = spacyModel))    
    
    def tokenizeParagraph(self, paragraph: str):
        if paragraph is None:
            raise ValueError("Invalid argument list: 'paragraph' required")

        paragraph = unquote(paragraph)
        return nltk.sent_tokenize(paragraph)

    def tokenizeSentence(self, sentence: str, lang: str, spacyModel=None):
        if sentence == None:
            raise ValueError(
                "Invalid argument list: 'sent' required")

        sentence = unquote(sentence)
        if spacyModel:
            self.tokenizer = GenericTokenizer('', lang, SpacyPosTagger(lang, hasNamedEntities=self.hasNameEntities, spacyModel = spacyModel))    

        return self.tokenizer.tokenizeSentence(sentence)

    def __repr__(self):
        return 'TextProcessor()'

    def __str__(self):
        return 'TextProcessor()'
