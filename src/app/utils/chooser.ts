export interface Choice<Type> {
    choice : Type;
    weight : number;
}

export function mkch<T>(c : T, w? : number) : Choice<T> {
    return { 'choice' : c, 'weight' : (w ? w : 1) };
}

export class Chooser<T> {

    choices : Choice<T>[] = [];
    weights : number[] = [];
    total_weight  = 0.0;

    constructor(choices : Choice<T>[] ) {
        this.choices = choices;

        let accum = 0.0;
        for (const c of choices) {
            accum += c.weight;
            this.weights.push(accum);
        }

        this.total_weight = accum;
    
    }

    pick() : Choice<T> {

        /*
         * Use the cryupto interface to get random nubmers.
         * Math.random is really aweful. While it is indeed a flat 
         * distribution, it is very "streaky", with relative long runs
         * with only small changes in value.
         */

        const a = new Uint32Array(1);
        crypto.getRandomValues(a);

        const rnd_num = a[0] * this.total_weight / Math.pow(2, 32);
        let index = 0;
        for (const w of this.weights) {
            if (rnd_num <= w) {
                return this.choices[index];
            }
            index += 1;
        }

        /* Shouldn't get here. Only way this could happen is if somebody
         * messed with the fields of the object. Don't do that.
         */
    
        throw Error("Something went horribly wrong.");        
    }

    choose() : T {
        return this.pick().choice
    }
}


export function equalWeightedChooser<T>(choices : T[]) : Chooser<T> {
    return new Chooser(choices.map(v => mkch(v, 1)));
}

export function chooseFrom<T>(choices : Choice<T>[]) : T {
    return (new Chooser(choices)).choose();
}

export function yesno(trueWeight : number, falseWeight : number) : boolean {
    return new Chooser([mkch(true, trueWeight), mkch(false, falseWeight)]).choose();
}
