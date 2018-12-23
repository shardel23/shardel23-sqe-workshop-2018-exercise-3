export class GraphNode {
    constructor(index, label, shape, style, color) {
        this.index = index;
        this.label = label;
        this.shape = shape;
        this.style = style;
        this.color = color;
    }

    toString() {
        return this.index + '[' + 'label=' + this.label + ']';
    }
}