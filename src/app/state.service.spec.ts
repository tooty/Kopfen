import { TestBed } from '@angular/core/testing';

import { StateService } from './state.service';
import {HttpClientModule} from '@angular/common/http';

describe('StateService', () => {
  let service: StateService;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [HttpClientModule],
    });
    service = TestBed.inject(StateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
