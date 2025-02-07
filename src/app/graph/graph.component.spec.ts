import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphComponent } from './graph.component';
import { provideMockStore } from '@ngrx/store/testing';

describe('GraphComponent', () => {
  let component: GraphComponent;
  let fixture: ComponentFixture<GraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraphComponent],
      providers: [provideMockStore()],
    }).compileComponents();

    fixture = TestBed.createComponent(GraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
