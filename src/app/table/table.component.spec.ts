import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore,MockStore } from '@ngrx/store/testing';
import { TableComponent } from './table.component';
import { provideRouter } from '@angular/router';
import { routes } from '../app.routes';

describe('OverviewComponent', () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;
  const initialState = [{name: "player", id: "myid", synced: false}]

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableComponent],
      providers: [
        provideMockStore({initialState}),
        provideRouter(routes)
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
