import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { ContextWord } from '../models/context-word';
import { TextAnalyseService } from '../services/text-analyse.service';

@Component({
  selector: 'app-text-analyse',
  templateUrl: './text-analyse.component.html',
  styleUrls: ['./text-analyse.component.css']
})
export class TextAnalyseComponent implements OnDestroy {

  textAnalyseForm = new FormGroup({
    textAnalyse: new FormControl(''),
  });

  results: Array<ContextWord[]> = [];
  text!: string
  loading: boolean = false;

  private onDestroy$: Subject<void> = new Subject<void>();

  constructor(
    private dlg: MatDialog,
    private textAnalyseService: TextAnalyseService) {

  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  analyse(): void {
    const lang = 'de';
    this.text = this.textAnalyseForm.controls['textAnalyse'].value as string;
    this.loading = true;
    this.textAnalyseService.tokenizeText(this.text, lang)
      .pipe(takeUntil(this.onDestroy$))
      .subscribe({
        next: (results: Array<ContextWord[]>) => {
          this.results = results;
        },
        complete: () => this.loading = false
      });
  }

  clear(): void {
    this.textAnalyseForm.controls['textAnalyse'].setValue('');
    this.results = [];
  }

}
