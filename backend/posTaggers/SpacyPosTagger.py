import spacy
from .PosTagger import PosTagger
from helpers.CommonHelper import CommonHelper

class SpacyPosTagger(PosTagger):    
    def __init__(self, lang):        
        self.nlp = spacy.load(CommonHelper.getSpacyModelName(lang))

    def tagText(self, textToTag):                  
        result = []
        try: 
            words = self.nlp(textToTag)                                
            for word in words:                        
                result.append((word.text, word.pos_, word.lemma_, word.whitespace_))
        except:
            print(f'Spacy Tagger failed on following text: {textToTag}')        
        
        return result


