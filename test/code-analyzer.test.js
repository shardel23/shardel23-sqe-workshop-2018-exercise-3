import assert from 'assert';
import {parseValues} from '../src/js/code-analyzer';

describe('Code-Analyzer class', () => {
    it('parseValues() - normal input', () => {
        let values = '1, 2';
        assert.deepEqual(parseValues(values), [1, 2]);
    });
    it('parseValues() - empty string as input', () => {
        let values = '';
        assert.deepEqual(parseValues(values), []);
    });
});