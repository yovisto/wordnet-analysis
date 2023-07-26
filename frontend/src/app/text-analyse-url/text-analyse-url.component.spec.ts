import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextAnalyseUrlComponent } from './text-analyse-url.component';

describe('TextAnalyseUrlComponent', () => {
  let component: TextAnalyseUrlComponent;
  let fixture: ComponentFixture<TextAnalyseUrlComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TextAnalyseUrlComponent]
    });
    fixture = TestBed.createComponent(TextAnalyseUrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
