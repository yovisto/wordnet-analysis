import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { catchError, map, tap, timeout } from 'rxjs/operators';
import { ExampleSentenceResponse } from '../models/example-sentence-response';
import { ImageInputParams } from '../models/image-input-params';
import { InputParams } from '../models/input-params';
import { Word } from '../models/word';


@Injectable({
  providedIn: 'root'
})
export class WordnetService {

  private wordnet_url = 'http://127.0.0.1:5000/api/dict/';  // URL to web api
  private sense_example_sentence_url = "https://edu.yovisto.com/sparql?default-graph-uri=&query=select+distinct+%3Fsentence+where+%7B%0D%0A%3Fs+a+%3Chttp%3A%2F%2Fwww.w3.org%2Fns%2Flemon%2Fontolex%23LexicalSense%3E+.%0D%0A%3Fs+%3Chttp%3A%2F%2Fwww.w3.org%2Fns%2Flemon%2Fontolex%23isLexicalizedSenseOf%3E+%3C__X__%3E+.%0D%0A%3Fs+%3Chttps%3A%2F%2Fglobalwordnet.github.io%2Fschemas%2Fwn%23example%3E+%3Fblank+.%0D%0A%3Fblank+rdf%3Avalue+%3Fsentence+.%0D%0A%3Flexical_entry+%3Chttp%3A%2F%2Fwww.w3.org%2Fns%2Flemon%2Fontolex%23sense%3E+%3Fs+.%0D%0A%3Flexical_entry+%3Chttp%3A%2F%2Fwww.w3.org%2Fns%2Flemon%2Fontolex%23canonicalForm%3E+%3Fcanon_form+.%0D%0A%3Fcanon_form+%3Chttp%3A%2F%2Fwww.w3.org%2Fns%2Flemon%2Fontolex%23writtenRep%3E+%3Fwritten_rep.+%0D%0A%0D%0AFILTER%28REGEX%28STR%28%3Fwritten_rep%29%2C+%22__Y__%22%2C+%22i%22%29%29%0D%0A%7D+%0D%0A%0D%0A&format=application%2Fsparql-results%2Bjson&should-sponge=&timeout=0&signal_void=on";

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
      'Access-Control-Allow-Methods': 'POST, GET, DELETE, OPTIONS',
    })
  };

  constructor(private http: HttpClient) { }

  getWords(params: InputParams): Observable<Word[]> {
    const query = `?woi=${params.woi || ''}&pos=${params.pos || ''}&lang=${params.lang || ''}&filterlang=${params.filterlang || ''}&lemma=${params.lemma || ''}&category=${params.category || ''}&wordkey=${params.wordkey || ''}&ili=${params.ili || ''}`;
    return this.http.get<Word[]>(`${this.wordnet_url}words/${query}`, this.httpOptions)
      .pipe(
        tap(_ => this.log('fetched words')),
        map((results: Word[]) => {
          results.forEach(x => {
            x.identifier = "Word";
            x.relatedSynsets = [];
            const woi = params.woi ? params.woi : "";
            if (x.synonyms.includes(woi)) {
               x.synonyms.push(x.name);
               x.synonyms = x.synonyms.filter(item => item !== woi);
               x.name = woi;
             }
          });

          results = results.sort((a, b) => a.lang.localeCompare(b.lang));
          const matchingObjects = results.filter(x => x.lang === "en");          
          const remainingObjects = results.filter(x => x.lang != "en");          
          return [...matchingObjects, ...remainingObjects];
        }),
        catchError(this.handleError<Word[]>('getWords', []))
      );
  }

  getRelated(params: InputParams): Observable<Word[]> {
    const query = `?lang=${params.lang || ''}&wordkey=${params.wordkey || ''}&ili=${params.ili || ''}`;
    return this.http.get<Word[]>(`${this.wordnet_url}related/${query}`, this.httpOptions)
      .pipe(
        tap(_ => this.log('fetched related')),
        map((results: Word[]) => {
          results.forEach(x => {
            x.identifier = "Word";            
          });
          return results
        }),
        catchError(this.handleError<Word[]>('getRelated', []))
      );
  }

  getImage(params: ImageInputParams): Observable<string> {
    const query = `?synsetId=${params.synsetId || ''}&fileName=${params.fileName || ''}&level=${params.level || ''}&filterLangs=${params.filterLangs || ''}&hierarchy=${params.hierarchy || ''}&partWhole=${params.partWhole || ''}&maxLeafNodes=${params.maxLeafNodes || ''}&synonymCount=${params.synonymCount || ''}`;
    return this.http.get(`${this.wordnet_url}image/${query}`, { responseType: 'arraybuffer' })
      .pipe(
        map((imageArrayBuffer: ArrayBuffer) => {
          const base64String = btoa(
            new Uint8Array(imageArrayBuffer)
              .reduce((data, byte) => data + String.fromCharCode(byte), '')
          );
          return `data:image/png;base64, ${base64String}`;
        }),
        catchError(this.handleError<string>('getImageInputParams'))
      );
  }

  getExampleSentences(word_key: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.wordnet_url}examples/?wordkey=${word_key}`, this.httpOptions)
      .pipe(
        tap(_ => this.log('fetched examples')),
        catchError(this.handleError<string[]>('getExampleSentences', []))
      );
  }

  getSenseExampleSentence(word_key: string, lemma: string, lang: string): Observable<ExampleSentenceResponse> {
    if (lang != "en") {
      throw new Error('Invalid argument: language must be "en"');
    }
    const word_key_list = word_key.split(".")
    const synset_url = `https://edu.yovisto.com/resource/wordnet/en/id/oewn-${word_key_list[2]}-${word_key_list[1]}`;
    const url = this.sense_example_sentence_url.replace("__X__", synset_url).replace("__Y__", lemma);
    return this.http.get<any>(url).pipe(
      timeout(200),
      map((response) => {
        return {
          word_key: word_key,
          sentence: response.results.bindings.length > 0 ? response.results.bindings[0].sentence.value : "",
          lang: lang
        }
      }),
      catchError(this.handleError<ExampleSentenceResponse>('getSenseExampleSentence'))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  private log(message: string) {
    console.log(`WordNetService: ${message}`);
  }


}
