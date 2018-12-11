import $ from 'jquery';
import {parseCode} from './code-analyzer';
import {defaultCodeToParse, postParseActions} from './table-creater';
import {substituteAndAnalyze} from './symbolic-substitutioner';

let isFirst = true;

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
        createTable(postParseActions(parsedCode));
        $('#parsedCode').val(substituteAndAnalyze(parsedCode, {}));
    });
    $('#parseDefaultTextButton').click(() => {
        let codeToParse = defaultCodeToParse;
        $('#codePlaceholder').val(defaultCodeToParse);
        let parsedCode = parseCode(codeToParse);
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
        createTable(postParseActions(parsedCode));
        $('#parsedCode').val(substituteAndAnalyze(parsedCode, {}));
    });
});

export function createTable(tableData) {
    let table = document.getElementById('resultTable');
    table.border = '1';
    if (!isFirst) {
        table.removeChild(table.getElementsByTagName('tbody')[0]); // Remove first instance of body
    }
    const tableBody = document.createElement('tbody');
    tableData.forEach(function(rowData) {
        const row = document.createElement('tr');
        rowData.forEach(function(cellData) {
            const cell = document.createElement('td');
            cell.appendChild(document.createTextNode(cellData));
            row.appendChild(cell);
        });
        tableBody.appendChild(row);
    });
    table.appendChild(tableBody);
    isFirst = false;
}