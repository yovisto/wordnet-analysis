import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TextAnalyseComponent } from './text-analyse/text-analyse.component';
import { ImageViewerComponent } from './image-viewer/image-viewer.component';

const routes: Routes = [
  { path: '', redirectTo: '/text-analyse', pathMatch: 'full' },  
  { path: 'text-analyse', component: TextAnalyseComponent },
  { path: 'image', component: ImageViewerComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
