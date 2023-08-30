from .PosTagger import PosTagger
import nltk
from nltk.tokenize import word_tokenize

class NltkPosTagger(PosTagger):    
        
    def tagText(self, textToTag):                  
        tokens = nltk.word_tokenize(textToTag)                
        return nltk.pos_tag(tokens)        
    