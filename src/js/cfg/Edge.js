export class Edge {
    constructor(from, to, label, color) {
        this.from = from;
        this.to = to;
        this.label = label;
        this.color = color;
    }

    toString() {
        return this.from + ' -> ' + this.to +
            ' [' + this.attributesToString() + ']';
    }

    attributesToString() {
        let color = this.colorToString();
        let label = this.labelToString();
        if (color !== '' && label !== '') {
            return color + ', ' + label;
        }
        if (color !== '') {
            return color;
        }
        if (label !== '') {
            return label;
        }
        return '';
    }

    colorToString() {
        if (this.color !== '') {
            return 'color=' + this.color;
        }
        else {
            return '';
        }
    }

    labelToString() {
        if (this.label !== '') {
            return 'label=' + this.label;
        }
        else {
            return '';
        }
    }
}

