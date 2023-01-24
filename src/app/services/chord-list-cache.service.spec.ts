import { TestBed } from '@angular/core/testing';

import { ChordListCacheService } from './chord-list-cache.service';

describe('ChordListCacheService', () => {
  let service: ChordListCacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChordListCacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
