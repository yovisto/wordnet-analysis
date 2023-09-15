import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ImageInputParams } from '../models/image-input-params';
import { InputParams } from '../models/input-params';
import { WeightedWord } from '../models/weighted-word';
import { Word } from '../models/word';
import { WordnetService } from '../services/wordnet.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements AfterViewInit, OnDestroy {

  @Input() inputParams!: InputParams;
  @Input() fromText!: string;

  words: (Word | WeightedWord)[] = [];
  imageParams!: ImageInputParams;
  title!: string;
  inputParamsHistory: Array<[InputParams, string]> = new Array<[InputParams, string]>;
  loading: boolean = false;

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

  setInputParams(inputParams: InputParams): void {
    this.inputParams = inputParams
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
      const p = this.inputParamsHistory.pop() as [InputParams, string];
      this.title = p[1];
      this.inputParams = Object.assign({}, p[0]);
      this.inputParamsHistory.length == 0 ? this.search() : this.search(false);
    }
  }

  getWords(word: Word | WeightedWord, category: string): void {
    this.inputParamsHistory.push([this.inputParams, this.title]);
    this.title = `${category}: ${word.name}(${word.pos})`;
    this.inputParams = Object.assign({ wordkey: word.wordKey, lang: word.lang, filterlang: word.lang, category: category });
    this.search(false);
  }

  private process_results(results: (Word | WeightedWord)[]): void {
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
        filterLangs: 'de',
        hierarchy: "True",
        partWhole: "True"
      });

      this.imageParams = params;      
    }
  }

  private search(allowGetWeighted: boolean = true): void {
    this.loading = true;
    this.fromText && allowGetWeighted && this.fromText.split(' ').length < 1000 ?
      this.wordnetService.getWeightedWords(this.inputParams, this.fromText)
        .pipe(takeUntil(this.onDestroy$))
        .subscribe({
          next: (results: WeightedWord[]) => {
            results = results.sort((a, b) => {
              return b.weight - a.weight;
            })
            this.process_results(results);
          },
          complete: () => this.loading = false
        }) :
      this.wordnetService.getWords(this.inputParams)
        .subscribe({
          next: (results: Word[]) => {
            this.process_results(results);
          },
          complete: () => this.loading = false
        });
  }

  ngAfterViewInit(): void {
    if (this.inputParams) {
      this.refreshView();
    }
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
