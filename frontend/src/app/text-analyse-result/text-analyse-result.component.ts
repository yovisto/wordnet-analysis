import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ContextWord } from '../models/context-word';
import { SearchComponentDlgWrapperComponent } from '../search-component-dlg-wrapper/search-component-dlg-wrapper.component';

@Component({
  selector: 'app-text-analyse-result',
  templateUrl: './text-analyse-result.component.html',
  styleUrls: ['./text-analyse-result.component.css']
})
export class TextAnalyseResultComponent {

  @Input() results!: Array<ContextWord[]>;
  @Input() text!: string;
  @Input() lang: string = 'de'

  constructor(private dlg: MatDialog,) {

  }

  getWordNet(woi: string, pos: string, lemma: string): void {    
    const dialogRef = this.dlg.open(SearchComponentDlgWrapperComponent, {
      width: '600px',
    });
    const instance = dialogRef.componentInstance;
    instance.inputParams = Object.assign({ woi: woi, pos: pos, lemma: lemma, lang: this.lang, filterlang: this.lang });
    instance.fromText = this.text
  }
}
