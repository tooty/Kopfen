import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { Store, StoreModule } from '@ngrx/store';
import { TableComponent } from './table.component';
import { HelperService } from '../services/helper.service';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { provideRouter } from '@angular/router';
import { routes } from '../app.routes';

describe('TableComponent', () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;
  let store: Store;
  let helperService: HelperService;
  const initialState = [{ name: "player", id: "myid", synced: false }]
  const initialGames = [{}]

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TableComponent],
      imports: [RouterTestingModule, StoreModule.forRoot({})],
      providers: [
        HelperService,
        provideMockStore({ initialState }),
        provideRouter(routes)
      ]
    }).compileComponents();

    store = TestBed.inject(MockStore)
    helperService = TestBed.inject(HelperService);
    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to the correct route', () => {
    const routerSpy = spyOn(component, 'navigate');
    const button = fixture.debugElement.query(By.css('button')).nativeElement;
    button.click();
    expect(routerSpy).toHaveBeenCalledWith('players');
  });

  it('should update orientation on orientationchange', () => {
    const event = new Event('orientationchange');
    spyOnProperty(window.screen.orientation, 'type')
    .and.returnValue('landscape-primary');
    component.orientationchange(event);
    expect(component.isLandscape).toBeTrue();
  });

  it('should call swipe method on swipeleft', () => {
    const swipeSpy = spyOn(component, 'swipe');
    component.ngOnInit();
    const hammer = new Hammer.Manager(fixture.nativeElement);
    hammer.emit('swipeleft', null);
    expect(swipeSpy).toHaveBeenCalled();
  });

  //it('should calculate table and sum observables correctly', () => {
  //  const games = [{}, {}, {}]; // Mock games array
  //  const players = [{ name: 'Player 1' }, { name: 'Player 2' }]; // Mock players array
  //  spyOn(store, 'select').and.callFake((selector) => {
  //    switch (selector) {
  //      case 'players':
  //        return of(players);
  //      case 'game':
  //        return of(games);
  //      default:
  //        return of([]);
  //    }
  //  });
  //  spyOn(helperService, 'tableObservable').and.returnValue([of([[1, -1], [2, -2]]), of([1, -1])]);
  //  component.ngOnInit();
  //  fixture.detectChanges();
  //  component.table$.subscribe((table) => {
  //    expect(table).toEqual([[1, -1], [2, -2]]);
  //  });
  //  component.sum$.subscribe((sum) => {
  //    expect(sum).toEqual([1, -1]);
  //  });
  //});
});
