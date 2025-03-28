import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics import DistanceMetric

from flask import Flask
from flask import Response
from flask import request, send_file
from flask_cors import cross_origin

from passivlingo_dictionary.Dictionary import Dictionary
from passivlingo_dictionary.models.SearchParam import SearchParam
from encoders.WordEncoder import WordEncoder
from imageCreation.CombinedImageWrapper import main
import wn

app = Flask(__name__)

# if os.environ.get("FLASK_ENV") == "production":    
#     CORS(app, resources={r"/api/*": cors_prod_config})
# else:    
#     CORS(app, resources={r"/api/*": cors_dev_config})        

#if torch.cuda.is_available():
#    model = SentenceTransformer("all-MiniLM-L6-v2", device='cuda')
#else:
#    model = SentenceTransformer("all-MiniLM-L6-v2", device='cpu')    

pos_mappings = {
    "a": "Abverb",
    "s": "Adjective",
    "r": "Adjective",
    "v": "Verb",
    "n": "Noun"
}

model = SentenceTransformer("all-MiniLM-L6-v2", device='cpu')    
df = pd.read_csv('wordnet_txt_embeddings_input.csv', sep='\t', header=0, index_col=None)
#embedding_arr = np.load('embeddings.npy')
embedding_arr = model.encode(df['text'])

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
    ili = request.args['ili'] if 'ili' in request.args and request.args['ili'] else None
    
    if len(request.args) > 8:
        message = 'Invalid argument list, possible combinations: (ili, lang), (woi), (wordkey, lang, category), (woi, lang, category), (woi, lang, pos, lemma)'
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
        param.ili = ili

        return Response(WordEncoder().encode(dict.findWords(param)), mimetype='application/json')
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

@app.route('/api/dict/related/', methods=['GET'])
@cross_origin()
def getRelated():
    def getExclusions(ili):
        exclusions = []
        dict = Dictionary()        
        param = SearchParam()    
        param.lang = lang
        param.wordkey = wordkey
        exclusions.append(ili)
        for category in ['hypernym', 'hyponym', 'holonym', 'meronym', 'entailment', 'antonym']:        
            param.category = category
            sub_results = dict.findWords(param)
            exclusions.extend([r.ili for r in sub_results])
        return exclusions
        
    wordkey = request.args['wordkey'] if 'wordkey' in request.args else None
    ili = request.args['ili'] if 'ili' in request.args else None
    lang = request.args['lang'] if 'lang' in request.args else None
    if None in [ili, lang]:
        message = "Invalid argument list: 'ili' and 'wordkey' are required"
        return Response(response='{"message":"' + message + '"}', status=404, mimetype="application/json")

    synset = wn.synsets(ili=ili, lang='en')[0]
    query_txt = f'{", ".join(synset.lemmas())} (Part of Speech = {pos_mappings[synset.pos]}): {synset.definition()}'
    if synset.pos == "n" or synset.pos == "v":
        query_txt =  f'{", ".join(synset.lemmas())} (Part of Speech = {pos_mappings[synset.pos]}, Category = {synset.metadata()["subject"].split(".")[1]}): {synset.definition()}'

    query_embedding = model.encode(query_txt)
    dist = DistanceMetric.get_metric('euclidean')
    dist_arr = dist.pairwise(embedding_arr, query_embedding.reshape(1, -1)).flatten()
    idist_arr_sorted = np.argsort(dist_arr)    
    
    exclusions = getExclusions(ili)
    final_results = []
    dict = Dictionary()        
    param = SearchParam()
    param.lang = lang                
    for val in df['ili'].iloc[idist_arr_sorted[:10 + len(exclusions)]].values:
        if val not in exclusions:
            param.ili = val
            word = dict.findWords(param)[0]        
            final_results.append(word)       
            if len(final_results) == 10: break     

    return Response(WordEncoder().encode(final_results), mimetype='application/json')

@app.route('/api/dict/image/', methods=['GET'])
@cross_origin()
def getImage():    
    result = main(request.args)
    filePath = result["filePath"]

    return send_file(filePath, mimetype='image/png')    



    



