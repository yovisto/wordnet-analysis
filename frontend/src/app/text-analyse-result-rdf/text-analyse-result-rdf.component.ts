import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { ContextWordWrapper } from '../models/context-word-wrapper';

@Component({
  selector: 'app-text-analyse-result-rdf',
  templateUrl: './text-analyse-result-rdf.component.html',
  styleUrls: ['./text-analyse-result-rdf.component.css']
})
export class TextAnalyseResultRdfComponent implements AfterViewInit {
  
  @Input() results!: ContextWordWrapper;
  @Output() notify: EventEmitter<string> = new EventEmitter<string>();
  filteredData: ContextWordWrapper | undefined;
  
  constructor(private cd: ChangeDetectorRef) {
    
  }

  ngAfterViewInit(): void {
    this.refresh();
  }

  refresh(): void {
    if (this.results) {
      this.filteredData = Object.assign({}, this.results);
      this.cd.detectChanges();
    }
  }

  onUrlClick(url: string): void {
    this.notify.emit(url)
  }

  setInputParam(results: ContextWordWrapper) {
    this.results = results;    
    this.refresh();
  }

  filterTable(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    if (this.filteredData && this.results) {      
      this.filteredData.rdfLiterals = this.results.rdfLiterals.filter(item =>
        item.predicate.toLowerCase().includes(filterValue.toLowerCase())
      );

      this.filteredData.rdfNonLiterals = this.results.rdfNonLiterals.filter(item =>
        item.predicate.toLowerCase().includes(filterValue.toLowerCase()) ||
        item.object.toLowerCase().includes(filterValue.toLowerCase())
      );

      if (filterValue === '') {
        this.filteredData = Object.assign({}, this.results);
      }
    }
    
  }
}
