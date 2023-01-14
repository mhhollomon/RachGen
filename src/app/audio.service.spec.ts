import { AudioService } from './audio.service';

describe('AudioService', () => {
  let mockGaingain : jasmine.SpyObj<AudioParam>;
  
  let service: AudioService;

  beforeEach(() => {

    mockGaingain = jasmine.createSpyObj('mockGaingain', 
          ['setTargetAtTime'], ['value'])
    const mockGain = jasmine.createSpyObj('mockGain', 
        { connect : true}, 
           
        { gain : mockGaingain }
    );

    const mockOsc = jasmine.createSpyObj('mockOsc', 
        { connect : true, start : true},
        { frequency : jasmine.createSpyObj('mockFreq', {}, [ 'value']) }
    );

    const mockContext = jasmine.createSpyObj('mockAudioContext', 
      { state : 'not-suspended',
        currentTime: 10000,
        createGain : mockGain,
        createOscillator : mockOsc, }
    );

    service = new AudioService(mockContext as AudioContext);
  });


  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('returns correct frequency information', () => {
    expect(service.get_note_freq("C#5")).toEqual(554.4);
    expect(service.get_note_freq("Db5")).toEqual(554.4);
  });

  it ('calls AudioContext correctly', () => {
    service.play_chord(["C3"]);

    expect(mockGaingain.setTargetAtTime).toHaveBeenCalledTimes(2);

  });
});
