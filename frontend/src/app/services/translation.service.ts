import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private translations: { [lang: string]: any } = {};

  constructor(private http: HttpClient) { }

  public preloadTranslations(): Observable<any> {
    const languages = ['en', 'fr', 'it', 'pt', 'es', 'nl', 'de'];
    const requests = languages.map((lang) =>
      this.http.get(`/assets/i18n/${lang}.json`).pipe(
        tap((data) => {
          this.translations[lang] = data;
        })
      )
    );
    return forkJoin(requests);
  }

  public translate(key: string, lang: string): string {
    return this.translations[lang]?.[key] || key; 
  }
}