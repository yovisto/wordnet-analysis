import { NgModule, importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TextAnalyseComponent } from './text-analyse/text-analyse.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HttpClientModule } from '@angular/common/http';

import { SearchComponent } from './search/search.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon'
import { SearchComponentDlgWrapperComponent } from './search-component-dlg-wrapper/search-component-dlg-wrapper.component'


import { ImageViewerComponent } from './image-viewer/image-viewer.component';

@NgModule({
  declarations: [
    AppComponent,
    TextAnalyseComponent,
    SearchComponent,
    SearchComponentDlgWrapperComponent,
    ImageViewerComponent
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
    MatIconModule
  ],
  bootstrap: [AppComponent],
  providers: [importProvidersFrom([BrowserAnimationsModule])]
})
export class AppModule { }
