import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { concatMap, from, Subject, takeUntil, tap } from 'rxjs';
import { ImagePopupComponent } from '../image-popup/image-popup.component';
import { ExampleSentenceResponse } from '../models/example-sentence-response';
import { ImageInputParams } from '../models/image-input-params';
import { InputParams } from '../models/input-params';
import { Word } from '../models/word';
import { WordnetService } from '../services/wordnet.service';

interface StringDictionary {
  [key: string]: string;
}

interface DataObject {
  [key: string]: any; // This allows for any property with any value type
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild('popup') popup!: ImagePopupComponent;

  @Input() inputParams!: InputParams;
  @Input() fromText!: string;

  words: Word[] = [];
  imageParams!: ImageInputParams;
  title!: string;
  woi:string | null = null;
  inputParamsHistory: Array<[InputParams, string, string | null]> = new Array<[InputParams, string, string | null]>;
  loading: boolean = false;
  langIconClassLookup: StringDictionary = {};

  private onDestroy$: Subject<void> = new Subject<void>();

  constructor(
    private wordnetService: WordnetService,
    private cd: ChangeDetectorRef
  ) {

  }

  getImageParams(wordKey: string): ImageInputParams {
    const result = { ...this.imageParams };
    const synsetId = wordKey.split('.').reverse();
    synsetId.pop();
    result.synsetId = synsetId.join('-');
    return result;
  }

  private getMostFrequentValue<T extends DataObject>(arr: T[], property: keyof T): T[keyof T] | null {
    const frequencyMap: Record<string, number> = {};

    arr.forEach(obj => {
      const value = obj[property];
      if (value !== undefined) {
        frequencyMap[value] = (frequencyMap[value] || 0) + 1;
      }
    });

    let mostFrequentValue: T[keyof T] | null = null;
    let maxCount = 0;

    for (const [value, count] of Object.entries(frequencyMap)) {
      if (count > maxCount) {
        maxCount = count;
        mostFrequentValue = value as T[keyof T];
      }
    }

    return mostFrequentValue;
  }

  showImage(word: Word | null) {
    const result = { ...this.imageParams };
    if (word != null) {
      const synsetId = word.wordKey.split('.').reverse();
      synsetId.pop();
      result.synsetId = synsetId.join('-');
      result.filterLangs = word.lang;
    }
    else {
      result.filterLangs = this.getMostFrequentValue(this.words, 'lang') as string;
    }
    result.lang = result.filterLangs

    if (result && result.synsetId) {
      result.fileName = `hierarchy_partwhole${Date.now()}${[result.lang].join('_')}_${this.imageParams.level}_${this.imageParams.maxLeafNodes}${this.imageParams.synonymCount}`;
      this.popup.open(result);
    }

  }

  setInputParams(inputParams: InputParams): void {
    this.inputParams = inputParams;
    this.inputParamsHistory = [];
    this.refreshView();
  }

  refreshView(): void {
    if (this.inputParams.lemma) {
      this.title = `${this.inputParams.lemma}(${this.inputParams.pos})`
    }
    else if (this.inputParams.woi) {
      this.title = this.inputParams.woi;
    }

    this.search();
    this.cd.detectChanges();
  }

  back(): void {
    if (this.inputParamsHistory.length > 0) {
      const p = this.inputParamsHistory.pop() as [InputParams, string,  string | null];
      this.title = p[1];
      this.woi = p[2];
      this.inputParams = Object.assign({}, p[0]);
      this.search(p[2]);
    }
  }

  getWords(word: Word, category: string, woi: (string | null) = null): void {
    this.inputParamsHistory.push([this.inputParams, this.title, this.woi]);
    this.title = `${category}: ${word.name}(${word.pos})`;
    this.woi = category == 'synonym' ? woi : null;
    this.inputParams = Object.assign({ wordkey: word.wordKey, lang: word.lang, filterlang: this.inputParams.filterlang, category: category });
    woi ? this.search(woi) : this.search();
  }

  private process_results(results: Word[], word_key: (string | null) = null): void {
    const filteredResults = results.filter(result => result.lang == "en");
    const observer = {
      next: (result: ExampleSentenceResponse) => {
        this.loading = true;
        const word = results.find(x => x.wordKey == result.word_key && x.lang == result.lang);
        if (word) {
          word.example = result.sentence;
        }
      },
      error: (err: any) => {
        console.error('An error occurred:', err);
      },
      complete: () => {
        this.loading = false;
        if (word_key) {
          const item_of_interest = results.find(word => word.wordKey === word_key);
          if (item_of_interest) {
            results = [item_of_interest];            
          }
        };
        this.words = results;
        if (this.words.length > 0) {
          const fileName = `hierarchy_partwhole${Date.now()}${['de'].join('_')}_2_5_1`;
          const params = Object.assign({
            fileName: fileName,
            synsetId: this.words.map(x => {
              const id = x.wordKey.split('.').reverse();
              id.pop();
              return id.join('-');
            }).join(','),
            level: 2,
            maxLeafNodes: 5,
            synonymCount: 1,
            filterLangs: 'en',
            lang: 'en',
            hierarchy: "True",
            partWhole: "True"
          });
          this.imageParams = params;
        }
      }
    };
    from(filteredResults).pipe(
      concatMap(item =>
        this.wordnetService.getSenseExampleSentence(item.wordKey, item.name, "en").pipe(
          tap(result => console.log(`Result for ID ${item}:`, result))
        )
      )
    )
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(observer);
  }

  private search(woi: (string | null) = null): void {
    this.loading = true;    
    let word_key: (string | null);    
    let serviceInputParams = this.inputParams;
    if (woi) {
      if (this.inputParams.wordkey) { word_key = this.inputParams.wordkey }
      serviceInputParams = Object.assign({ woi: woi, filterlang: this.inputParams.filterlang })
    }
    
    this.wordnetService.getWords(serviceInputParams)
      .pipe(takeUntil(this.onDestroy$))
      .subscribe({
        next: (results: Word[]) => {
          this.process_results(results, word_key);
        },
        complete: () => this.loading = false
      });
  }

  ngAfterViewInit(): void {
    if (this.inputParams) {
      this.refreshView();
    }
  }

  ngOnInit(): void {
    this.langIconClassLookup = {
      'en': 'fi fi-gb',
      'de': 'fi fi-de',
      'fr': 'fi fi-fr',
      'es': 'fi fi-es',
      'it': 'fi fi-it',
      'nl': 'fi fi-nl',
      'pt': 'fi fi-pt'
    };
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  onGetExamples(word: Word): void {
    this.loading = true;
    this.wordnetService.getExampleSentences(word.wordKey)
      .pipe(takeUntil(this.onDestroy$))
      .subscribe({
        next: (examples: string[]) => {
          console.log(examples)
        },
        complete: () => this.loading = false
      });
  }

}
