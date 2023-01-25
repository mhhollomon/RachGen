import { Scale } from "./scale";
import { List } from 'immutable'
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

    it("generates major Key notes correctly", () => {
        const expected = List<Note>(["G#", "A#", "B#", "C#", "D#", "E#", "Fx"].map(v => Note.fromString(v)));
        const test_res = new Scale( {center : "G#", type : 'major'}).notesOfScale();
        expect(test_res.equals(expected)).toBeTrue();
    });

    it("generates minor key notes correctly", () => {
        const expected = List<Note>(["Cb", "Db", "Ebb", "Fb", "Gb", "Abb", "Bbb"].map(v => Note.fromString(v)));
        const test_res = new Scale({ center : "Cb", type : 'minor'} ).notesOfScale();
        expect(test_res.equals(expected)).toBeTrue();
    });

});

describe("Scale.get_note()", () => {
    it ("should work for 1 to 7", () => {
        const scale = new Scale("F", "major");
        expect(scale.get_note(1)).toEqual(new Note("F"))
        expect(scale.get_note(2)).toEqual(new Note("G"))
        expect(scale.get_note(3)).toEqual(new Note("A"))
        expect(scale.get_note(4)).toEqual(new Note("B", -1))
        expect(scale.get_note(5)).toEqual(new Note("C"))
        expect(scale.get_note(6)).toEqual(new Note("D"))
        expect(scale.get_note(7)).toEqual(new Note("E"))

    }); 

    it ("should wrap correctly", () => {
        const scale = new Scale("F", "major");
        expect(scale.get_note(8)).toEqual(new Note("F"))
        expect(scale.get_note(9)).toEqual(new Note("G"))
        expect(scale.get_note(10)).toEqual(new Note("A"))
        expect(scale.get_note(11)).toEqual(new Note("B", -1))
        expect(scale.get_note(12)).toEqual(new Note("C"))
        expect(scale.get_note(13)).toEqual(new Note("D"))
        expect(scale.get_note(14)).toEqual(new Note("E"))

    }); 

    it ("should throw for degrees out of bounds", () => {
        const scale = new Scale("G", "lydian");
        expect(() => { scale.get_note(0) } ).toThrowError();
        expect(() => { scale.get_note(-1) } ).toThrowError();
    });

});