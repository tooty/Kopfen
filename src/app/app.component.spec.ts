import { tick,ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { provideMockStore,MockStore } from '@ngrx/store/testing';
import { By } from '@angular/platform-browser';
import {Player} from './interfaces'
import { RouterOutlet } from '@angular/router';
import { PlayersComponent } from './players/players.component';
import {of}from 'rxjs'

describe('AppComponent', () => {
  let store: MockStore
  let fixture: ComponentFixture<AppComponent>
  let app: AppComponent
  const initialState:Player[] = [{name: "player", id: "myid", synced: false}]
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideMockStore({initialState})
      ]
    }).compileComponents();
    store = TestBed.inject(MockStore); // Inject the MockStore
    fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;
    fixture.detectChanges()
  });

  it('should create the app', () => {
    expect(app).toBeTruthy();
  });

  it(`should have the 'schafkopf' title`, () => {
    expect(app.title).toEqual('schafkopf');
  });

  it('should render player component with player<=3'), () => {
    const display = fixture.debugElement.query(By.css('div'))
    expect(display).toBeTruthy()
  }
  });
