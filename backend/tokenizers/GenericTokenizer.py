from .Tokenizer import Tokenizer
import nltk
from nltk.tokenize import word_tokenize
from helpers.Constants import DOMAIN_NAMES
from nltk.corpus import stopwords
from helpers.CommonHelper import CommonHelper
from models.ContextWord import ContextWord
from posTaggers.PosTagger import PosTagger

class GenericTokenizer(Tokenizer):

    def __init__(self, words, lang, posTagger, useDisambiguation = False):
        super().__init__(words, lang)        
        self.posTagger = posTagger
        self.useDisambiguation = useDisambiguation
        self.wordSenseProvider = Tokenizer.getWordSenseProvider(self.lang)        

    def tokenize(self, text = None):     
        result = []               
        if text:            
            self.words = text
        wordTags = self.posTagger.tagText(self.words)        
        stopWords = set(stopwords.words(CommonHelper.getWordnetLangDescription(self.lang)))        
        
        for t in wordTags:            
            word = ContextWord()            
            word.name = t[0]
            word.whitespace = t[3]
            if len([x for x in ["'", "...", "…", "`", '"'] if x in t[0]]) <= 0 and t[1] in ['VERB', 'NOUN', 'ADV', 'ADJ'] and t[0].lower() not in stopWords:                
                word.pos = CommonHelper.getSpacyToWordnetPosMapping(t[1])                     
                word.lemma = t[2]

            result.append(word)        
        return result