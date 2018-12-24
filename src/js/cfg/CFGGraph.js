export class CFGGraph {
    constructor(nodes, edges) {
        this.nodes = nodes;
        this.edges = edges;
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
}