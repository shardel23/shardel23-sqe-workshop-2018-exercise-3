import {extractRValue, isLiteral} from './table-creater';

export function substituteAndAnalyze(code, args) {
    let newCode = substitute(code);
    statementsAnalyzer(newCode, args);
    return newCode;
}

function substitute(code) {
    return recSubstitute(code, {});
}

function recSubstitute(map, assignments) {
    for (let key in map) {
        let val = map[key];
        if (isLiteral(val)) {
            if (isVariableDeclaration(val)) {
                addToAssignments(map, assignments);
            }
            // TODO: Replace expression value with the appropriate assignment
        }
        else if (val instanceof Array) {
            for (let i = 0; i < val.length; i++) {
                recSubstitute(val[i]);
            }
        }
        else
            recSubstitute(val);
    }
}

function addToAssignments(varDeclarationMap, assignments) {
    let name = varDeclarationMap['id']['name'];
    let initValue = extractRValue(varDeclarationMap['init']);
    assignments[name] = initValue;
}

function isVariableDeclaration(val) {
    return (val === 'VariableDeclarator');
}

function statementsAnalyzer(code, args) {

}
