import * as esprima from 'esprima';
import * as escodegen from 'escodegen';

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse, {loc: true, jsx: true});
};

const astToCode = (parsedCode) => {
    return escodegen.generate(parsedCode);
};

function parseValues(str) {
    if (str === '') {
        return [];
    }
    let values = str.split(', ');
    let intValues = values.map(str => {
        return parseInt(str);
    });
    return intValues;
}

export function getParamsMap(params, values) {
    let result = {};
    for (let i=0; i<values.length && i<params.length; i++) {
        result[params[i]] = values[i];
    }
    return result;
}

export function getParamNames(map) {
    let params = map['body'][0]['params'];
    let paramsNames = [];
    for (let i = 0; i < params.length; i++) {
        let param = params[i];
        paramsNames.push(param['name']);
    }
    return paramsNames;
}

function evaluateBinaryExpression(left, right, operator, args) {
    let evalLeft = evaluateExpression(left, args);
    let evalRight = evaluateExpression(right, args);
    return eval(evalLeft + ' ' + operator + ' ' + evalRight);
}

export function evaluateExpression(expr, args) {
    if (expr['type'] === 'BinaryExpression') {
        let left = expr['left'];
        let operator = expr['operator'];
        let right = expr['right'];
        return evaluateBinaryExpression(left, right, operator, args);
    }
    if (expr['type'] === 'Identifier') {
        return args[expr['name']];
    }
    else { //(expr['type'] === 'Literal') {
        return expr['value'];
    }
}

export {parseCode, astToCode, parseValues};
