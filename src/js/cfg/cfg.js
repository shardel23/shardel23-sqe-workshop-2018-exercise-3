import {GraphNode} from './GraphNode';
import {Edge} from './Edge';
import {CFGGraph} from './CFGGraph';

export function createCFG(ast) {
    let nodes = [];
    let edges = [];

    let n1 = new GraphNode(1, 'Shahar', '', '', '');
    let n2 = new GraphNode(2, 'Ayelet', '', '', '');

    let e1 = new Edge(n1, n2, 'Loves', 'red');
    let e2 = new Edge(n2, n1, 'Loves', 'red');

    nodes.push(n1, n2);
    edges.push(e1, e2);

    let cfgGraph = new CFGGraph(nodes, edges);
    return cfgGraph;
}

export function dotgraphToCFG(dotgraph) {
    let lines = dotgraph.split('\n');
    let nodes = [];
    let edges = [];
    lines.forEach(parseLine);
    function parseLine(line) {
        if (line === '') {
            return;
        }
        if (line.includes('->')) {
            edges.push(parseEdge(line));
        }
        else {
            nodes.push(parseNode(line));
        }
    }
    let cfg = new CFGGraph(nodes, edges);
    return cfg;
}

function parseNode(line) {
    let tokens = line.split(' ');
    let n = tokens[0];
    let label = parseWordFromLine(line, 'label=');
    let shape = parseWordFromLine(line, 'shape=');
    let style =  parseWordFromLine(line, 'style=');
    let color = parseWordFromLine(line, 'color=');
    return new GraphNode(n, label, shape, style, color);
}

function parseEdge(line) {
    let tokens = line.split(' ');
    let n1 = tokens[0];
    let n2 = tokens[2];
    let label = parseWordFromLine(line, 'label=');
    let color = parseWordFromLine(line, 'color=');
    return new Edge(n1, n2, label, color);
}

function parseWordFromLine(line, wordToParse) {
    let index = line.indexOf(wordToParse);
    if (index === -1) {
        return '';
    }
    index += wordToParse.length;
    let res = '';
    while (line[index] !== ',' && line[index] !== ']') {
        res += line[index];
        index++;
    }
    return res;
}

