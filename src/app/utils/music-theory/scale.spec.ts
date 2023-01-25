import { Scale } from "./scale";
import { is as ImmIs, List } from 'immutable'
import { Note } from "./note";

describe("Scale", () => {
    it("should properly use string for root note", () => {

        const s = new Scale({ center : "C#", type : 'minor' });
        expect(s.root.equals(Note.fromString("C#"))).toBeTruthy();
        expect(s.type).toEqual('minor');

    });

    it("returns the correct name", () => {
        expect(new Scale({ center : "F#", type : 'phrygian'}).name()).toEqual("F# Phrygian");
    });

    it("returns correctly for nameUnicode", () => {
        expect(new Scale({ center : "Fx", type : 'minor'}).nameUnicode()).toEqual("F\uD834\uDD2A Minor");
    });

    it("returns correctly for id", () => {
        expect(new Scale({ center : "Fbb", type : 'minor'}).id()).toEqual("Fbb Minor");
    });

    it("generates major Key notes correctly", () => {
        const expected = List<Note>(["G#", "A#", "B#", "C#", "D#", "E#", "Fx"].map(v => Note.fromString(v)));
        const test_res = new Scale( {center : "G#", type : 'major'}).notesOfScale();
        expect(ImmIs(test_res, expected)).toBeTrue();
    });

    it("generates minor key notes correctly", () => {
        const expected = List<Note>(["Cb", "Db", "Ebb", "Fb", "Gb", "Abb", "Bbb"].map(v => Note.fromString(v)));
        const test_res = new Scale({ center : "Cb", type : 'minor'} ).notesOfScale();
        expect(test_res.equals(expected)).toBeTrue();
    });

});