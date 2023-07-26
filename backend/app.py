
from urllib.parse import unquote

from flask import Flask
from flask import Response
from flask import request, send_file
from flask_cors import cross_origin

from passivlingo_dictionary.Dictionary import Dictionary
from passivlingo_dictionary.models.SearchParam import SearchParam

import nltk
from encoders.WordEncoder import WordEncoder
from helpers.SynsetClassifier import SynsetClassifier
from helpers.TextProcessor import TextProcessor
from models.ContextWordWrapper import ContextWordWrapper
from models.WeightedWord import WeightedWord

from helpers.FactoryMethods import FactoryMethods
from helpers.Constants import VALID_EU_LANGS
from imageCreation.CombinedImageWrapper import main
from bs4 import BeautifulSoup
import requests
import re


app = Flask(__name__)

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
    
        words = dict.findWords(param);
        weight_classifier = SynsetClassifier(text, lang)
        results = []
        for word in words:
            result = WeightedWord()
            result = word
            param = SearchParam()
            param.lang = lang
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

# General text analysis endpoints
@app.route('/api/shared/tokenize/sentence/', methods=['GET'])
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
    return Response(WordEncoder().encode(txtProcessor.tokenizeSentence(sent, lang)), mimetype='application/json')

@app.route('/api/shared/tokenize/url/', methods=['POST'])
@cross_origin()
def tokenizeUrl():    
    def returnError(url, status_code, msg):
        message = f"Failed to parse url: {url} - {msg}"
        return Response(response='{"message":"' + message + '"}', status=status_code, mimetype="application/json")
    def visible(element):
        if element.parent.name in ['style', 'script', 'head', 'title', 'meta', '[document]']:
            return False
        elif re.match(r'<!--.*-->', str(element)):
            return False
        return True
    
    lang = request.json['lang']
    url = request.json['url']
    if None in [lang, url]:
        message = "Invalid argument list: 'lang' and 'url' required"
        return Response(response='{"message":"' + message + '"}', status=404, mimetype="application/json")

    try:    
       
        response = requests.get(url)
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')                        
            visible_text = soup.findAll(text=True)
            visible_text = filter(visible, visible_text)
            text = " ".join(visible_text)
            
        else:
            returnError(url, response.status_code, '')

        text = unquote(text)
        result = ContextWordWrapper()
        txtProcessor = TextProcessor()               
        result.text = text
        result.contextWords = txtProcessor.tokenizeSentence(text, lang)
        return Response(WordEncoder().encode(result), mimetype='application/json')

    except requests.RequestException as e:
        returnError(url, 500, e)

    



