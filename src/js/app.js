import $ from 'jquery';
import {parseCode} from './code-analyzer';
import {defaultCodeToParse, substituteAndAnalyze, testCode} from './symbolic-substitutioner';
import * as esgraph from 'esgraph';
import Viz from 'viz.js';
import {Module, render} from 'viz.js/full.render.js';
import {createCFG} from './cfg/cfg';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        onParseButtonClick($('#codePlaceholder').val(), $('#paramValuesTextArea').val());
    });
    $('#parseDefaultTextButton').click(() => {
        onParseButtonClick(defaultCodeToParse, 'x=1,y=2,z=3');
    });
    $('#parseTestCodeButton').click(() => {
        onParseButtonClick(testCode, 'a=1,b=2');
    });
});

function onParseButtonClick(text, valuesString) {
    let codeToParse = text;
    let values = parseValues(valuesString);
    $('#codePlaceholder').val(text);
    let parsedCode = parseCode(codeToParse);
    let result = substituteAndAnalyze(parsedCode, values);
    let codeAfterSub = result[0];
    let analysis = result[1];
    //$('#parsedCode').val(JSON.stringify(parseCode(codeAfterSub), null, 3));
    generateColorfulCode(codeAfterSub, analysis);
    $('#parsedCode').val(rednderCFGGraph(parsedCode));
}

function rednderCFGGraph(ast) {
    let cfg = esgraph(ast['body'][0]['body']);
    let graph = esgraph.dot(cfg, ast);
    graph = createCFG(ast).toString();
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
        return {};
    }
    let map = {};
    let pairs = str.split(',');
    for (let i=0; i<pairs.length; i++) {
        let pair = pairs[i];
        let keyAndValue = pair.split('=');
        map[keyAndValue[0]] = parseInt(keyAndValue[1]);
    }
    return map;
}

const booleanToColor = {
    true: 'green',
    false: 'red',
};

function initializeParagraph(p) {
    p.innerHTML = '';
    p.appendChild(document.createTextNode('Code After Substitution:'));
    p.appendChild(document.createElement('br'));
    p.appendChild(document.createElement('br'));
}

function generateColorfulCode(codeAfterSub, analysis) {
    let linesOfCode = codeAfterSub.split('\n');
    let paragraph = document.getElementById('codeParagraph');
    initializeParagraph(paragraph);
    for (let index in linesOfCode) {
        let lineText = linesOfCode[index];
        let br = document.createElement('br');
        if (isIfLine(lineText)) {
            let value = analysis.shift();
            paragraph.innerHTML += spanify(lineText, booleanToColor[value]);
            paragraph.appendChild(br);
        }
        else {
            paragraph.appendChild(document.createTextNode(lineText));
            paragraph.appendChild(br);
        }
    }
}

function spanify(sentence, color) {
    return '<span style="color: ' + color + '; ">' + sentence + '</span>';
}

function isIfLine(line) {
    return (line.includes(' if'));
}