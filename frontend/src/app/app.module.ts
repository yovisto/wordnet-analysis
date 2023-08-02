import { NgModule, importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TextAnalyseComponent } from './text-analyse/text-analyse.component';

import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { SearchComponentDlgWrapperComponent } from './search-component-dlg-wrapper/search-component-dlg-wrapper.component';
import { SearchComponent } from './search/search.component';

import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { ImageViewerComponent } from './image-viewer/image-viewer.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { SearchWrapperComponent } from './search-wrapper/search-wrapper.component';
import { TextAnalyseResultComponent } from './text-analyse-result/text-analyse-result.component';
import { TextAnalyseUrlComponent } from './text-analyse-url/text-analyse-url.component';

@NgModule({
  declarations: [
    AppComponent,
    TextAnalyseComponent,
    SearchComponent,
    SearchComponentDlgWrapperComponent,
    ImageViewerComponent,
    TextAnalyseUrlComponent,
    SearchWrapperComponent,
    TextAnalyseResultComponent,
    LoadingSpinnerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    HttpClientModule,
    MatExpansionModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule,  
  ],
  
  bootstrap: [AppComponent],
  providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }, importProvidersFrom([BrowserAnimationsModule])]
})
export class AppModule { }
