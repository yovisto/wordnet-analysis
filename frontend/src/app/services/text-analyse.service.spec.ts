import { TestBed } from '@angular/core/testing';

import { TextAnalyseService } from './text-analyse.service';

describe('TextAnalyseService', () => {
  let service: TextAnalyseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TextAnalyseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
