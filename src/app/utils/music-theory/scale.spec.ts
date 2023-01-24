import { Scale } from "./scale";
import { is as ImmIs, List } from 'immutable'
import { Note } from "./note";

describe("Scale", () => {
    it("should properly use string for root note", () => {

        const s = new Scale("C#", 'minor');
        expect(s.root.equals(Note.fromString("C#"))).toBeTruthy();
        expect(s.type).toEqual('minor');

    });

    it("should properly use a Note for root note", () => {

        const n = new Note('F');
        const s = new Scale(n, 'phrygian');
        expect(s.root.equals(n));
        expect(s.type).toEqual('phrygian');

    });

    it("returns the correct name", () => {
        expect(new Scale("F#", 'augmented').name()).toEqual("F# Augmented");
    });

    it("returns correctly for nameUnicode", () => {
        expect(new Scale("Fx", 'minor').nameUnicode()).toEqual("F\uD834\uDD2A Minor");
    });

    it("returns correctly for id", () => {
        expect(new Scale("Fbb", 'minor').id()).toEqual("Fbb Minor");
    });

    it("generates major Key notes correctly", () => {
        const expected = List<Note>(["G#", "A#", "B#", "C#", "D#", "E#", "Fx"].map(v => Note.fromString(v)));
        const test_res = new Scale("G#", 'major').notesOfScale();
        expect(ImmIs(test_res, expected)).toBeTrue();
    });

    it("generates minor key notes correctly", () => {
        const expected = List<Note>(["Cb", "Db", "Ebb", "Fb", "Gb", "Abb", "Bbb"].map(v => Note.fromString(v)));
        const test_res = new Scale("Cb", 'minor').notesOfScale();
        expect(test_res.equals(expected)).toBeTrue();
    });

});