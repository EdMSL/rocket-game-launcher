import { assert } from 'chai';
import 'mocha';

import { getPathNameFromLocationPath } from '$utils/strings';

/* Mocha eslint require not use arrow functions as callback for describe, it, etc. */
describe('#Strings', function() {
  it('Should return right string', function() {
    assert.equal(getPathNameFromLocationPath('/rocket'), 'rocket');
  });
});
