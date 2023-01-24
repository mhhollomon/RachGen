import { Note } from "./note";

describe("Note.fromString", () => {
    it ('should create instance with simple string note name', () => {

        const note = Note.fromString('C');

        expect(note).toBeTruthy();
        expect(note.noteClass).toEqual('C');
        expect(note.alter).toEqual(0);

    });

    it ('should handle/parse sharp accidental in string note name', () => {

        const note = Note.fromString('D#');

        expect(note).toBeTruthy();
        expect(note.noteClass).toEqual('D');
        expect(note.alter).toEqual(1);

    });

    it ('should handle/parse flat accidental in string note name', () => {

        const note = Note.fromString('Gb');

        expect(note).toBeTruthy();
        expect(note.noteClass).toEqual('G');
        expect(note.alter).toEqual(-1);

    });

    it ('should handle/parse double sharp accidental in string note name', () => {

        const note = Note.fromString('Ex');

        expect(note).toBeTruthy();
        expect(note.noteClass).toEqual('E');
        expect(note.alter).toEqual(2);

    });

    it ('should handle/parse double flat accidental in string note name', () => {

        const note = Note.fromString('Abb');

        expect(note).toBeTruthy();
        expect(note.noteClass).toEqual('A');
        expect(note.alter).toEqual(-2);

    });

    it('should properly record the passed-in alter amount', () => {

        const note = new Note('A', -1);

        expect(note).toBeTruthy();
        expect(note.noteClass).toEqual('A');
        expect(note.alter).toEqual(-1);

    });

    it('should throw if given blank note name', () => {
        expect(() => { Note.fromString('')}).toThrowError();
    });

    it('should throw if given an unknown note name', () => {
        expect(() => { Note.fromString('R')}).toThrowError();
    });

    it('should throw if given an unknown accidental', () => {
        expect(() => { Note.fromString('Ct')}).toThrowError();
    });

    it('show throw if given bad alter amount', () => {
        expect(() => { new Note('C', 20)}).toThrowError();
    });

})

describe("Note.name()", () => {
    it('should return proper strings', () => {
        expect(Note.fromString("C").name()).toEqual("C");
        expect(Note.fromString("Bb").name()).toEqual("Bb");
        expect(Note.fromString("A#").name()).toEqual("A#");
        expect(Note.fromString("Gbb").name()).toEqual("Gbb");
        expect(Note.fromString("Fx").name()).toEqual("Fx");
    });


});

describe("Note.nameDisplay()", () => {
    it('should return proper strings', () => {
        expect(Note.fromString("C").nameUnicode()).toEqual("C");
        expect(Note.fromString("Bb").nameUnicode()).toEqual("B\u266D");
        expect(Note.fromString("A#").nameUnicode()).toEqual("A\u266F");
        expect(Note.fromString("Gbb").nameUnicode()).toEqual("G\uD834\uDD2B");
        expect(Note.fromString("Fx").nameUnicode()).toEqual("F\uD834\uDD2A");
    });


});

describe ("Note.clone", () => {
    it("should clone", () => {

        const x = new Note('D', 2);
        const clone = x.clone();

        expect(clone).toEqual(x);

    });
});

describe ("Note.equal()", () => {
    it("Should be equal for clones", () => {
        const x = new Note('F', -2);
        
        expect(x.clone().equals(x)).toBeTruthy();
    });

    it ("Should take into account the alter", () => {

        const x = new Note('F', -2);
        expect(x.equals(Note.fromString('F#'))).toBeFalsy();
        expect(x.equals(Note.fromString('Fb'))).toBeFalsy();
        expect(x.equals(Note.fromString('Fbb'))).toBeTruthy();

    });

    it ("Should take into account the note class", () => {

        const x = new Note('F', -2);
        expect(x.equals(Note.fromString('G'))).toBeFalsy();
        expect(x.equals(Note.fromString('Gb'))).toBeFalsy();
        expect(x.equals(Note.fromString('Gbb'))).toBeFalsy();

    });

});

describe ("Note.same()", () => {
    it("Should be equal for clones", () => {
        const x = new Note('F', -2);
        
        expect(x.clone().isSame(x)).toBeTruthy();
    });

    it ("Should simplify", () => {

        const x = Note.fromString('Ex');
        expect(x.isSame(Note.fromString('F#'))).toBeTruthy();
        expect(x.isSame(Note.fromString('Gb'))).toBeTruthy();

        expect(x.isSame(Note.fromString('Fb'))).toBeFalsy();

    });


});

describe("Note.simplify", () => {
    it("should keep unaltered notes the same", () => {
        const x = new Note('F', 0);
        expect(x.simplify()).toEqual(x);
    });

    it("should simplify E# to F", () => {
        const x = new Note('E', 1);
        expect(x.simplify()).toEqual(new Note('F', 0));
    });

    it("should simplify Cb to B", () => {
        const x = new Note('C', -1);
        expect(x.simplify()).toEqual(new Note('B', 0));
    });

    it("should simplify C# to itself", () => {
        const x = new Note('C', 1);
        expect(x.simplify()).toEqual(new Note('C', 1));
    });

    it("should simplify Bb to itself", () => {
        const x = new Note('B', -1);
        expect(x.simplify()).toEqual(new Note('B', -1));
    });

    it("should simplify Cx to D", () => {
        const x = new Note('C', 2);
        expect(x.simplify()).toEqual(new Note('D', 0));
    });

    it("should simplify Ex to F#", () => {
        const x = new Note('E', 2);
        expect(x.simplify()).toEqual(new Note('F', 1));
    });

    it("should simplify Cbb to Bb", () => {
        const x = new Note('C', -2);
        expect(x.simplify()).toEqual(new Note('B', -1));
    });


});

describe("Note.toSharp", () => {
    it("should keep unaltered notes the same", () => {
        const x = new Note('F', 0);
        expect(x.toSharp()).toEqual(x);
    });

    it("should simplify E# to F", () => {
        const x = new Note('E', 1);
        expect(x.toSharp()).toEqual(new Note('F'));
    });

    it("should simplify Cb to B", () => {
        const x = new Note('C', -1);
        expect(x.toSharp()).toEqual(new Note('B'));
    });

    it("should simplify C# to itself", () => {
        const x = new Note('C', 1);
        expect(x.toSharp()).toEqual(x);
    });

    it("should simplify Bb to A#", () => {
        const x = new Note('B', -1);
        expect(x.toSharp()).toEqual(new Note('A', 1));
    });

    it("should simplify Cx to D", () => {
        const x = new Note('C', 2);
        expect(x.toSharp()).toEqual(new Note('D'));
    });

    it("should simplify Ex to F#", () => {
        const x = new Note('E', 2);
        expect(x.toSharp()).toEqual(new Note('F', 1));
    });

    it("should simplify Cbb to A#", () => {
        const x = new Note('C', -2);
        expect(x.toSharp()).toEqual(new Note('A', 1));
    });


});

describe("Note.interval", () => {

    it("should be zero if notes are the same", () => {

        expect(Note.fromString("C#").interval(Note.fromString("Db"))).toEqual(0);
        expect(new Note("E").interval(Note.fromString("Fb"))).toEqual(0);
        expect(Note.fromString("C#").interval(Note.fromString("Bx"))).toEqual(0);
        expect(new Note("G").interval(Note.fromString("Abb"))).toEqual(0);

    });

    it("should handle the alters of the same note", () => {

        expect(new Note("C").interval(new Note("G"))).toEqual(7);
        expect(Note.fromString("Cb").interval(Note.fromString("C#"))).toEqual(2);
        expect(new Note("E").interval(Note.fromString("Ex"))).toEqual(2);
        expect(Note.fromString("C#").interval(Note.fromString("Cx"))).toEqual(1);
        expect(Note.fromString("Gbb").interval(new Note("G"))).toEqual(2);

    });

    it("should handle octave wraps", () => {

        expect(new Note("G").interval(new Note("C"))).toEqual(5);
        expect(new Note("C", 1).interval(new Note("C"))).toEqual(11);
        expect(new Note("F").interval(new Note("E", -1))).toEqual(10);
        expect(new Note("C", 2).interval(new Note("C", -1))).toEqual(9);

    });
});

describe("sharpen/flatten", () => {
    it ("should fail for 0 or negative moves", () => {

        const note = new Note('C');

        expect(() => { note.sharpen(0); }).toThrowError();
        expect(() => { note.sharpen(-1); }).toThrowError();
        expect(() => { note.flatten(0); }).toThrowError();
        expect(() => { note.flatten(-1); }).toThrowError();

    });

    it ("should fail for over aggressive moves", () => {

        const note = new Note('C', 1);

        expect(() => { note.sharpen(2); }).toThrowError();
        expect(() => { note.flatten(4); }).toThrowError();

    });

    it ("should return the correct answer", () => {

        const note = new Note('C', 1);

        expect(note.sharpen(1).name()).toEqual("Cx");
        expect(note.flatten(3).name()).toEqual("Cbb");

    });


});