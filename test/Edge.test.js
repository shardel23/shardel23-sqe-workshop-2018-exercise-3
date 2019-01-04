import {Edge} from '../src/js/cfg/Edge';
import assert from 'assert';

describe('Edge class - toString()', () => {
    it('all attributes', () => {
        let e = new Edge('n7', 'n10', 'theLabel', 'theColor');
        assert.deepEqual(e.toString(), 'n7 -> n10 [color=theColor, label=theLabel]');
    });
    it('no attributes', () => {
        let e = new Edge('n7', 'n10', '', '');
        assert.deepEqual(e.toString(), 'n7 -> n10 []');
    });
    it('only color', () => {
        let e = new Edge('n7', 'n10', '', 'theColor');
        assert.deepEqual(e.toString(), 'n7 -> n10 [color=theColor]');
    });
    it('only label', () => {
        let e = new Edge('n7', 'n10', 'theLabel', '');
        assert.deepEqual(e.toString(), 'n7 -> n10 [label=theLabel]');
    });
});