import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore,MockStore } from '@ngrx/store/testing';

import { PlayersComponent } from './players.component';
import { StoreModule } from '@ngrx/store';


describe('PlayerOverviewComponent', () => {
  let component: PlayersComponent;
  let fixture: ComponentFixture<PlayersComponent>;
  let store: MockStore
  const initialState = [{name: "player", id: "myid", synced: false}]

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayersComponent],
      providers: [
        provideMockStore({initialState}),
      ]
    }).compileComponents();
    store = TestBed.inject(MockStore)

    fixture = TestBed.createComponent(PlayersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
