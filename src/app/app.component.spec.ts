import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { provideMockStore,MockStore } from '@ngrx/store/testing';
import {Player} from './interfaces'

describe('AppComponent', () => {
  let store: MockStore
  const initialState:Player[] = [{name: "player", id: "myid", synced: false}]
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideMockStore({initialState})
      ]
    }).compileComponents();
  });

  //store = TestBed.inject(MockStore)

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'schafkopf' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('schafkopf');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled).toBeTruthy();
  });
});
