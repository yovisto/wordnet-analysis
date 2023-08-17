import spacy
from .PosTagger import PosTagger
from backend.helpers.CommonHelper import CommonHelper

class SpacyPosTagger(PosTagger):    
    def __init__(self, lang):        
        self.nlp = spacy.load(CommonHelper.getSpacyModelName(lang))

    def tagText(self, textToTag):                  
        words = self.nlp(textToTag)                        
        result = []
        for word in words:                        
            result.append((word.text, word.pos_, word.lemma_, word.whitespace_))
        return result


