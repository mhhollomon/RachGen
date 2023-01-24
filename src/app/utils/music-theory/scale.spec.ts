import { Scale } from "./scale";

import { Note } from "./note";

describe("Scale", () => {
    it("should properly use string for root note", () => {

        const s = new Scale("C#", 'minor');
        expect(s.rootNote.equal(Note.fromString("C#"))).toBeTruthy();
        expect(s.scaleType).toEqual('minor');

    });

    it("should properly use a Note for root note", () => {

        const n = new Note('F');
        const s = new Scale(n, 'phrygian');
        expect(s.rootNote.equal(n));
        expect(s.scaleType).toEqual('phrygian');

    });

    it("returns the correct fullname", () => {
        expect(new Scale("F#", 'augmented').fullName()).toEqual("F# Augmented");
    });

    it("correctly marks scale as minor", () => {
        expect(new Scale("F", 'minor').isMinor()).toBeTruthy();
        expect(new Scale("F", 'major').isMinor()).toBeFalsy();
        expect(new Scale("F", 'phrygian').isMinor()).toBeFalsy();
        expect(new Scale("F", 'augmented').isMinor()).toBeFalsy();
    });

    it("returns correctly for fullDisplay", () => {
        expect(new Scale("Fx", 'minor').fullDisplay()).toEqual("F\uD834\uDD2A Minor");
    });

    it("returns correctly for id", () => {
        expect(new Scale("Fbb", 'minor').id()).toEqual("Fbb Minor");
    });

    it("generates major Key notes correctly", () => {
        expect(new Scale("G#", 'major').notesOfScale()).toEqual(
            ["G#", "A#", "B#", "C#", "D#", "E#", "Fx"].map(v => Note.fromString(v))
        );
    });

    it("generates minor key notes correctly", () => {
        expect(new Scale("Cb", 'minor').notesOfScale()).toEqual(
            ["Cb", "Db", "Ebb", "Fb", "Gb", "Abb", "Bbb"].map(v => Note.fromString(v))
        );
     
    });

});