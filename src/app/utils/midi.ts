import * as dayjs from 'dayjs';
import { saveAs } from 'file-saver';
import * as Midiwriter from 'midi-writer-js';

import { MidiConfig } from "../midi-dialog/midi-dialog.component";
import { Chord, NamedNoteList, voiceChord } from "./music-theory/chord";
import { Note } from './music-theory/note';
import { Scale } from './music-theory/scale';

const octavePlacement : { [ index : string ] : number } = {
    'C' : 0, 'D' : 1, 'E' : 2, 'F' : 3, 'G' : 4, 'A' : 5, 'B' : 6 
  }
  

export class Midi {

    constructor(private cfg: MidiConfig) { }


    generate(chord_list: NamedNoteList[], scale?: Scale) {
        console.log("generating midi data");

        if (chord_list.length < 1) return;

        const mainTrack = new Midiwriter.Track();
        let bassTrack;
        if (this.cfg.separateBass) {
            bassTrack = new Midiwriter.Track();
        }

        let trackName = '';

        for (const c of chord_list) {
            trackName += c.name() + ' ';
        }

        if (this.cfg.includeScale) {
            if (! scale) {
                throw Error("Didn't supply scale");
            }

            trackName += scale.name();
        }

        mainTrack.addTrackName(trackName);
        if (bassTrack) {
            bassTrack.addTrackName(trackName);
        }

        for (const c of chord_list) {

            let isBassNote = true;

            const mainOptions: Midiwriter.Options = { sequential: false, duration: '1', pitch: [] }
            const bassOptions: Midiwriter.Options = { sequential: false, duration: '1', pitch: [] }

            for (const n of voiceChord(c)) {

                if (isBassNote) {
                    if (bassTrack) {
                        (bassOptions.pitch as unknown as string[]).push(n);
                    } else {
                        (mainOptions.pitch as unknown as string[]).push(n);
                    }
                    isBassNote = false;
                } else {
                    (mainOptions.pitch as unknown as string[]).push(n);
                }
            }

            if (this.cfg.includeMarkers) {
                mainTrack.addMarker(c.name());
            }
            mainTrack.addEvent(new Midiwriter.NoteEvent(mainOptions))
            if (bassTrack) {
                bassTrack.addEvent(new Midiwriter.NoteEvent(bassOptions))
            }
        }

        if (this.cfg.includeScale) {
            if (! scale) {
                throw Error("Didn't supply scale");
            }
            if (this.cfg.includeMarkers) {
    
                mainTrack.addMarker(scale.name() + " Scale")
   
            }

            const scale_notes = scale.notesOfScale();

            let octave = ['G', 'A', 'B'].includes(scale_notes.get(0, new Note('C')).toSharp().noteClass) ? 3 : 4;
            let last = -1;
            let scale_options: Midiwriter.Options = { sequential: true, duration: '4', pitch: [] }
            for (const n of scale_notes) {

                const simpleNote = n.toSharp();


                if (octavePlacement[simpleNote.noteClass] < last) {
                    // write what we have and start a new sequence
                    mainTrack.addEvent(new Midiwriter.NoteEvent(scale_options))
                    scale_options = { sequential: true, duration: '4', pitch: [] }
                    octave += 1;
                }
                (scale_options.pitch as unknown as string[]).push(simpleNote.name() + octave);
                last = octavePlacement[simpleNote.noteClass];
            }

            mainTrack.addEvent(new Midiwriter.NoteEvent(scale_options))

        }

        const tracks = [mainTrack];
        if (bassTrack) {
            tracks.push(bassTrack);
        }

        const midi_writer = new Midiwriter.Writer(tracks);

        const filename = this.interpolate_midi_filename(this.cfg.fileName, chord_list.length, scale) + ".mid";

        const blob = new Blob([midi_writer.buildFile()], { type: "audio/midi" });
        saveAs(blob, filename);


    }

    interpolate_midi_filename(input_string: string, chord_count : number, scale : Scale | undefined, ): string {
        const re = /(?<varname>\${\w+})/g;

        const date = dayjs();

        const value_map = new Map<string, string>( [
            ['date',   date.format('YYYYMMDD')],
            ['time',   date.format('HHmmss')],
            ['count',  chord_count.toString()],
            ['scale',  (scale?.name() || 'unknown')],
        ]);


        return input_string.replaceAll(re, (s) => {
            const varname = s.substring(2, s.length - 1);
            return value_map.get(varname) || '???';
        });
    }


}
