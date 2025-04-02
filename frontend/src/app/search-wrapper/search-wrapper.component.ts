import { Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AppConfig } from '../config/app-config';
import { SearchComponent } from '../search/search.component';

@Component({
  selector: 'app-search-wrapper',
  templateUrl: './search-wrapper.component.html',
  styleUrls: ['./search-wrapper.component.css']
})
export class SearchWrapperComponent {

  @ViewChild(SearchComponent, { static: false }) searchComponent!: SearchComponent;

  constructor() {}

  searchForm = new FormGroup({
    searchText: new FormControl('', Validators.required),
  });

  placeholder = AppConfig.searchPlaceholder;
  searchButtonText = AppConfig.searchButtonText;

  onSearch(): void {
    const woi = this.searchForm.controls['searchText'].value as string;
    if (woi) {
      const filterlang = AppConfig.filterLang;
      this.searchComponent.setInputParams(Object.assign({ woi: woi, filterlang: filterlang }));
      this.searchForm.controls['searchText'].setValue('');
    }
  }

}
