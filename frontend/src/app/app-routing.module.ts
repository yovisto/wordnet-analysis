import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TextAnalyseComponent } from './text-analyse/text-analyse.component';
import { ImageViewerComponent } from './image-viewer/image-viewer.component';
import { TextAnalyseUrlComponent } from './text-analyse-url/text-analyse-url.component';
import { SearchWrapperComponent } from './search-wrapper/search-wrapper.component';

const routes: Routes = [
  { path: '', redirectTo: '/text-analyse', pathMatch: 'full' },  
  { path: 'text-analyse', component: TextAnalyseComponent },
  { path: 'text-analyse-url', component: TextAnalyseUrlComponent },
  { path: 'image', component: ImageViewerComponent },
  { path: 'search-wrapper', component: SearchWrapperComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
