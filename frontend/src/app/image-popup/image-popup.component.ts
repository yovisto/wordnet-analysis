import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ImageInputParams } from '../models/image-input-params';
import { WordnetService } from '../services/wordnet.service';
import { Subject, takeUntil } from 'rxjs';

interface StringDictionary {
  [key: string]: string;
}

@Component({
  selector: 'app-image-popup',
  templateUrl: './image-popup.component.html',
  styleUrls: ['./image-popup.component.css']
})
export class ImagePopupComponent implements OnDestroy, OnInit{
  imageUrl: string = '';
  isVisible: boolean = false;
  imageParams!: ImageInputParams;
  loading: boolean = false;  
  langIconClassLookup: StringDictionary = {};

  private onDestroy$: Subject<void> = new Subject<void>();

  constructor(
      private wordnetService: WordnetService,
      private cd: ChangeDetectorRef
    ) {
  
  }
  
  ngOnInit(): void {
    this.langIconClassLookup = {
      'en': 'fi fi-gb', 
      'de': 'fi fi-de',
      'fr': 'fi fi-fr',
      'es': 'fi fi-es',
      'it': 'fi fi-it',
      'nl': 'fi fi-nl',
      'pt': 'fi fi-pt'    
    };    
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
    
  addSynonyms(count: number): void {
    const result = { ...this.imageParams };
    if (result?.synonymCount) {
      result.synonymCount += count;
      if (result.synonymCount < 1) {
        result.synonymCount = 1        
      }
      
      result.fileName = `hierarchy_partwhole${Date.now()}${result.filterLangs?.split(',').join('_')}_${result.level}_${result.maxLeafNodes}${result.synonymCount}`;           
    }
    this.open(result)     
  }

  addMaxLeafNodes(count: number): void {
    const result = { ...this.imageParams };
    if (result?.maxLeafNodes) {
      result.maxLeafNodes += count;
      if (result.maxLeafNodes < 1) {
        result.maxLeafNodes = 1
      }      
      result.fileName = `hierarchy_partwhole${Date.now()}${result.filterLangs?.split(',').join('_')}_${result.level}_${result.maxLeafNodes}${result.synonymCount}`;      
    }
    this.open(result)     
  }

  addLevel(count: number): void {
    const result = { ...this.imageParams };
    if (result?.level) {
      result.level += count;
      if (result.level < 1) {
        result.level = 1
      }      
      result.fileName = `hierarchy_partwhole${Date.now()}${result.filterLangs?.split(',').join('_')}_${result.level}_${result.maxLeafNodes}${result.synonymCount}`;      
    }
    this.open(result)     
  }
  
  open(imageParams: ImageInputParams) {    
    this.imageParams = imageParams;        
    this.loading = true;    
    this.wordnetService.getImage(this.imageParams)        
      .pipe(takeUntil(this.onDestroy$))
      .subscribe({
        next: (imageStr: string) => {
          this.imageUrl = imageStr;      
          this.cd.detectChanges();
        },          
        complete: () => this.loading = false
      });        
    this.isVisible = true;
  }

  close() {
    this.isVisible = false;
  }

}
