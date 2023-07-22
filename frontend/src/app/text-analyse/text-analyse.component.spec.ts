import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextAnalyseComponent } from './text-analyse.component';

describe('TextAnalyseComponent', () => {
  let component: TextAnalyseComponent;
  let fixture: ComponentFixture<TextAnalyseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TextAnalyseComponent]
    });
    fixture = TestBed.createComponent(TextAnalyseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
