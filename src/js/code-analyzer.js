import * as esprima from 'esprima';
import * as escodegen from 'escodegen';

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse, {loc: true, jsx: true});
};

const astToCode = (parsedCode) => {
    return escodegen.generate(parsedCode);
};

export {parseCode, astToCode};
