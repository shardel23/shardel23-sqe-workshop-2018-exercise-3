import assert from 'assert';
import {defaultCodeToParse, entries, Entry, postParseActions} from '../src/js/table-creater';
import {parseCode} from '../src/js/code-analyzer';

function test(code) {
    postParseActions(parseCode(code));
}

describe('Function Declarations', () => {
    it('Function declaration without params', () => {
        test('function test(){}');
        assert.deepEqual(
            entries, [
                new Entry(1, 'function declaration', 'test', '', '')]);});
    it('Function declaration with params', () => {
        test('function test(x, y){}');
        assert.deepEqual(
            entries,[
                new Entry(1, 'function declaration', 'test', '', ''),
                new Entry(1, 'function parameter', 'x', '', ''),
                new Entry(1, 'function parameter', 'y', '', '')]);});
});

describe('Variable Declarations', () => {
    it('Variable Declarations', () => {
        test('function test(){\nlet i;\n}');
        assert.deepEqual(
            entries[1],
            new Entry(2, 'variable declaration', 'i', '', null));});
});

describe('Variable Assignments', () => {
    it('Simple assignment', () => {
        test('function test(){\nlet i;\ni=5;\n}');
        assert.deepEqual(
            entries[2],
            new Entry(3, 'assignment expression', 'i', '', '5'));});
    it('Expression assignment', () => {
        test('function test(){\nlet i;\ni=3+2;\n}');
        assert.deepEqual(
            entries[2],
            new Entry(3, 'assignment expression', 'i', '', '3 + 2'));});
});

describe('Loops', () => {
    it('For loop', () => {
        test('function test(){\nfor(let i=0;\ni<5;i++){\ni++;\n}\n}');
        assert.deepEqual(
            entries,[
                new Entry(1, 'function declaration', 'test', '', ''),
                new Entry(2, 'for statement', '', 'i < 5', ''),
                new Entry(2, 'variable declaration', 'i', '', 0)]);});
    it('While loop', () => {
        test('function test(){\nwhile(true){\ni++;\n}\n}');
        assert.deepEqual(
            entries, [
                new Entry(1, 'function declaration', 'test', '', ''),
                new Entry(2, 'while statement', '', true, '')]);});
});

describe('Conditions', () => {
    it('Simple If', () => {
        test('function test(){\nif(3>1) i++\n}');
        assert.deepEqual(
            entries,[
                new Entry(1, 'function declaration', 'test', '', ''),
                new Entry(2, 'if statement', '', '3 > 1', '')]);});
    it('If with logical condition', () => {
        test('function test(){\nif(x || y) i++\n}');
        assert.deepEqual(
            entries, [
                new Entry(1, 'function declaration', 'test', '', ''),
                new Entry(2, 'if statement', '', 'x || y', '')]);});
});

describe('Extra cases', () => {
    it('example code plus for loop', () => {
        test(defaultCodeToParse);
        assert.equal(entries.length, 20);});
    it('Unary and Logical expressions', () => {
        test('function test(){ if (true || false) return -1;}');
        assert.equal(entries.length, 3);});
    it('Unsupported RValue type', () => {
        let malformedParsedCode = parseCode('function test(){ return -1;}');
        malformedParsedCode['body'][0]['body']['body'][0]['argument']['type'] = 'Unknown';
        postParseActions(malformedParsedCode);
        assert.equal(entries.length, 2);});
});
