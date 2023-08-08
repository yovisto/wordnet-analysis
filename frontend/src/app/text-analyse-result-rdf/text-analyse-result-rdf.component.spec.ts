import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextAnalyseResultRdfComponent } from './text-analyse-result-rdf.component';

describe('TextAnalyseResultRdfComponent', () => {
  let component: TextAnalyseResultRdfComponent;
  let fixture: ComponentFixture<TextAnalyseResultRdfComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TextAnalyseResultRdfComponent]
    });
    fixture = TestBed.createComponent(TextAnalyseResultRdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
