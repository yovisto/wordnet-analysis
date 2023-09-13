import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RdfDlgWrapperComponentComponent } from './rdf-dlg-wrapper-component.component';

describe('RdfDlgWrapperComponentComponent', () => {
  let component: RdfDlgWrapperComponentComponent;
  let fixture: ComponentFixture<RdfDlgWrapperComponentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RdfDlgWrapperComponentComponent]
    });
    fixture = TestBed.createComponent(RdfDlgWrapperComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
