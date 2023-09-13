import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ContextWord } from '../models/context-word';
import { RdfDlgWrapperComponentComponent } from '../rdf-dlg-wrapper-component/rdf-dlg-wrapper-component.component';
import { SearchComponentDlgWrapperComponent } from '../search-component-dlg-wrapper/search-component-dlg-wrapper.component';

const CONTEXT_MARGIN = 50;

@Component({
  selector: 'app-text-analyse-result',
  templateUrl: './text-analyse-result.component.html',
  styleUrls: ['./text-analyse-result.component.css']
})
export class TextAnalyseResultComponent {

  @Input() results!: Array<ContextWord[]>;
  @Input() text!: string;
  @Input() lang: string = 'de';
  @Input() isDialog: boolean = false;
  @Output() clickUrlInsideDialog: EventEmitter<string> = new EventEmitter<string>();

  constructor(private dlg: MatDialog,) {

  }

  getLodData(item: ContextWord, result: ContextWord[]): void {

    if (item.dbPediaUrl) {
      if (this.isDialog) {
        this.clickUrlInsideDialog.emit(item.dbPediaUrl);
        return;
      }
      
      const dialogRef = this.dlg.open(RdfDlgWrapperComponentComponent, {
        width: '800px',
      });
      const instance = dialogRef.componentInstance;
      instance.url = item.dbPediaUrl;
      return;
    }

    const dialogRef = this.dlg.open(SearchComponentDlgWrapperComponent, {
      width: '600px',
    });
    const instance = dialogRef.componentInstance;
    instance.inputParams = Object.assign({ woi: item.name, pos: item.pos, lemma: item.lemma, lang: this.lang, filterlang: this.lang });
    const index = result.indexOf(item);
    const startIndex = index - CONTEXT_MARGIN < 0 ? 0 : index - CONTEXT_MARGIN;
    const endIndex = index + CONTEXT_MARGIN > result.length ? result.length - 1 : index + CONTEXT_MARGIN;
    const text_subset = result.slice(startIndex, endIndex).map(x => x.name).join(' ');
    instance.fromText = text_subset;
  }
}
