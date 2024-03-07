import { TestBed } from '@angular/core/testing';
import { provideMockStore,MockStore } from '@ngrx/store/testing';

import { HelperService } from './helper.service';

describe('HelperService', () => {
  let service: HelperService;
  const initialState = [{name: "player", id: "myid", synced: false}]

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockStore({initialState}),
      ]
    });
    service = TestBed.inject(HelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
