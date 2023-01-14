import { Note } from "./note";

describe("Note constructor", () => {
    it ('should create instance with simple string note name', () => {

        const note = new Note('C');

        expect(note).toBeTruthy();
        expect(note.noteClass).toEqual('C');
        expect(note.alter).toEqual(0);

    });

    it ('should handle/parse sharp accidental in string note name', () => {

        const note = new Note('D#');

        expect(note).toBeTruthy();
        expect(note.noteClass).toEqual('D');
        expect(note.alter).toEqual(1);

    });

    it ('should handle/parse flat accidental in string note name', () => {

        const note = new Note('Gb');

        expect(note).toBeTruthy();
        expect(note.noteClass).toEqual('G');
        expect(note.alter).toEqual(-1);

    });

    it ('should handle/parse double sharp accidental in string note name', () => {

        const note = new Note('Ex');

        expect(note).toBeTruthy();
        expect(note.noteClass).toEqual('E');
        expect(note.alter).toEqual(2);

    });

    it ('should handle/parse double flat accidental in string note name', () => {

        const note = new Note('Abb');

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

    it('show throw if given blank note name', () => {
        expect(() => { new Note('')}).toThrowError();
    });

    it('show throw if given an unknown note name', () => {
        expect(() => { new Note('R')}).toThrowError();
    });

    it('show throw if given an unknown accidental', () => {
        expect(() => { new Note('Ct')}).toThrowError();
    });

    it('show throw if given bad alter amount', () => {
        expect(() => { new Note('C', 20)}).toThrowError();
    });

    it('show throw if alter is used with an accidental', () => {
        expect(() => { new Note('C#', 2)}).toThrowError();
    });
})

describe("Note.note()", () => {
    it('should return proper strings', () => {
        expect(new Note("C").note()).toEqual("C");
        expect(new Note("Bb").note()).toEqual("Bb");
        expect(new Note("A#").note()).toEqual("A#");
        expect(new Note("Gbb").note()).toEqual("Gbb");
        expect(new Note("Fx").note()).toEqual("Fx");
    });


});

describe("Note.noteDisplay()", () => {
    it('should return proper strings', () => {
        expect(new Note("C").noteDisplay()).toEqual("C");
        expect(new Note("Bb").noteDisplay()).toEqual("B\u266D");
        expect(new Note("A#").noteDisplay()).toEqual("A\u266F");
        expect(new Note("Gbb").noteDisplay()).toEqual("G\uD834\uDD2B");
        expect(new Note("Fx").noteDisplay()).toEqual("F\uD834\uDD2A");
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
        
        expect(x.clone().equal(x)).toBeTruthy();
    });

    it ("Should take into account the alter", () => {

        const x = new Note('F', -2);
        expect(x.equal(new Note('F#'))).toBeFalsy();
        expect(x.equal(new Note('Fb'))).toBeFalsy();
        expect(x.equal(new Note('Fbb'))).toBeTruthy();

    });

    it ("Should take into account the note class", () => {

        const x = new Note('F', -2);
        expect(x.equal(new Note('G'))).toBeFalsy();
        expect(x.equal(new Note('Gb'))).toBeFalsy();
        expect(x.equal(new Note('Gbb'))).toBeFalsy();

    });

});

describe ("Note.same()", () => {
    it("Should be equal for clones", () => {
        const x = new Note('F', -2);
        
        expect(x.clone().same(x)).toBeTruthy();
    });

    it ("Should simplify", () => {

        const x = new Note('Ex');
        expect(x.same(new Note('F#'))).toBeTruthy();
        expect(x.same(new Note('Gb'))).toBeTruthy();

        expect(x.same(new Note('Fb'))).toBeFalsy();

    });


});

describe("Note.simplify", () => {
    it("should keep unaltered notes the same", () => {
        const x = new Note('F');
        expect(x.simplify()).toEqual(x);
    });

    it("should simplify E# to F", () => {
        const x = new Note('E#');
        expect(x.simplify()).toEqual(new Note('F'));
    });

    it("should simplify Cb to B", () => {
        const x = new Note('Cb');
        expect(x.simplify()).toEqual(new Note('B'));
    });

    it("should simplify C# to itself", () => {
        const x = new Note('C#');
        expect(x.simplify()).toEqual(new Note('C#'));
    });

    it("should simplify Bb to itself", () => {
        const x = new Note('Bb');
        expect(x.simplify()).toEqual(new Note('Bb'));
    });

    it("should simplify Cx to D", () => {
        const x = new Note('Cx');
        expect(x.simplify()).toEqual(new Note('D'));
    });

    it("should simplify Ex to F#", () => {
        const x = new Note('Ex');
        expect(x.simplify()).toEqual(new Note('F#'));
    });

    it("should simplify Cbb to Bb", () => {
        const x = new Note('Cbb');
        expect(x.simplify()).toEqual(new Note('Bb'));
    });


});

describe("Note.toSharp", () => {
    it("should keep unaltered notes the same", () => {
        const x = new Note('F');
        expect(x.toSharp()).toEqual(x);
    });

    it("should simplify E# to F", () => {
        const x = new Note('E#');
        expect(x.toSharp()).toEqual(new Note('F'));
    });

    it("should simplify Cb to B", () => {
        const x = new Note('Cb');
        expect(x.toSharp()).toEqual(new Note('B'));
    });

    it("should simplify C# to itself", () => {
        const x = new Note('C#');
        expect(x.toSharp()).toEqual(new Note('C#'));
    });

    it("should simplify Bb to A#", () => {
        const x = new Note('Bb');
        expect(x.toSharp()).toEqual(new Note('A#'));
    });

    it("should simplify Cx to D", () => {
        const x = new Note('Cx');
        expect(x.toSharp()).toEqual(new Note('D'));
    });

    it("should simplify Ex to F#", () => {
        const x = new Note('Ex');
        expect(x.toSharp()).toEqual(new Note('F#'));
    });

    it("should simplify Cbb to A#", () => {
        const x = new Note('Cbb');
        expect(x.toSharp()).toEqual(new Note('A#'));
    });


});

describe("Note.interval", () => {

    it("should be zero if notes are the same", () => {

        expect(new Note("C#").interval(new Note("Db"))).toEqual(0);
        expect(new Note("E").interval(new Note("Fb"))).toEqual(0);
        expect(new Note("C#").interval(new Note("Bx"))).toEqual(0);
        expect(new Note("G").interval(new Note("Abb"))).toEqual(0);

    });

    it("should handle the alters of the same note", () => {

        expect(new Note("C").interval(new Note("G"))).toEqual(7);
        expect(new Note("Cb").interval(new Note("C#"))).toEqual(2);
        expect(new Note("E").interval(new Note("Ex"))).toEqual(2);
        expect(new Note("C#").interval(new Note("Cx"))).toEqual(1);
        expect(new Note("Gbb").interval(new Note("G"))).toEqual(2);

    });

    it("should handle octave wraps", () => {

        expect(new Note("G").interval(new Note("C"))).toEqual(5);
        expect(new Note("C#").interval(new Note("C"))).toEqual(11);
        expect(new Note("F").interval(new Note("Eb"))).toEqual(10);
        expect(new Note("Cx").interval(new Note("Cb"))).toEqual(9);

    });
});