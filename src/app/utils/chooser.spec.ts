import { Chooser, mkch, equalWeightedChooser } from './chooser';

const TEST_COUNT = 10000;

describe('Chooser', () => {
  it('should create an instance', () => {
    expect(new Chooser([mkch(1,1)])).toBeTruthy();
  });

  it('should return only an item in the list', () => {
    const chooser = new Chooser([mkch(1,1), mkch(2,1), mkch(3,1)]);

    expect([1,2,3].includes(chooser.pick().choice)).toBeTruthy();
  });


  it('should follow the given weightings', () => {
    const chooser = new Chooser([mkch(0,1), mkch(1,2), mkch(2,1)]);

    const buckets = [0, 0, 0];

    for (let i = 1; i <= TEST_COUNT; ++i) {
      buckets[chooser.choose()] +=1;
    }

    const upper_bound = Math.ceil((TEST_COUNT / 4) * 1.05);
    const lower_bound = Math.floor((TEST_COUNT / 4) * 0.95);

    expect(buckets[0]).toBeGreaterThan(lower_bound);
    expect(buckets[1]).toBeGreaterThan(lower_bound*2);
    expect(buckets[2]).toBeGreaterThan(lower_bound);

    expect(buckets[0]).toBeLessThan(upper_bound);
    expect(buckets[1]).toBeLessThan(upper_bound*2);
    expect(buckets[2]).toBeLessThan(upper_bound);

  });

});


describe("Chooser.equalWeightedChooser", () => {
  it('should be a roughly flat distribution', () => {
    const chooser = equalWeightedChooser([0,1,2]);

    const buckets = [0, 0, 0];

    for (let i = 1; i <= TEST_COUNT; ++i) {
      buckets[chooser.choose()] +=1;
    }

    const upper_bound = Math.ceil((TEST_COUNT / 3) * 1.05);
    const lower_bound = Math.floor((TEST_COUNT / 3) * 0.95);

    buckets.forEach((v) => {
      expect(v).toBeGreaterThan(lower_bound);
      expect(v).toBeLessThan(upper_bound);
    })
  });

});

