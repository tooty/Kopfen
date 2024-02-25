import { TestBed } from '@angular/core/testing';

import { ControlerService } from './controler.service';
import {HttpClientModule} from '@angular/common/http';

describe('ControlerService', () => {
  let service: ControlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
    });
    service = TestBed.inject(ControlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
