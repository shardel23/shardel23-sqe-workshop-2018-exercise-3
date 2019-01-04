import * as esgraph from 'esgraph/lib';
import {dotgraphToCFG} from '../src/js/cfg/cfg';
import {getParamNames, getParamsMap, parseCode, parseValues} from '../src/js/code-analyzer';
import assert from 'assert';
import {CFGGraph} from '../src/js/cfg/CFGGraph';
import {GraphNode} from '../src/js/cfg/GraphNode';

const input1 = 'function foo(x){\n' +
    '    return x;\n' +
    '}\n';
const inputVector1 = '1';

const input2 = 'function foo(x, y, z){\n' +
    '    let a = x + 1;\n' +
    '    let b = a + y;\n' +
    '    let c = 0;\n' +
    '    let d;\n' +
    '    \n' +
    '    if (b < z) {\n' +
    '        c = c + 5;\n' +
    '    } else if (b < z * 2) {\n' +
    '        c = c + x + 5;\n' +
    '    } else {\n' +
    '        c = c + z + 5;\n' +
    '    }\n' +
    '    \n' +
    '    return c;\n' +
    '}\n';
const inputVector2 = '1, 2, 3';

function createCFG(code, inputs) {
    let ast = parseCode(code);
    let inputsVector = parseValues(inputs);
    let paramsMap = getParamsMap(getParamNames(ast), inputsVector);
    let cfg = esgraph(ast['body'][0]['body']);
    let cfgGraph = dotgraphToCFG(esgraph.dot(cfg, ast), cfg[2]);
    cfgGraph.alterGraph(paramsMap);
    return cfgGraph;
}

function generateTestCaseCFG(name, code, inputs, expected) {
    return it(name, () => {
        assert(createCFG(code, inputs).compareTo(expected));
    });
}

describe('Simple graph creation', () => {
    generateTestCaseCFG('Basic function', input1, inputVector1, new CFGGraph(
        [new GraphNode(0, '"return x"')],
        []
    ));
});

describe('Complex graph creation with conditions', () => {
    generateTestCaseCFG('Complex function', input2, inputVector2, CFGGraph.newGraph(8, 9)
    );
});