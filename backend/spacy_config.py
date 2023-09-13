import spacy

def create_pipeline_en():
    nlp = spacy.load('en_core_web_lg')    
    nlp.add_pipe('dbpedia_spotlight', config={'confidence': 0.99}, last=True)
    return nlp

def create_pipeline_de():
    nlp = spacy.load('de_core_news_lg')    
    nlp.add_pipe('dbpedia_spotlight', config={'confidence': 0.99}, last=True)
    return nlp