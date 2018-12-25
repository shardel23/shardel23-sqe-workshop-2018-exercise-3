import {astToCode} from '../code-analyzer';

export class GraphNode {
    constructor(index, label, shape, style, color) {
        this.index = index;
        this.label = label;
        this.shape = shape;
        this.style = style;
        this.color = color;
    }

    toString() {
        return this.index + ' [' + this.attributesToString() + ']';
    }

    addAstNode(ast) {
        this.ast = ast;
    }

    modifyLabel() {
        this.label = '"' + astToCode(this.ast) + '"';
    }

    labelToString() {
        if (this.label !== '') {
            return 'label=' + this.label;
        }
        else {
            return '';
        }
    }

    shapeToString() {
        if (this.shape !== '') {
            return 'shape=' + this.shape;
        }
        else {
            return '';
        }
    }

    colorToString() {
        if (this.color !== '') {
            return 'color=' + this.color;
        }
        else {
            return '';
        }
    }

    styleToString() {
        if (this.style !== '') {
            return 'style=' + this.style;
        }
        else {
            return '';
        }
    }

    attributesToString() {
        let res = '';
        let isFirst = true;
        let shape = this.shapeToString();
        let label = this.labelToString();
        let color = this.colorToString();
        let style = this.styleToString();
        let arr = [shape, label, color, style];
        arr.forEach(attribute => {
            if (attribute !== '') {
                if (!isFirst) {
                    res += ', ';
                }
                res += attribute;
                isFirst = false;
            }
        });
        return res;
    }
}