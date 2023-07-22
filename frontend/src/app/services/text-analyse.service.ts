import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { Word } from '../models/word';
import { ContextWord } from '../models/context-word';

@Injectable({
  providedIn: 'root'
})
export class TextAnalyseService {

  private wordnet_url = 'http://127.0.0.1:5000/api/dict/';  // URL to web api
  private tokenize_text_url = 'http://127.0.0.1:5000/api/shared/tokenize/'

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

  getWords(woi: string, filterlang: string): Observable<Word[]> {
    return this.http.get<Word[]>(`${this.wordnet_url}words/?woi=${woi}&filterlang=${filterlang}`, this.httpOptions)
      .pipe(
        tap(_ => this.log('fetched words')),
        catchError(this.handleError<Word[]>('getWords', []))
      );
  }

  tokenizeText(text: string, lang: string): Observable<ContextWord[]> {
    return this.http.get<ContextWord[]>(`${this.tokenize_text_url}word/?sent=${text}&lang=${lang}`, this.httpOptions)
      .pipe(
        tap(_ => this.log('tokenized Text')),
        catchError(this.handleError<ContextWord[]>('getWords', []))
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
