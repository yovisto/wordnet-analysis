from ast import List
import nltk
from urllib.parse import unquote
from helpers.FactoryMethods import FactoryMethods
from posTaggers.SpacyPosTagger import SpacyPosTagger
from tokenizers.GenericTokenizer import GenericTokenizer

class TextProcessor:    

    def __init__(self, lang = None):
        self.tokenizer = None
        if lang:
            self.tokenizer = GenericTokenizer('', lang, SpacyPosTagger(lang))    
    
    def tokenizeParagraph(self, paragraph: str):
        if paragraph is None:
            raise ValueError("Invalid argument list: 'paragraph' required")

        paragraph = unquote(paragraph)
        return nltk.sent_tokenize(paragraph)

    def tokenizeSentence(self, sentence: str, lang: str):
        if None in [sentence, lang]:
            raise ValueError(
                "Invalid argument list: 'lang' and 'sent' required")

        sentence = unquote(sentence)
        if not self.tokenizer:
            self.tokenizer = FactoryMethods.getTokenizer(sentence, lang)            

        return self.tokenizer.tokenizeSentence(sentence)

    def __repr__(self):
        return 'TextProcessor()'

    def __str__(self):
        return 'TextProcessor()'
