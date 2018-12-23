import {GraphNode} from './GraphNode';
import {Edge} from './Edge';
import {CFGGraph} from './CFGGraph';

export function createCFG(ast) {
    let nodes = [];
    let edges = [];

    let n1 = new GraphNode(1, 'n1', '', '', '');
    let n2 = new GraphNode(2, 'n2', '', '', '');

    let e1 = new Edge(n1, n2, 'True', 'red');

    nodes.push(n1, n2);
    edges.push(e1);

    let cfgGraph = new CFGGraph(nodes, edges);
    return cfgGraph;
}