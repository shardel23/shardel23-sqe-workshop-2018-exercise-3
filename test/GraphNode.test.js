import assert from 'assert';
import {GraphNode} from '../src/js/cfg/GraphNode';

describe('GraphNode class - toString()', () => {
    it('all attributes', () => {
        let n = new GraphNode('n5', 'theLabel', 'theShape', 'theStyle', 'theColor');
        assert.deepEqual(n.toString(), 'n5 [shape=theShape, label=theLabel, color=theColor, style=theStyle]');
    });
    it('no attributes', () => {
        let n = new GraphNode('n20', '', '', '', '');
        assert.deepEqual(n.toString(), 'n20 []');
    });
});