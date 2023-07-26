import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TextAnalyseService } from '../services/text-analyse.service';
import { ContextWord } from '../models/context-word';
import { ContextWordWrapper } from '../models/context-word-wrapper';

@Component({
  selector: 'app-text-analyse-url',
  templateUrl: './text-analyse-url.component.html',
  styleUrls: ['./text-analyse-url.component.css']
})
export class TextAnalyseUrlComponent {

  results!: ContextWordWrapper | null;  

  constructor(private textAnalyseService: TextAnalyseService) {
      
  }

  textAnalyseForm = new FormGroup({
    url: new FormControl('', Validators.required),    
  }); 
  
  analyse(): void {    
    const url = this.textAnalyseForm.controls['url'].value as string;
    const lang = 'ger';
    if (url) {
      this.textAnalyseService.tokenizeTextFromUrl(url, lang).subscribe((results: ContextWordWrapper) => {
        this.results = results;        
      });
    }                  
  }

  clear(): void {
    this.textAnalyseForm.controls['url'].setValue('');
    this.results = null;    
  }
}
