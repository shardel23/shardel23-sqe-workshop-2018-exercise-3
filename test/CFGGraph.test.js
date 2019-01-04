import assert from 'assert';
import {GraphNode} from '../src/js/cfg/GraphNode';
import {Edge} from '../src/js/cfg/Edge';
import {CFGGraph} from '../src/js/cfg/CFGGraph';

describe('CFGGraph class - toString()', () => {
    it('all attributes', () => {
        let n1 = new GraphNode('n1', '', '', '', '');
        let n2 = new GraphNode('n2', '', '', '', '');
        let nodes = [n1, n2];
        let e = new Edge('n1', 'n2', '', '');
        let edges = [e];
        let cfgGraph = new CFGGraph(nodes, edges);
        assert.deepEqual(cfgGraph.toString(), 'n1 []\nn2 []\nn1 -> n2 []\n');
    });
});

describe('CFGGraph class - compareTo(other)', () => {
    it('same graphs exactly', () => {
        let cfgGraph1 = CFGGraph.newGraph(4, 4);
        let cfgGraph2 = CFGGraph.newGraph(4, 4);
        assert(cfgGraph1.compareTo(cfgGraph2));
    });
    it('differ in number of nodes', () => {
        let cfgGraph1 = CFGGraph.newGraph(2, 1);
        let cfgGraph2 = CFGGraph.newGraph(3, 1);
        assert(!cfgGraph1.compareTo(cfgGraph2));
    });
    it('differ in number of edges', () => {
        let cfgGraph1 = CFGGraph.newGraph(2, 1);
        let cfgGraph2 = CFGGraph.newGraph(2, 0);
        assert(!cfgGraph1.compareTo(cfgGraph2));
    });
});