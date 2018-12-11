export const defaultCodeToParse = 'function binarySearch(X, V, n){\n' +
    '    let low, high, mid;\n' +
    '    low = 0;\n' +
    '    high = n - 1;\n' +
    '    for (let i=0; i<1; i++) {\n' +
    '        let j=i;\n' +
    '    }\n' +
    '    while (low <= high) {\n' +
    '        mid = (low + high)/2;\n' +
    '        if (X < V[mid])\n' +
    '            high = mid - 1;\n' +
    '        else if (X > V[mid])\n' +
    '            low = mid + 1;\n' +
    '        else\n' +
    '            return mid;\n' +
    '    }\n' +
    '    return foo(1, 3);\n' +
    '}';

let entries = [];
let headers = ['Line', 'Type', 'Name', 'Condition', 'Value'];
let table = [headers];

export {entries};

export function postParseActions(parsedCode) {
    clearData();
    recursiveExtract(parsedCode);
    entriesToView();
    return table;
}

function clearData() {
    entries = [];
    table = [headers];
}

function entriesToView() {
    entries.forEach(function(entry) {
        table.push([entry.line, entry.type, entry.name, entry.cond, entry.value]);
    });
}

const extractFunctions = {
    'FunctionDeclaration' : extractFunctionDeclaration,
    'WhileStatement' : extractWhileStatement,
    'IfStatement' : extractIfStatement,
    'ReturnStatement' : extractReturnStatement,
    'VariableDeclarator' : extractVariableDeclarator,
    'AssignmentExpression' : extractAssignmentExpression,
    'ForStatement' : extractForStatement
};

export function isLiteral(exp) {
    return (typeof exp === 'string' || typeof exp === 'number' || typeof exp === 'boolean');
}

function isKnownType(key, val) {
    return (key === 'type' && extractFunctions[val] != undefined);
}

function handleLiteral(map, key, val) {
    if (isKnownType(key, val)) {
        extractFunctions[val](map);
    }
}

function recursiveExtract(map) {
    for (let key in map) {
        let val = map[key];
        if (isLiteral(val)) {
            handleLiteral(map, key, val);
        }
        else if (val instanceof Array) {
            for (let i = 0; i < val.length; i++) {
                recursiveExtract(val[i]);
            }
        }
        else
            recursiveExtract(val);
    }
}

export {recursiveExtract};

function extractFunctionDeclaration(functionDeclarationMap) {
    let line = functionDeclarationMap['id']['loc']['start']['line'];
    let type = 'function declaration';
    let name = functionDeclarationMap['id']['name'];
    let cond = '';
    let value = '';
    entries.push(new Entry(line, type, name, cond, value));
    extractFunctionParams(functionDeclarationMap['params']);
}

function extractFunctionParams(paramsArray) {
    for (let i=0; i<paramsArray.length; i++) {
        let line = paramsArray[i]['loc']['start']['line'];
        let type = 'function parameter';
        let name = extractRValue(paramsArray[i]);
        let cond = '';
        let value = '';
        entries.push(new Entry(line, type, name, cond, value));
    }
}

function extractWhileStatement(whileStatementMap) {
    let line = whileStatementMap['loc']['start']['line'];
    let type = 'while statement';
    let name = '';
    let cond = extractRValue(whileStatementMap['test']);
    let value = '';
    entries.push(new Entry(line, type, name, cond, value));
}

function extractForStatement(forStatementMap) {
    let line = forStatementMap['loc']['start']['line'];
    let type = 'for statement';
    let name = '';
    let cond = extractRValue(forStatementMap['test']);
    let value = '';
    entries.push(new Entry(line, type, name, cond, value));
}

function extractReturnStatement(returnStatementMap) {
    let line = returnStatementMap['loc']['start']['line'];
    let type = 'return statement';
    let name = '';
    let cond = '';
    let value = extractRValue(returnStatementMap['argument']);
    entries.push(new Entry(line, type, name, cond, value));
}

function extractIfStatement(IfStatementMap) {
    let line = IfStatementMap['loc']['start']['line'];
    let type = 'if statement';
    let name = '';
    let cond = extractRValue(IfStatementMap['test']);
    let value = '';
    entries.push(new Entry(line, type, name, cond, value));
}

function extractVariableDeclarator(variableDeclaratorMap) {
    let line = variableDeclaratorMap['loc']['start']['line'];
    let type = 'variable declaration';
    let name = variableDeclaratorMap['id']['name'];
    let cond = '';
    let value = extractRValue(variableDeclaratorMap['init']);
    entries.push(new Entry(line, type, name, cond, value));
}

function extractAssignmentExpression(assignmentExpressionMap) {
    let line = assignmentExpressionMap['loc']['start']['line'];
    let type = 'assignment expression';
    let name = extractRValue(assignmentExpressionMap['left']);
    let cond = '';
    let value = extractRValue(assignmentExpressionMap['right']);
    entries.push(new Entry(line, type, name, cond, value));
}

export const rValueExtractFunctions = {
    'MemberExpression' : extractMemberExpression,
    'BinaryExpression' : extractBinaryExpression,
    'UnaryExpression' : extractUnaryExpression,
    'LogicalExpression' : extractLogicalExpression,
    'CallExpression' : extractCallExpression
};

export function extractRValue(rValueMap) {
    if (rValueMap === null) return null;
    let type = rValueMap['type'];
    if (type === 'Literal') return rValueMap['value'];
    if (type === 'Identifier') return rValueMap['name'];
    if (rValueExtractFunctions[type] != undefined)
        return rValueExtractFunctions[type](rValueMap);
    return 'UnsupportedRValue';
}


function extractCallExpression(callExpressionMap) {
    let callee = extractRValue(callExpressionMap['callee']);
    let result = callee + '(';
    let args = callExpressionMap['arguments'];
    let calcedArgs = args.map(extractRValue);
    for (let i=0; i<calcedArgs.length-1; i++) {
        result += calcedArgs[i] + ', ';
    }
    result += calcedArgs[calcedArgs.length-1] + ')';
    return result;
}

function extractMemberExpression(memberExpressionMap) {
    let object = extractRValue(memberExpressionMap['object']);
    let property = extractRValue(memberExpressionMap['property']);
    return object + '[' + property + ']';
}

function extractUnaryExpression(unaryExpressionMap) {
    let operator = unaryExpressionMap['operator'];
    let operand = extractRValue(unaryExpressionMap['argument']);
    return operator + operand;
}

function extractLogicalExpression(logicalExpressionMap) {
    let left = extractRValue(logicalExpressionMap['left']);
    let operator = logicalExpressionMap['operator'];
    let right = extractRValue(logicalExpressionMap['right']);
    return left + ' ' + operator + ' ' + right;
}

function extractBinaryExpression(binaryExpressionMap) {
    let left = extractRValue(binaryExpressionMap['left']);
    let operator = binaryExpressionMap['operator'];
    let right = extractRValue(binaryExpressionMap['right']);
    return left + ' ' + operator + ' ' + right;
}

export function Entry(line, type, name, cond, value){
    this.line = line;
    this.type = type;
    this.name = name;
    this.cond = cond;
    this.value = value;
}
