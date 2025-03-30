import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { concatMap, from, Subject, takeUntil, tap } from 'rxjs';
import { ImagePopupComponent } from '../image-popup/image-popup.component';
import { ExampleSentenceResponse } from '../models/example-sentence-response';
import { InputParams } from '../models/input-params';
import { Word } from '../models/word';
import { WordnetService } from '../services/wordnet.service';

interface StringDictionary {
  [key: string]: string;
}

interface DataObject {
  [key: string]: any;
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
  title!: string;
  inputHistory: Array<[Word[], InputParams, string]> = new Array<[Word[], InputParams, string]>
  loading: boolean = false;
  langIconClassLookup: StringDictionary = {};

  private onDestroy$: Subject<void> = new Subject<void>();

  constructor(
    private wordnetService: WordnetService,
    private cd: ChangeDetectorRef
  ) {

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

  showImage(words: Word[]) {
    const filteredWords = words.filter(x => x.pos === "Noun" || x.pos === "Verb");

    if (filteredWords.length > 0) {
      const result = Object.assign({
        fileName: "",
        synsetId: "",
        maxLeafNodes: 5,
        synonymCount: 1,
        level: 2,
        filterLangs: 'en',
        lang: 'en',
        hierarchy: "True",
        partWhole: "True"
      });
      result.synsetId = filteredWords.map(x => {
        const id = x.wordKey.split('.').reverse();
        id.pop();
        return id.join('-');
      }).join(',');
      result.filterLangs = this.getMostFrequentValue(filteredWords, 'lang') as string;
      result.lang = result.filterLangs
      result.fileName = `hierarchy_partwhole${Date.now()}_${[result.lang].join('_')}_${result.level}_${result.maxLeafNodes}_${result.synonymCount}`;
      this.popup.open(result);
    }

  }

  getRelatedWords(word: Word): void {
    if (word.relatedSynsets.length == 0) {
      const serviceInputParams = Object.assign({ ili: word.ili, lang: word.lang, wordkey: word.wordKey })
      this.wordnetService.getRelated(serviceInputParams)
        .pipe(takeUntil(this.onDestroy$))
        .subscribe({
          next: (results: Word[]) => {
            word.relatedSynsets = results;
          },
          complete: () => { ; }
        });
    }
  }

  displayRelatedWords(from_word: Word, words: Word[]): void {
    this.inputHistory.push([this.words, this.inputParams, this.title]);
    this.title = `similar to: ${from_word.name} (${from_word.pos})`;
    this.inputParams = Object.assign({ wordkey: from_word.wordKey, lang: from_word.lang, filterlang: this.inputParams.filterlang, category: 'similar to' });
    this.words = [];
    words.forEach(item => item.relatedSynsets = []);
    this.processResults(words);
  }

  setInputParams(inputParams: InputParams): void {
    this.inputParams = inputParams;
    this.inputHistory = [];
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

  getOtherLangs(word: Word): string[] {
    return (this.inputParams.filterlang?.split(',') as string[]).filter(lang => lang !== word.lang);
  }

  getLangItems(word: Word, lang: string): string[] {
    return word.genericLanguageDescriptions.descriptionLookup[lang].split(',');
  }

  getTranslation(word: Word, lang: string, woi: string): void {
    this.inputHistory.push([this.words, this.inputParams, this.title]);
    this.title = `translation: ${word.name} (${word.pos})`;
    this.inputParams = Object.assign({ ili: word.ili, lang: lang, filterlang: this.inputParams.filterlang, category: 'translation' });
    const serviceInputParams = Object.assign({ ili: word.ili, lang: lang, woi: woi })
    this.words = [];
    this.loading = true;
    this.wordnetService.getWords(serviceInputParams)
      .pipe(takeUntil(this.onDestroy$))
      .subscribe({
        next: (results: Word[]) => {
          this.processResults(results);
        },
        complete: () => this.loading = false
      });
  }

  back(): void {
    if (this.inputHistory.length > 0) {
      const p = this.inputHistory.pop() as [Word[], InputParams, string];
      this.title = p[2];
      this.inputParams = Object.assign({}, p[1]);
      this.processResults(p[0], false);
    }
  }

  hasNounOrVerb(words: Word[]): boolean {
    const filteredWords = words.filter(x => x.pos === "Noun" || x.pos === "Verb")
    return filteredWords.length > 0
  }

  getWords(word: Word, category: string, woi: (string | null) = null): void {
    this.inputHistory.push([this.words, this.inputParams, this.title]);
    this.title = `${category}: ${word.name} (${word.pos})`;
    this.inputParams = Object.assign({ wordkey: word.wordKey, lang: word.lang, filterlang: this.inputParams.filterlang, category: category });
    if (category == 'synonym') {
      const newWord = structuredClone(word) as Word;
      newWord.synonyms.push(newWord.name);
      newWord.synonyms = newWord.synonyms.filter(item => item !== woi);
      newWord.name = woi as string;
      this.processResults([newWord]);
    }
    else {
      this.search();
    }
  }

  private processResults(results: Word[], withSenseExamples: boolean = true): void {
    const filteredResults = withSenseExamples ? results.filter(result => result.lang == "en") : [];
    const observer = {
      next: (result: ExampleSentenceResponse) => {
        if (!this.loading) { this.loading = true }
        if (result) {
          const word = results.find(x => x.wordKey == result.word_key && x.lang == result.lang);
          if (word) {
            word.example = result.sentence;
          }
        }
      },
      error: (err: any) => {
        console.error('An error occurred:', err);
      },
      complete: () => {
        this.loading = false;
        results.forEach(item => !item.definition ? item.definition = item.synonyms.join(', ') : item.definition);
        this.words = results;
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

  private search(): void {
    this.words = []
    this.loading = true;

    this.wordnetService.getWords(this.inputParams)
      .pipe(takeUntil(this.onDestroy$))
      .subscribe({
        next: (results: Word[]) => {
          this.processResults(results);
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
