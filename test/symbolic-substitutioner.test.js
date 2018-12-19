import {parseCode, parsedCodeToOriginalCode} from '../src/js/code-analyzer';
import {substituteAndAnalyze} from '../src/js/symbolic-substitutioner';
import assert from 'assert';

function testSubstitution(code) {
    let args = {};
    return substituteAndAnalyze(parseCode(code), args)[0];
}

function testAnalyze(code, args) {
    return substituteAndAnalyze(parseCode(code), args)[1];
}

function parseAndGenerate(code) {
    return parsedCodeToOriginalCode(parseCode(code));
}

function generateTestCaseSubstitution(name, input, expected) {
    return it(name, () => {
        assert.deepEqual(testSubstitution(input), parseAndGenerate(expected));
    });
}

function generateTestCaseAnalyze(name, inputCode, inputVector, expected) {
    return it(name, () => {
        assert.deepEqual(testAnalyze(inputCode, inputVector), expected);
    });
}

describe('No substitution', () => {
    generateTestCaseSubstitution('Empty function',
        'function test(){}',
        'function test(){}');
    generateTestCaseSubstitution('Only simple assignments',
        'function foo(){\n' +
        '    let x = 5;\n' +
        '}',
        'function foo(){\n' +
        '    \n' +
        '}'
    );
});

const suit0input1 = 'function foo(a){\n' +
    '    let x = 5;\n' +
    '\treturn x + a;\n' +
    '}';

const suit0output1 = 'function foo(a){\n' +
    '\treturn 5 + a;\n' +
    '}';

const suit0input2 = 'function foo(a){\n' +
    '    let x = 5;\n' +
    '\treturn a[x];\n' +
    '}';

const suit0output2 = 'function foo(a){\n' +
    '\treturn a[5];\n' +
    '}';

const suit0input3 = 'function foo(a){\n' +
    '    let x = 5;\n' +
    '\tlet y = x;\n' +
    '\treturn a + y;\n' +
    '}';

const suit0output3 = 'function foo(a){\n' +
    '\treturn a + 5;\n' +
    '}';

const suit0input4 = 'function foo(a){\n' +
    '    a = 1;\n' +
    '\tlet y = 2;\n' +
    '\treturn a + y;\n' +
    '}';

const suit0output4 = 'function foo(a){\n' +
    '\ta = 1;\n' +
    '\treturn 1 + 2;\n' +
    '}';

const suit0input5 = 'function foo(a) {\n' +
    '   let x = 5;\n' +
    '   return x;\n' +
    '}';

const suit0output5 = 'function foo(a) {\n' +
    'return 5;\n' +
    '}';

const suit0input6 = 'function foo(a) {\n' +
    '   let y = 3;\n' +
    '   return a[y+1];\n' +
    '}';

const suit0output6 = 'function foo(a) {\n' +
    'return a[3 + 1];\n' +
    '}';

describe('Simple substitution', () => {
    generateTestCaseSubstitution('Identifier', suit0input1, suit0output1);
    generateTestCaseSubstitution('Member expression', suit0input2, suit0output2);
    generateTestCaseSubstitution('Two identifiers substitution', suit0input3, suit0output3);
    generateTestCaseSubstitution('param substitution', suit0input4, suit0output4);
    generateTestCaseSubstitution('Return statement substitution', suit0input5, suit0output5);
    generateTestCaseSubstitution('Binary within member with substitution', suit0input6, suit0output6);

});

const suit1input1 = 'function foo(){\n' +
    '    let x = 5;\n' +
    '\treturn x + 7;\n' +
    '}';

const suit1output1 = 'function foo(){\n' +
    '\treturn 5 + 7;\n' +
    '}';

const suit1input2 = 'function foo(a){\n' +
    '    let x = 5;\n' +
    '\treturn 2 + x + a;\n' +
    '}';

const suit1output2 = 'function foo(a){\n' +
    '\treturn 2 + 5 + a;\n' +
    '}';

const suit1input3 = 'function foo(a){\n' +
    '    let x = 5;\n' +
    '\tlet y = x + 4;\n' +
    '\tx = 9;\n' +
    '\treturn x + 1;\n' +
    '}';

const suit1output3 = 'function foo(a){\n' +
    '\treturn 9 + 1;\n' +
    '}';

const suit1input4 = 'function foo(a){\n' +
    '    let x = 5;\n' +
    '\tlet y = -x;\n' +
    '\treturn a + y;\n' +
    '}';

const suit1output4 = 'function foo(a){\n' +
    '\treturn a + (-5);\n' +
    '}';

describe('Substitution with evaluation', () => {
    generateTestCaseSubstitution('Normal evaluation', suit1input1, suit1output1);
    generateTestCaseSubstitution('Complex evaluation', suit1input2, suit1output2);
    generateTestCaseSubstitution('Complex substitution', suit1input3, suit1output3);
    generateTestCaseSubstitution('UnaryExpression substitution', suit1input4, suit1output4);
});

// let suit2input1 = 'function foo(x, y, z){\n' +
//     '    let a = x + 1;\n' +
//     '    let b = a + y;\n' +
//     '    let c = 0;\n' +
//     '    \n' +
//     '    if (b < z) {\n' +
//     '        c = c + 5;\n' +
//     '        return x + y + z + c;\n' +
//     '    } else if (b < z * 2) {\n' +
//     '        c = c + x + 5;\n' +
//     '        return x + y + z + c;\n' +
//     '    } else {\n' +
//     '        c = c + z + 5;\n' +
//     '        return x + y + z + c;\n' +
//     '    }\n' +
//     '}\n';
//
// let suit2output1 = 'function foo(x, y, z){\n' +
//     '    if (x + 1 + y < z) {\n' +
//     '        return x + y + z + 5;\n' +
//     '    } else if (x + 1 + y < z * 2) {\n' +
//     '        return x + y + z + x + 5;\n' +
//     '    } else {\n' +
//     '        return x + y + z + z + 5;\n' +
//     '    }\n' +
//     '}\n';
//
// let suit2input2 = 'function foo(x, y, z){\n' +
//     '    let a = x + 1;\n' +
//     '    let b = a + y;\n' +
//     '    let c = 0;\n' +
//     '    \n' +
//     '    while (a < z) {\n' +
//     '        c = a + b;\n' +
//     '        z = c * 2;\n' +
//     '    }\n' +
//     '    \n' +
//     '    return z;\n' +
//     '}\n';
//
// let suit2output2 = 'function foo(x, y, z){\n' +
//     '    while (x + 1 < z) {\n' +
//     '        z = (x + 1 + x + 1 + y) * 2;\n' +
//     '    }\n' +
//     '    \n' +
//     '    return z;\n' +
//     '}\n';
//
// describe('Example inputs', () => {
//     generateTestCaseSubstitution('Test case 1', suit2input1, suit2output1);
//     generateTestCaseSubstitution('Test case 2', suit2input2, suit2output2);
// });

const suit3input1 = 'function foo(x, y, z){\n' +
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

const suit3input2 = {'x':1, 'y':2, 'z':3};

describe('Analysis', () => {
    generateTestCaseAnalyze('Example Test Case', suit3input1, suit3input2, [false, true]);
});