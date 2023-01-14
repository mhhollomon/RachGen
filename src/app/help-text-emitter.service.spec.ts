import { TestBed } from '@angular/core/testing';

import { HelpTextEmitterService } from './help-text-emitter.service';

describe('HelpTextEmitterService', () => {
  let service: HelpTextEmitterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HelpTextEmitterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
