import $ from 'jquery';
import {parseCode} from './code-analyzer';
import {getParamNames, getParamsMap, testCode} from './symbolic-substitutioner';
import * as esgraph from 'esgraph';
import Viz from 'viz.js';
import {Module, render} from 'viz.js/full.render.js';
import {dotgraphToCFG} from './cfg/cfg';

const defaultInputCode = 'function foo(x, y, z){\n' +
    '    let a = x + 1;\n' +
    '    let b = a + y;\n' +
    '    let c = 0;\n' +
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

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        onParseButtonClick($('#codePlaceholder').val(), $('#paramValuesTextArea').val());
    });
    $('#parseDefaultTextButton').click(() => {
        onParseButtonClick(defaultInputCode, '1, 2, 3');
    });
    $('#parseTestCodeButton').click(() => {
        onParseButtonClick(testCode, '1, 2');
    });
});

function onParseButtonClick(text, valuesString) {
    let codeToParse = text;
    $('#codePlaceholder').val(text);
    let parsedCode = parseCode(codeToParse);
    let paramsMap = getParamsMap(getParamNames(parsedCode), parseValues(valuesString));
    let dotgraph = renderCFGGraph(parsedCode, paramsMap);
    $('#parsedCode').val(dotgraph);
    $('#paramValuesTextArea').val(valuesString);
}

function renderCFGGraph(ast, paramsToValues) {
    let cfg = esgraph(ast['body'][0]['body']);
    let cfgGraph = dotgraphToCFG(esgraph.dot(cfg, ast), cfg[2]);
    cfgGraph.alterGraph(paramsToValues);
    let graph = cfgGraph.toString();
    let dot = 'digraph{' + graph + '}';
    let graphElement = document.getElementById('graph');
    let viz = new Viz({Module, render});
    viz.renderSVGElement(dot)
        .then(function(element) {
            graphElement.innerHTML = '';
            graphElement.append(element);
        });
    return graph;
}

function parseValues(str) {
    if (str.isEmpty) {
        return [];
    }
    let values = str.split(', ');
    let intValues = values.map(str => {
        return parseInt(str);
    });
    return intValues;
}