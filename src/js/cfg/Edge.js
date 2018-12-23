export class Edge {
    constructor(from, to, label, color) {
        this.from = from;
        this.to = to;
        this.label = label;
        this.color = color;
    }

    toString() {
        return this.from.index + ' -> ' + this.to.index + ' [' +
            'color=' + this.color + ', ' + 'label=' + this.label + ']';
    }
}