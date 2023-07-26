import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextAnalyseResultComponent } from './text-analyse-result.component';

describe('TextAnalyseResultComponent', () => {
  let component: TextAnalyseResultComponent;
  let fixture: ComponentFixture<TextAnalyseResultComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TextAnalyseResultComponent]
    });
    fixture = TestBed.createComponent(TextAnalyseResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
