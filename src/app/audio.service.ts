import { Injectable } from '@angular/core';

const pitch_map : { [ index : string] : number[] } = {
  'B#': [16.35, 32.70, 65.41, 130.8, 261.6, 523.3, 1047, 2093, 4186],
  'C': [16.35, 32.70, 65.41, 130.8, 261.6, 523.3, 1047, 2093, 4186],
  'C#': [17.32, 34.65, 69.3, 138.6, 277.2, 554.4, 1109, 2217, 4435],
  'Db': [17.32, 34.65, 69.3, 138.6, 277.2, 554.4, 1109, 2217, 4435],
  'Cx': [18.35, 36.71, 73.42, 146.8, 293.7, 587.3, 1175, 2349, 4699],
  'D': [18.35, 36.71, 73.42, 146.8, 293.7, 587.3, 1175, 2349, 4699],
  'Ebb': [18.35, 36.71, 73.42, 146.8, 293.7, 587.3, 1175, 2349, 4699],
  'D#': [19.45, 38.89, 77.78, 155.6, 311.1, 622.3, 1245, 2489, 4978],
  'Eb': [19.45, 38.89, 77.78, 155.6, 311.1, 622.3, 1245, 2489, 4978],
  'Dx': [20.6, 41.2, 82.41, 164.8, 329.6, 659.3, 1319, 2637, 5274],
  'E': [20.6, 41.2, 82.41, 164.8, 329.6, 659.3, 1319, 2637, 5274],
  'Fb': [20.6, 41.2, 82.41, 164.8, 329.6, 659.3, 1319, 2637, 5274],
  'E#': [21.83, 43.65, 87.31, 174.6, 349.2, 698.5, 1397, 2794, 5588],
  'F': [21.83, 43.65, 87.31, 174.6, 349.2, 698.5, 1397, 2794, 5588],
  'F#': [23.12, 46.25, 92.5, 185, 370, 740, 1480, 2960, 5920],
  'Gb': [23.12, 46.25, 92.5, 185, 370, 740, 1480, 2960, 5920],
  'Fx': [24.5, 49, 98, 196, 392, 784, 1568, 3136, 6272],
  'G': [24.5, 49, 98, 196, 392, 784, 1568, 3136, 6272],
  'Abb': [24.5, 49, 98, 196, 392, 784, 1568, 3136, 6272],
  'G#': [25.96, 51.91, 103.8, 207.7, 415.3, 830.6, 1661, 3322, 6645],
  'Ab': [25.96, 51.91, 103.8, 207.7, 415.3, 830.6, 1661, 3322, 6645],
  'Gx': [27.5, 55, 110, 220, 440, 880, 1760, 3520, 7040],
  'A': [27.5, 55, 110, 220, 440, 880, 1760, 3520, 7040],
  'Bbb': [27.5, 55, 110, 220, 440, 880, 1760, 3520, 7040],
  'A#': [29.14, 58.27, 116.5, 233.1, 466.2, 932.3, 1865, 3729, 7459],
  'Bb': [29.14, 58.27, 116.5, 233.1, 466.2, 932.3, 1865, 3729, 7459],
  'Ax': [30.87, 61.74, 123.5, 246.9, 493.9, 987.8, 1976, 3951, 7902],
  'B': [30.87, 61.74, 123.5, 246.9, 493.9, 987.8, 1976, 3951, 7902],
  'Cb': [30.87, 61.74, 123.5, 246.9, 493.9, 987.8, 1976, 3951, 7902],
};

const attackTime = 0.02;
const decayTime = 0.04;
const releaseTime = 0.1;
const beepLengthInSeconds = 0.1;

@Injectable({
  providedIn: 'root'
})
export class AudioService {

  //audioContext = new AudioContext();

  oscillators : OscillatorNode[] = [];
  gains : GainNode[] = [];
  topgain : GainNode;

  constructor(private audioContext : AudioContext) { 
    this.topgain =  this.audioContext.createGain();
    this.topgain.connect(this.audioContext.destination);
    this.topgain.gain.value = 0;

    for (let i = 0; i < 6; ++i) {
      this.createOsc();
    }
  }

   async play_chord(notes : string[], seconds? : number) {

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    seconds = seconds ? seconds : beepLengthInSeconds;

    for (let i = 0; i < 6; ++i) {

      if (i >= notes.length) {
        this.gains[i].gain.value = 0;
      } else {
        this.gains[i].gain.value = 1.0/notes.length;
        const freq = this.get_note_freq(notes[i]);
        this.oscillators[i].frequency.value = freq;
      }
    }

    const now = this.audioContext.currentTime;
    this.topgain.gain.setTargetAtTime(1, now, attackTime);
    this.topgain.gain.setTargetAtTime(0.60, attackTime, attackTime+decayTime);
    this.topgain.gain.setTargetAtTime(0, now + seconds, releaseTime);

  }
  

  
  private createOsc(){
    const gain = this.audioContext.createGain();
    gain.connect(this.topgain);
    gain.gain.value = 0;
    this.gains.push(gain);

    const oscillator = this.audioContext.createOscillator();
    oscillator.connect(gain);
    oscillator.start();
    this.oscillators.push(oscillator);
  }


  get_note_freq(note:string) : number {

    const octave = parseInt(note.substring(note.length-1));

    const pitch = note.substring(0,  note.length-1);

    return pitch_map[pitch][octave];

  }
  

}
