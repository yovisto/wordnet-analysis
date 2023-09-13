import { Component, Input } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TextAnalyseUrlComponent } from '../text-analyse-url/text-analyse-url.component';

@Component({
  selector: 'app-rdf-dlg-wrapper-component',
  templateUrl: './rdf-dlg-wrapper-component.component.html',
  styleUrls: ['./rdf-dlg-wrapper-component.component.css']
})
export class RdfDlgWrapperComponentComponent {

  @Input() url!: string;

  constructor(private dialogRef: MatDialogRef<TextAnalyseUrlComponent>) {

  }

  onCloseClick(): void {
    this.dialogRef.close();
  }
}
