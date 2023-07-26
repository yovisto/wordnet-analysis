import { Component, Input } from '@angular/core';
import { ContextWord } from '../models/context-word';
import { MatDialog } from '@angular/material/dialog';
import { SearchComponentDlgWrapperComponent } from '../search-component-dlg-wrapper/search-component-dlg-wrapper.component';

@Component({
  selector: 'app-text-analyse-result',
  templateUrl: './text-analyse-result.component.html',
  styleUrls: ['./text-analyse-result.component.css']
})
export class TextAnalyseResultComponent {

  @Input() results!: ContextWord[];
  @Input() text!: string;

  
  constructor(private dlg: MatDialog,) {
      
  }

  getWordNet(woi: string, pos: string, lemma: string): void {
    const lang = 'de'

    const dialogRef = this.dlg.open(SearchComponentDlgWrapperComponent, {
      width: '600px',      
    });    
    const instance = dialogRef.componentInstance;
    instance.inputParams = Object.assign({woi: woi, pos: pos, lemma: lemma, lang: lang});    
    instance.fromText = this.text
  }
}