import { Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { WordnetService } from '../services/wordnet.service';
import { filter } from 'rxjs';
import { InputParams } from '../models/input-params';
import { SearchComponent } from '../search/search.component';

@Component({
  selector: 'app-search-wrapper',
  templateUrl: './search-wrapper.component.html',
  styleUrls: ['./search-wrapper.component.css']
})
export class SearchWrapperComponent {
    
  @ViewChild(SearchComponent, { static: false }) searchComponent!: SearchComponent;

  constructor() {
    
  }

  searchForm = new FormGroup({
    searchText: new FormControl('', Validators.required),    
  }); 

  onSearch(): void {    
    const woi = this.searchForm.controls['searchText'].value as string
    if (woi) {
      const filterlang = 'de'      
      this.searchComponent.setInputParams(Object.assign({woi: woi, filterlang: filterlang}));
      this.searchForm.controls['searchText'].setValue('');
    }    
  }
  
}
