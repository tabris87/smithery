import { rule } from './file-impose';
import { Node } from '../utils/Node';
import { Imposer } from '../Imposer';

import { expect, assert } from 'chai';
import * as sinon from 'sinon';
import { ParserFactory } from '../Parser';
import { GeneratorFactory } from '../Generator';
import { RuleSet } from '../api';
import { IParser } from '../Interfaces';

class MockParser implements IParser {
    [key: string]: any;
    parse(content: string, options?: { [key: string]: any; }): Node {
        throw new Error('Method not implemented.');
    }
    getVisitorKeys(): { [key: string]: string[]; } {
        throw new Error('Method not implemented.');
    }
}

describe('Check if the rule for file imposing works correctly', () => {
    let parserMock: IParser;
    before(() => {
        parserMock = new MockParser();
    });

    it('Should throw an error if there is no parser for the base AST', () => {
        const baseAST = new Node();
        const featureAST = new Node(); 
        //set a correct ending for the feature node to test only the base node;
        baseAST.ending = 'WAT';
        featureAST.ending = 'FOO';
        const imp = new Imposer(new ParserFactory(), new GeneratorFactory(), new RuleSet());
        imp.getParserFactory().addParser(parserMock, 'FOO');
        assert.throws(()=> {rule.apply(baseAST, featureAST, imp)}, 'Base-FeatureTree-Parser or Feature-FeatureTree-Parser not correctly defined');
    });

    it('Should throw an error if there is no parser for the feature AST', () => {
        const baseAST = new Node();
        const featureAST = new Node(); 
        //set a correct ending for the feature node to test only the base node;
        baseAST.ending = 'WAT';
        featureAST.ending = 'FOO';
        const imp = new Imposer(new ParserFactory(), new GeneratorFactory(), new RuleSet());
        imp.getParserFactory().addParser(parserMock, 'WAT');
        assert.throws(()=> {rule.apply(baseAST, featureAST, imp)}, 'Base-FeatureTree-Parser or Feature-FeatureTree-Parser not correctly defined');
    });

    it('Should throw an error if there is no content for the base AST', () => {
        const baseAST = new Node();
        const featureAST = new Node(); 
        //set a correct ending for the feature node to test only the base node;
        baseAST.ending = 'WAT';
        featureAST.ending = 'WAT';
        featureAST.content = 'Blub';
        const imp = new Imposer(new ParserFactory(), new GeneratorFactory(), new RuleSet());
        imp.getParserFactory().addParser(parserMock, 'WAT');
        assert.throws(()=> {rule.apply(baseAST, featureAST, imp)}, 'BaseFeatureTree or FeatureFeatureTree does not contain source code');
    });
    
    it('Should throw an error if there is no content for the feature AST', () => {
        const baseAST = new Node();
        const featureAST = new Node(); 
        //set a correct ending for the feature node to test only the base node;
        baseAST.ending = 'WAT';
        featureAST.ending = 'WAT';
        baseAST.content = 'Blub';
        const imp = new Imposer(new ParserFactory(), new GeneratorFactory(), new RuleSet());
        imp.getParserFactory().addParser(parserMock, 'WAT');
        assert.throws(()=> {rule.apply(baseAST, featureAST, imp)}, 'BaseFeatureTree or FeatureFeatureTree does not contain source code');
    });

    it('Should throw an error if there is no content for the feature AST', () => {
        const baseAST = new Node();
        const featureAST = new Node(); 
        //set a correct ending for the feature node to test only the base node;
        baseAST.ending = 'WAT';
        featureAST.ending = 'WAT';
        baseAST.content = 'Blub';
        const imp = new Imposer(new ParserFactory(), new GeneratorFactory(), new RuleSet());
        imp.getParserFactory().addParser(parserMock, 'WAT');
        assert.throws(()=> {rule.apply(baseAST, featureAST, imp)}, 'BaseFeatureTree or FeatureFeatureTree does not contain source code');
    });
});