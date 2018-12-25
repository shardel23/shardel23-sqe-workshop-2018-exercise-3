import * as esprima from 'esprima';
import {Edge} from './Edge';
import {GraphNode} from './GraphNode';

export class CFGGraph {
    constructor(nodes, edges) {
        this.nodes = nodes;
        this.edges = edges;
        this.emptyNodesCounter = 0;
    }

    toString() {
        let res = '';
        for (let i=0; i<this.nodes.length; i++) {
            res += this.nodes[i].toString() + '\n';
        }
        for (let i=0; i<this.edges.length; i++){
            res += this.edges[i].toString() + '\n';
        }
        return res;
    }

    removeExceptionEdges() {
        this.edges = this.edges.filter((e) => e.color !== '"red"');
    }

    modifyLabels() {
        //this.nodes.forEach((n) => n.modifyLabel());
        for (let i=1; i<this.nodes.length-1; i++) {
            this.nodes[i].modifyLabel();
        }
    }

    removeNodes(labels) {
        let indexes = [];
        this.nodes = this.nodes.filter(n => {
            if (!labels.includes(n.label)) {
                return true;
            }
            indexes.push(n.index);
            return false;
        });
        this.removeEdges(indexes);
    }

    removeEdges(nodes) {
        this.edges = this.edges.filter(
            e => !nodes.includes(e.from) && !nodes.includes(e.to));
    }

    joinNodes() {
        for (let i=0; i<this.nodes.length-1; i++) {
            if (!isIforWhileNode(this.nodes[i]) && !isIforWhileNode(this.nodes[i+1])) {
                if (this.isFatherOf(this.nodes[i], this.nodes[i+1]) && this.hasOnlyOneFather(this.nodes[i+1])) {
                    this.joinTwoNodes(this.nodes[i], this.nodes[i + 1]);
                    i--;
                }
            }
        }
    }

    createEmptyNodes() {
        let nodesToSwitch = [];
        let counters = {};
        this.edges.forEach(e => {
            let nodeTo = e.to;
            counters[nodeTo] = counters[nodeTo] ? counters[nodeTo] + 1 : 1;
        });
        Object.keys(counters).forEach(key => {
            if (counters[key] > 1) {
                nodesToSwitch.push(key);
            }
        });
        nodesToSwitch.forEach(n => {
            let emptyNode = this.generateEmptyNode();
            let newEdge = new Edge(emptyNode.index, n, '', '');
            this.edges.forEach(e => {
                let nodeTo = e.to;
                if (nodeTo === n) {
                    e.to = emptyNode.index;
                }
            });
            this.nodes.push(emptyNode);
            this.edges.push(newEdge);
        });
    }

    generateEmptyNode() {
        let index = this.emptyNodesCounter++;
        return new GraphNode('en' + index, '""', '', '', '');
    }

    isFatherOf(father, son) {
        let found = false;
        this.edges.forEach(e => {
            if (e.from === father.index && e.to === son.index) {
                found = true;
            }
        });
        return found;
    }

    joinTwoNodes(n1, n2) {
        n1.label = n1.label.substring(0, n1.label.length - 1) +
            '\n' + n2.label.substring(1, n2.label.length - 1) + '"';
        this.removeSpecificNode(n2);
    }

    hasOnlyOneFather(node) {
        let count = 0;
        this.edges.forEach(e => {
            if (e.to === node.index) {
                count++;
            }
        });
        return count === 1;
    }

    removeSpecificNode(node) {
        this.nodes = this.nodes.filter(n => n != node);
        let index = node.index;
        let edgesToRemove = [];
        let tos = [];
        let froms = [];
        for (let i=0; i<this.edges.length; i++) {
            let e = this.edges[i];
            if (e.from === index) {
                tos.push(e.to);
                edgesToRemove.push(e);
            }
            if (e.to === index) {
                froms.push(e.from);
                edgesToRemove.push(e);
            }
        }
        froms.forEach(f => {
            tos.forEach(t => {
                this.edges.push(new Edge(f, t, '', ''));
            });
        });
        this.removeSpecificEdges(edgesToRemove);
    }

    removeSpecificEdges(edges) {
        this.edges = this.edges.filter(e => !edges.includes(e));
    }

    shape() {
        this.nodes.forEach(n => {
            if (isIforWhileNode(n)) {
                n.shape = 'diamond';
            }
            else {
                n.shape = 'square';
            }
        });
    }

    color() {
        let nodesToColor = this.calcNodesToColor();
        nodesToColor.forEach(n => {
            n.color = 'green';
            n.style = 'filled';
        });
    }

    calcNodesToColor() {
        let done = false;
        let nodesToColor = [];
        let node = this.nodes[0];
        while (!done) {
            nodesToColor.push(node);
            if (this.isEmptyNode(node)) {
                node = this.findNextNode(node);
            }
            else {
                if (node.ast.type === esprima.Syntax.ReturnStatement) {
                    done = true;
                }
                if (isIforWhileNode(node)) {
                    let evaluation = Math.random() < 0.5 ? '"false"' : '"true"';
                    // TODO: Replace this with real evaluation
                    node = this.findNextNodeByEvaluation(node, evaluation);
                }
                else {
                    node = this.findNextNode(node);
                }
            }
        }
        return nodesToColor;
    }

    isEmptyNode(node) {
        return node.index.startsWith('en');
    }

    findNextNodeByEvaluation(fromNode, evaluation) {
        for (let i=0; i<this.edges.length; i++) {
            let e = this.edges[i];
            if (e.from === fromNode.index && e.label === evaluation) {
                return this.findNodeByIndex(e.to);
            }
        }
    }

    findNextNode(fromNode) {
        for (let i=0; i<this.edges.length; i++) {
            let e = this.edges[i];
            if (e.from === fromNode.index) {
                return this.findNodeByIndex(e.to);
            }
        }
    }

    findNodeByIndex(index) {
        for (let i=0; i<this.nodes.length; i++) {
            let n = this.nodes[i];
            if (n.index === index) {
                return n;
            }
        }
    }

    alterGraph() {
        this.removeExceptionEdges();
        this.modifyLabels();
        this.removeNodes(['"entry"', '"exit"']);
        this.joinNodes();
        this.shape();
        this.createEmptyNodes();
        this.color();
    }
}

const expressionTypes = [
    esprima.Syntax.BinaryExpression,
    esprima.Syntax.LogicalExpression,
    esprima.Syntax.UnaryExpression,
    esprima.Syntax.MemberExpression,
];

function isIforWhileNode(node) {
    return expressionTypes.includes(node.ast.type);
}
