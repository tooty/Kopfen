import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore,MockStore } from '@ngrx/store/testing';
import { TableComponent } from './table.component';
import { provideRouter } from '@angular/router';
import { routes } from '../app.routes';
import {Player, Game} from '../interfaces'

describe('TableComponent', () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;
  const ps: Player[] = [{name: "player", id: "myid", synced: false}]
  const gs: Game[] = [{
    time: 1000,
    cost: 10,
    synced: false,
    involved: [{ playerID: "myid", winner: true}]}]

  const players = {selector: "player", value: ps}
  const games = {selector: "game" , value: gs}

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableComponent],
      providers: [
        provideMockStore({selectors: [players, games]}),
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
