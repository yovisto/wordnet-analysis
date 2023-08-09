import { Component, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ContextWordWrapper } from '../models/context-word-wrapper';
import { TextAnalyseService } from '../services/text-analyse.service';
import { TextAnalyseResultRdfComponent } from '../text-analyse-result-rdf/text-analyse-result-rdf.component';

@Component({
  selector: 'app-text-analyse-url',
  templateUrl: './text-analyse-url.component.html',
  styleUrls: ['./text-analyse-url.component.css']
})
export class TextAnalyseUrlComponent implements OnDestroy {

  results!: ContextWordWrapper | null;
  loading: boolean = false;
  history: Array<[ContextWordWrapper, string]> = new Array<[ContextWordWrapper, string]>;
  title: string = 'Url-analyse'
  @ViewChild(TextAnalyseResultRdfComponent, { static: false }) rdfComponent!: TextAnalyseResultRdfComponent;

  private onDestroy$: Subject<void> = new Subject<void>();

  constructor(private textAnalyseService: TextAnalyseService) {
    
  }
  
  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  textAnalyseForm = new FormGroup({
    url: new FormControl('', Validators.required),
  });

  analyse(): void {
    const url = this.textAnalyseForm.controls['url'].value as string;
    const lang = 'de';
    if (url) {
      this.title = `Url-analyse: ${url}`;
      this.loading = true;
      this.textAnalyseService.tokenizeTextFromUrl(url, lang)
        .pipe(takeUntil(this.onDestroy$))
        .subscribe({
          next: (results: ContextWordWrapper) => {
            this.results = results;            
          },          
          complete: () => this.loading = false                      
        });           
    }
  }

  clear(): void {
    this.textAnalyseForm.controls['url'].setValue('');
    this.results = null;
    this.history = [];
    this.title = 'Url-analyse';
  }

  onChildNotifyUrl(url: string) {    
    this.history.push([this.results as ContextWordWrapper, this.textAnalyseForm.controls['url'].value as string]);
    this.textAnalyseForm.controls['url'].setValue('');
    this.results = null;
    this.textAnalyseForm.controls['url'].setValue(url);
    this.title = `Url-analyse: ${url}`;
    this.analyse();
  }

  back(): void {
    if (this.history.length > 0) {            
      const prev = this.history.pop() as [ContextWordWrapper, string];
      this.textAnalyseForm.controls['url'].setValue(prev[1] as string);
      this.title = `Url-analyse: ${prev[1]}`;      
      this.results = prev[0];
      if (this.rdfComponent) {
        this.rdfComponent.setInputParam(this.results);      
      }      
    }
  }
}
