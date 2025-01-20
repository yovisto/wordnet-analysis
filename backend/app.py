
import os
from urllib.parse import unquote

from flask import Flask
from flask import Response
from flask import request, send_file
from flask_cors import CORS, cross_origin

from passivlingo_dictionary.Dictionary import Dictionary
from passivlingo_dictionary.models.SearchParam import SearchParam

import nltk
from encoders.WordEncoder import WordEncoder
from helpers.SynsetClassifier import SynsetClassifier
from helpers.TextProcessor import TextProcessor
from models.ContextWord import ContextWord
from models.ContextWordWrapper import ContextWordWrapper
from models.WeightedWord import WeightedWord

from helpers.RdfHelper import RdfHelper
from imageCreation.CombinedImageWrapper import main
from bs4 import BeautifulSoup
import requests
import re
from rdflib.namespace import _SKOS, _RDFS
from config import cors_dev_config, cors_prod_config

from langdetect import detect

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
        weight_classifier = SynsetClassifier(text, nlp[lang])
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
    result = main(request.args)
    filePath = result["filePath"]

    return send_file(filePath, mimetype='image/png')    



    



