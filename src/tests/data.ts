import { assert } from 'chai';

import { getOneFromThree } from '$utils/data';

/* eslint-disable max-len, @typescript-eslint/ban-ts-comment, @typescript-eslint/no-magic-numbers */
describe('#Data', () => {
  // value, min, max, ожидаемое значение
  const data = [[20, 10, 100], [20, 1, 0], [20, 1, 10], [1, 5, 15]];

  it('Should return correct value from three (isWithZero = true)', () => {
    const results = [20, 20, 10, 5];

    data.forEach((currentData, index) => {
      assert.equal(getOneFromThree(currentData[0], currentData[1], currentData[2]), results[index]);
    });
  });

  it('Should return correct value from three (isWithZero = false)', () => {
    const results = [20, 0, 10, 5];

    data.forEach((currentData, index) => {
      assert.equal(getOneFromThree(currentData[0], currentData[1], currentData[2], false), results[index]);
    });
  });
});
