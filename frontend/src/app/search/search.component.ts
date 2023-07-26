import { AfterViewInit, ChangeDetectorRef, Component, Input } from '@angular/core';
import { WordnetService } from '../services/wordnet.service';
import { Word } from '../models/word'
import { InputParams } from '../models/input-params';
import { Observable } from 'rxjs';
import { ImageInputParams } from '../models/image-input-params';
import { WeightedWord } from '../models/weighted-word';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements AfterViewInit {

  @Input() inputParams!: InputParams;
  @Input() fromText!: string;

  words: (Word | WeightedWord)[] = [];
  imageSrc$!: Observable<string>;
  imageParams!: ImageInputParams;
  title!: string;
  inputParamsHistory: Array<[InputParams, string]> = new Array<[InputParams, string]>;

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
    this.inputParams = Object.assign({ wordkey: word.wordKey, lang: word.lang, category: category });
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
      this.imageSrc$ = this.wordnetService.getImage(params);

    }
  }

  private search(allowGetWeighted: boolean = true): void {
    this.fromText && allowGetWeighted ?
      this.wordnetService.getWeightedWords(this.inputParams, this.fromText)
        .subscribe((results: WeightedWord[]) => {
          results = results.sort((a, b) => {
            return b.weight - a.weight;
          })
          this.process_results(results);
        }) :
      this.wordnetService.getWords(this.inputParams)
        .subscribe((results: Word[]) => {
          this.process_results(results);
        });
  }

  ngAfterViewInit(): void {
    if (this.inputParams) {
      this.refreshView();
    }
  }

  onGetExamples(word: Word): void {
    this.wordnetService.getExampleSentences(word.wordKey).subscribe(examples => console.log(examples))
  }

}
