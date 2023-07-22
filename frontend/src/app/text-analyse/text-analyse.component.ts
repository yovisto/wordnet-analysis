import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TextAnalyseService } from '../services/text-analyse.service';
import { ContextWord } from '../models/context-word';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SearchComponent } from '../search/search.component';
import { WordnetService } from '../services/wordnet.service';
import { Word } from '../models/word';
import { SearchComponentDlgWrapperComponent } from '../search-component-dlg-wrapper/search-component-dlg-wrapper.component';

@Component({
  selector: 'app-text-analyse',
  templateUrl: './text-analyse.component.html',
  styleUrls: ['./text-analyse.component.css']
})
export class TextAnalyseComponent {

  textAnalyseForm = new FormGroup({
    textAnalyse: new FormControl(''),
  });

  results: ContextWord[] = [];
  text!: string

  constructor(
    private dlg: MatDialog,
    private textAnalyseService: TextAnalyseService) {

  }

  analyse(): void {
    const lang = 'ger';
    this.text = this.textAnalyseForm.controls['textAnalyse'].value as string;

    this.textAnalyseService.tokenizeText(this.text, lang).subscribe((results: ContextWord[]) => {
      this.results = results;
    });
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

  clear(): void {
    this.textAnalyseForm.controls['textAnalyse'].setValue('');
    this.results = [];
  }

}
