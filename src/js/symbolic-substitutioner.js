import {parsedCodeToOriginalCode} from './code-analyzer';
import * as esprima from 'esprima';

export const testCode = 'function binarySearch(a, b){\n' +
    '    let x = 5;\n' +
    '    let z = x;\n' +
    '    return a[z] + x + b;\n' +
    '}';

export const defaultCodeToParse = 'function foo(x, y, z){\n' +
    '    let a = x + 1;\n' +
    '    let b = a + y;\n' +
    '    let c = 0;\n' +
    '    \n' +
    '    if (b < z) {\n' +
    '        c = c + 5;\n' +
    '        return x + y + z + c;\n' +
    '    } else if (b < z * 2) {\n' +
    '        c = c + x + 5;\n' +
    '        return x + y + z + c;\n' +
    '    } else {\n' +
    '        c = c + z + 5;\n' +
    '        return x + y + z + c;\n' +
    '    }\n' +
    '}\n';

export function substituteAndAnalyze(ast, args) {
    let subbedAst = substitute(ast);
    let ifsEvaluations = statementsAnalyzer(subbedAst, args);
    return [parsedCodeToOriginalCode(subbedAst), ifsEvaluations];
}

function substitute(code) {
    return removeLocals(recSubstitute(code, new Map()));
}

function removeLocals(map) {
    let paramNames = getParamNames(map);
    return removeLocalsRecursive(map, paramNames);
}

function shouldRemoveLocalsFromAssignment(val, i, paramNames) {
    return (val[i]['type'] === 'ExpressionStatement' &&
        val[i]['expression']['type'] === 'AssignmentExpression' &&
        !paramNames.includes(val[i]['expression']['left']['name']));
}

function removeLocalsHandleArray(val, paramNames) {
    for (let i = 0; i < val.length; i++) {
        if (val[i]['type'] === 'VariableDeclaration') {
            val.splice(i, 1);
            i--;
        }
        else if (shouldRemoveLocalsFromAssignment(val, i, paramNames)) {
            val.splice(i, 1);
            i--;
        }
        else {
            removeLocalsRecursive(val[i], paramNames);
        }
    }
}

function removeLocalsRecursive(map, paramNames) {
    for (let key in map) {
        let val = map[key];
        if (isLiteral(val)) {
            //Stop recursion
        }
        else if (val instanceof Array) {
            removeLocalsHandleArray(val, paramNames);
        }
        else {
            removeLocalsRecursive(val, paramNames);
        }
    }
    return map;
}

function getParamNames(map) {
    let params = map['body'][0]['params'];
    let paramsNames = [];
    for (let i = 0; i < params.length; i++) {
        let param = params[i];
        paramsNames.push(param['name']);
    }
    return paramsNames;
}

function handleLiteralRecSubstitute(map, val, assignments) {
    if (rValueSubstituteExpressionFunctions[val] !== undefined) {
        rValueSubstituteExpressionFunctions[val](map, assignments);
    }
    else if (isVariableDeclaration(val)) {
        addToAssignmentsDeclaration(map, assignments);
    }
    else if (isAssignmentExpression(val)) {
        if (rValueSubstituteExpressionFunctions[map['right']['type']] !== undefined) {
            rValueSubstituteExpressionFunctions[map['right']['type']](map['right'], assignments);
        }
        addToAssignmentsAssignmentExpression(map, assignments);
    }
}

function shouldSubstituteAsIdentifier(key, val) {
    return (key === 'init' && isIdentifier(val['type']));
}

function recSubstituteBaseCase(key, val, map, assignments) {
    if (shouldSubstituteAsIdentifier(key, val)) {
        substituteIdentifierOfExpression(map, 'init', assignments);
    }
    else if (isLiteral(val)) {
        handleLiteralRecSubstitute(map, val, assignments);
    }
    else {
        return false;
    }
    return true;
}

function recSubstitute(map, assignments) {
    for (let key in map) {
        let val = map[key];
        if (!recSubstituteBaseCase(key, val, map, assignments)) {
            if (val instanceof Array) {
                for (let i = 0; i < val.length; i++) {
                    recSubstitute(val[i], assignments);
                }
            }
            else
                recSubstitute(val, assignments);
        }
    }
    return map;
}

export const rValueSubstituteExpressionFunctions = {
    'MemberExpression' : substituteMemberExpression,
    'BinaryExpression' : substituteBinaryExpression,
    'UnaryExpression' : substituteUnaryExpression,
    'ReturnStatement' : substituteReturnStatement,
};

function substituteReturnStatement(returnStatementMap, assignments) {
    if (isIdentifier(returnStatementMap['argument']['type'])) {
        substituteIdentifierOfExpression(returnStatementMap, 'argument', assignments);
    }
}

function substituteUnaryExpression(unaryExpressionMap, assignments) {
    if (isIdentifier(unaryExpressionMap['argument']['type'])) {
        substituteIdentifierOfExpression(unaryExpressionMap, 'argument', assignments);
    }
}

function substituteMemberExpression(memberExpressionMap, assignments) {
    if (isIdentifier(memberExpressionMap['property']['type'])) {
        substituteIdentifierOfExpression(memberExpressionMap, 'property', assignments);
    }
}

function substituteBinaryExpression(binaryExpressionMap, assignments) {
    if (isIdentifier(binaryExpressionMap['left']['type'])) {
        substituteIdentifierOfExpression(binaryExpressionMap, 'left', assignments);
    }
    if (isIdentifier(binaryExpressionMap['right']['type'])) {
        substituteIdentifierOfExpression(binaryExpressionMap, 'right', assignments);
    }
    if (rValueSubstituteExpressionFunctions[binaryExpressionMap['left']['type']] !== undefined) {
        rValueSubstituteExpressionFunctions[binaryExpressionMap['left']['type']](binaryExpressionMap['left'], assignments);
    }
}

function substituteIdentifierOfExpression(map, key, assignments) {
    let varName = map[key]['name'];
    if (assignments.get(varName) !== undefined) {
        map[key] = assignments.get(varName);
    }
}

function getValue(expr, assignments) {
    if (expr.type === esprima.Syntax.Literal) {
        return expr;
    }
    else if (expr.type === esprima.Syntax.UnaryExpression) {
        return expr;
    }
    else if (expr.type === esprima.Syntax.BinaryExpression) {
        return expr;
    }
    else { //(expr.type === esprima.Syntax.Identifier)
        let identifierName = expr['name'];
        let newExpr = assignments.get(identifierName);
        return getValue(newExpr, assignments);
    }
}

function addToAssignmentsDeclaration(varDeclarationMap, assignments) {
    let name = varDeclarationMap['id']['name'];
    let initValue = getValue(varDeclarationMap['init'], assignments);
    assignments.set(name, initValue);
}

function addToAssignmentsAssignmentExpression(assignmentExpressionMap, assignments) {
    let name = assignmentExpressionMap['left']['name'];
    let value = assignmentExpressionMap['right'];
    assignments.set(name, value);
}

function isAssignmentExpression(val) {
    return (val === 'AssignmentExpression');
}

function isVariableDeclaration(val) {
    return (val === 'VariableDeclarator');
}

function isIdentifier(val) {
    return (val === 'Identifier');
}

function isLiteral(val) {
    return (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean');
}

function statementsAnalyzer(ast, args) {
    let results = [];
    recAnalyze(ast, args, results);
    return results;
}

function evaluateBinaryExpression(left, right, operator, args) {
    let evalLeft = evaluateExpression(left, args);
    let evalRight = evaluateExpression(right, args);
    return eval(evalLeft + ' ' + operator + ' ' + evalRight);
}

function evaluateExpression(expr, args) {
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

function analyzeLiteral(ast, val, args, results) {
    if (val === 'IfStatement') {
        let test = ast['test'];
        let res = evaluateExpression(test, args);
        results.push(res);
    }
}

function recAnalyze(ast, args, results) {
    for (let key in ast) {
        let val = ast[key];
        if (isLiteral(val)) {
            analyzeLiteral(ast, val, args, results);
        }
        else if (val instanceof Array) {
            for (let i = 0; i < val.length; i++) {
                recAnalyze(val[i], args, results);
            }
        }
        else {
            recAnalyze(val, args, results);
        }
    }
}
