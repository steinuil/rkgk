import * as fc from 'fast-check';
import { toURLSearchParams } from '../../src/api/Params';

test("doesn't include falsy values except for 0", () => {
  const param = toURLSearchParams([
    ['empty string', ''],
    ['empty array', []],
    ['undefined', undefined],
    ['NaN', NaN],
    ['zero', 0],
  ]);

  expect(param.get('empty string')).toBeNull();
  expect(param.get('empty array')).toBeNull();
  expect(param.get('undefined')).toBeNull();
  expect(param.get('NaN')).toBeNull();
  expect(param.get('zero')).toBe('0');
});

test('numbers', () => {
  fc.assert(
    fc.property(fc.integer(), (key) => {
      const param = toURLSearchParams([['a', key]]);
      expect(param.get('a')).toBe(key.toString());
    })
  );
});

test('leaves key strings untouched', () => {
  fc.assert(
    fc.property(fc.fullUnicodeString(1, 999), (key) => {
      const param = toURLSearchParams([['a', key]]);
      expect(param.get('a')).toBe(key);
    })
  );
});

test('turns dates to YYYY-MM-DD', () => {
  fc.assert(
    fc.property(fc.nat(), (n) => {
      fc.pre(n > 0);
      const date = new Date(n);
      const param = toURLSearchParams([['a', date]]).get('a')!;
      expect(param.length).toBeGreaterThanOrEqual(8);
      expect(param.length).toBeLessThanOrEqual(10);
    })
  );
});

test('uses numbered keys for arrays', () => {
  fc.assert(
    fc.property(fc.array(fc.string()), (arr) => {
      const param = toURLSearchParams([['a', arr]]);
      expect(param.get('a')).toBeNull();
    })
  );
});

test('all arrays with length > 0 have a first element', () => {
  fc.assert(
    fc.property(fc.array(fc.integer()), (arr) => {
      fc.pre(arr.length > 0);
      const param = toURLSearchParams([['a', arr]]);
      expect(param.get('a[0]')).toBe(arr[0].toString());
    })
  );
});
