import platform 
import os
from urllib.parse import unquote

from flask import Flask
from flask import Response
from flask import request, send_file
from flask_cors import CORS, cross_origin

from passivlingo_dictionary.Dictionary import Dictionary
from passivlingo_dictionary.models.SearchParam import SearchParam

import nltk
from backend.encoders.WordEncoder import WordEncoder
from backend.helpers.SynsetClassifier import SynsetClassifier
from backend.helpers.TextProcessor import TextProcessor
from backend.helpers.RdfHelper import RdfHelper
from backend.models.ContextWord import ContextWord
from backend.models.ContextWordWrapper import ContextWordWrapper
from backend.models.WeightedWord import WeightedWord
from backend.imageCreation.CombinedImageWrapper import main as imageCreation


from bs4 import BeautifulSoup
import requests
import re
from rdflib.namespace import _SKOS, _RDFS
from backend.config import cors_dev_config, cors_prod_config

app = Flask(__name__)

# if os.environ.get("FLASK_ENV") == "production":    
#     CORS(app, resources={r"/api/*": cors_prod_config})
# else:    
#     CORS(app, resources={r"/api/*": cors_dev_config})        

# dictionary endpoints
@app.route('/api/dict/words/', methods=['GET'])
@cross_origin()
def words():
    wordkey = request.args['wordkey'] if 'wordkey' in request.args and request.args['wordkey'] else None
    category = request.args['category'] if 'category' in request.args and request.args['category'] else None
    lang = request.args['lang'] if 'lang' in request.args and request.args['lang'] else None
    woi = request.args['woi'] if 'woi' in request.args and request.args['woi'] else None
    lemma = request.args['lemma'] if 'lemma' in request.args and request.args['lemma'] else None
    pos = request.args['pos'] if 'pos' in request.args and request.args['pos'] else None
    filterLang = request.args['filterlang'] if 'filterlang' in request.args and request.args['filterlang'] else None

    if len(request.args) > 7:
        message = 'Invalid argument list, possible combinations: (woi), (wordkey, lang, category), (woi, lang, category), (woi, lang, pos, lemma)'
        return Response(response='{"message":"' + message + '"}', status=404, mimetype="application/json")

    try:
        dict = Dictionary()
        param = SearchParam()
        param.wordkey = wordkey
        param.category = category
        param.lang = lang
        param.woi = woi
        param.lemma = lemma
        param.pos = pos
        param.filterLang = filterLang        
        
        return Response(WordEncoder().encode(dict.findWords(param)), mimetype='application/json')
    except ValueError as err:
        return Response(response='{"message":"' + format(err) + '"}', status=404, mimetype="application/json")

@app.route('/api/dict/words/weighted', methods=['POST'])
@cross_origin()
def weightedWords():        
    lang = request.json['lang']
    filterlang = request.json['filterlang']
    woi = request.json['woi'] 
    lemma = request.json['lemma']
    pos = request.json['pos']        
    text = request.json['text']

    try:
        dict = Dictionary()
        param = SearchParam()    
        param.lang = lang
        param.woi = woi
        param.lemma = lemma
        param.pos = pos
        param.filterLang = filterlang
    
        words = dict.findWords(param);
        weight_classifier = SynsetClassifier(text, lang)
        results = []
        for word in words:
            result = WeightedWord()
            result = word
            param = SearchParam()
            param.lang = lang
            param.filterLang = filterlang
            param.wordkey = word.wordKey
            param.category = 'hypernym'
            hypernyms = dict.findWords(param)

            hypernyms_flat = [item for sublist in [x.synonyms for x in hypernyms] for item in sublist]
            result.weight = weight_classifier.classify(result.synonyms, list(set(hypernyms_flat)))
            results.append(result)
        
        return Response(WordEncoder().encode(results), mimetype='application/json')
    except ValueError as err:
        return Response(response='{"message":"' + format(err) + '"}', status=404, mimetype="application/json")    

@app.route('/api/dict/examples/', methods=['GET'])
@cross_origin()
def examples():
    wordkey = request.args['wordkey'] if 'wordkey' in request.args else None
    if wordkey is None:
        message = "Invalid argument list: 'wordkey' is required"
        return Response(response='{"message":"' + message + '"}', status=404, mimetype="application/json")

    dict = Dictionary()        
    return Response(WordEncoder().encode(dict.getExampleSentences(wordkey)), mimetype='application/json')

@app.route('/api/dict/image/', methods=['GET'])
@cross_origin()
def getImage():    
    result = imageCreation(request.args)
    filePath = result["filePath"]

    return send_file(filePath, mimetype='image/png')    

# General text analysis endpoints
@app.route('/api/shared/tokenize/sentence/', methods=['GET'])
@cross_origin()
def tokenizeParagraph():
    paragraph = request.args['paragraph'] if 'paragraph' in request.args else None
    if paragraph is None:
        message = "Invalid argument list: 'paragraph' is required"
        return Response(response='{"message":"' + message + '"}', status=404, mimetype="application/json")

    paragraph = unquote(paragraph)
    return Response(WordEncoder().encode(nltk.sent_tokenize(paragraph)), mimetype='application/json')

@app.route('/api/shared/tokenize/word/', methods=['POST'])
@cross_origin()
def tokenizeSentence():    
    lang = request.json['lang']
    sent = request.json['sent']
    if None in [lang, sent]:
        message = "Invalid argument list: 'lang' and 'sent' required"
        return Response(response='{"message":"' + message + '"}', status=404, mimetype="application/json")

    sent = unquote(sent)
    txtProcessor = TextProcessor()            
    return Response(WordEncoder().encode([txtProcessor.tokenizeSentence(sent, lang)]), mimetype='application/json')

def __get_rdf_response(url, lang):
    accept_headers = ['application/rdf+xml', 'text/turtle', 'application/ld+json']
    graph = RdfHelper.get_rdf_graph(url, accept_headers)
    if graph:
        result = ContextWordWrapper()
        result.is_rdf = True
        literals = RdfHelper.get_literals_in_rdf_graph(graph, lang)
        result.rdfLiterals = literals[0]
        result.rdfNonLiterals = RdfHelper.get_non_literals_in_rdf_graph(graph)        
        txtProcessor = TextProcessor()
        for literal in result.rdfLiterals:                                    
            literal.lang = literals[1]
            try:
                literal.contextWords = txtProcessor.tokenizeSentence(literal.text, literal.lang)                    
            except:    
                word = ContextWord()
                word.name = literal.text
                literal.contextWords = [word]

        return Response(WordEncoder().encode(result), mimetype='application/json')
    
    return None

@app.route('/api/shared/tokenize/url/', methods=['POST'])
@cross_origin()
def tokenizeUrl():    
    def returnError(url, status_code, msg):
        message = f"Failed to parse url: {url} - {msg}"
        return Response(response='{"message":"' + message + '"}', status=status_code, mimetype="application/json")    
    
    lang = request.json['lang']
    url = request.json['url']
    if None in [lang, url]:
        message = "Invalid argument list: 'lang' and 'url' required"
        return Response(response='{"message":"' + message + '"}', status=404, mimetype="application/json")

    rdf_response = __get_rdf_response(url, lang)
    if rdf_response:
        return rdf_response

    try:           
        response = requests.get(url)                
        result = ContextWordWrapper()        
        txtProcessor = TextProcessor(lang)               
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')                        
            elements = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'])
            for element in elements:    
                text = element.text.strip()    
                result.text += text
                contextWords = txtProcessor.tokenizeSentence(text, lang)                        
                result.contextWords.append(contextWords)                            
        else:
            returnError(url, response.status_code, '')        
        
        return Response(WordEncoder().encode(result), mimetype='application/json')

    except requests.RequestException as e:
        returnError(url, 500, e)
        
def main():
    import multiprocessing
    import gunicorn.app.base

    def number_of_workers():
        return (multiprocessing.cpu_count() * 2) + 1

    class StandaloneApplication(gunicorn.app.base.BaseApplication):
        def __init__(self, app, options=None):
            self.options = options or {}
            self.application = app
            super().__init__()

        def load_config(self):
            config = {key: value for key, value in self.options.items()
                      if key in self.cfg.settings and value is not None}
            for key, value in config.items():
                self.cfg.set(key.lower(), value)

        def load(self):
            return self.application

    options = {
        'bind': '%s:%s' % ('0.0.0.0', '5000'),
        'workers': number_of_workers(),
    }
    StandaloneApplication(app, options).run()


if __name__ == "__main__":
    main()
