import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ContextWordWrapper } from '../models/context-word-wrapper';

@Component({
  selector: 'app-text-analyse-result-rdf',
  templateUrl: './text-analyse-result-rdf.component.html',
  styleUrls: ['./text-analyse-result-rdf.component.css']
})
export class TextAnalyseResultRdfComponent {
  @Input() results!: ContextWordWrapper;
  @Output() notify: EventEmitter<string> = new EventEmitter<string>();
  
  onUrlClick(url: string): void {
    this.notify.emit(url)
  }
}
