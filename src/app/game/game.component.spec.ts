import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameComponent } from './game.component';
import {RouterModule} from '@angular/router';
import {routes} from '../app.routes';

describe('GameComponent', () => {
  let component: GameComponent;
  let fixture: ComponentFixture<GameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameComponent,RouterModule.forRoot(routes)],
    }).compileComponents();

    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
