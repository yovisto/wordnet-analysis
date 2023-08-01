import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Word } from '../models/word';
import { InputParams } from '../models/input-params';
import { ImageInputParams } from '../models/image-input-params';
import { WeightedWord } from '../models/weighted-word';


@Injectable({
  providedIn: 'root'
})
export class WordnetService {

  private wordnet_url = 'http://127.0.0.1:5000/api/dict/';  // URL to web api

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
    const query = `?woi=${params.woi || ''}&pos=${params.pos || ''}&lang=${params.lang || ''}&filterlang=${params.filterlang || ''}&lemma=${params.lemma || ''}&category=${params.category || ''}&wordkey=${params.wordkey || ''}`;
    return this.http.get<Word[]>(`${this.wordnet_url}words/${query}`, this.httpOptions)
      .pipe(
        tap(_ => this.log('fetched words')),
        map((results: Word[]) => {
          results.forEach(x => {
            x.identifier = "Word"
          });
          return results
        }),
        catchError(this.handleError<Word[]>('getWords', []))
      );
  }

  getWeightedWords(params: InputParams, text: string): Observable<WeightedWord[]> {
    return this.http.post<WeightedWord[]>(`${this.wordnet_url}words/weighted`, { ...params, text })
      .pipe(
        tap(_ => this.log('fetched words')),
        map((results: WeightedWord[]) => {
          results.forEach(x => {
            x.identifier = "WeightedWord"
          });
          return results
        }),
        catchError(this.handleError<WeightedWord[]>('getWeightedWords', []))
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
        })
      );
  }

  getExampleSentences(word_key: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.wordnet_url}examples/?wordkey=${word_key}`, this.httpOptions)
      .pipe(
        tap(_ => this.log('fetched examples')),
        catchError(this.handleError<string[]>('getExampleSentences', []))
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
