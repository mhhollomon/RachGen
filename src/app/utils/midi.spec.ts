import { Midi } from './midi';

describe('Midi', () => {
  it('should create an instance', () => {
    expect(new Midi({includeScale : true, includeMarkers : false, separateBass : true, fileName : 'blah'})).toBeTruthy();
  });
});
