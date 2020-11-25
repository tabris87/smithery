import { rule } from './file-impose';
import { Node } from '../utils/Node';
import { Imposer } from '../Imposer';

import { expect, assert } from 'chai';
import * as sinon from 'sinon';
import { ParserFactory } from '../Parser';
import { GeneratorFactory } from '../Generator';
import { RuleSet } from '../api';
import { IGenerator, IParser } from '../Interfaces';

class MockParser implements IParser {
    [key: string]: any;
    parse(content: string, options?: { [key: string]: any; }): Node {
        return new Node();
    }
    getVisitorKeys(): { [key: string]: string[]; } {
        return {};
    }
}

class MockGenerator implements IGenerator {
    [key: string]: any;
    generate(oAST: { [key: string]: any; }, options?: { [key: string]: any; }): string {
        return 'blub';
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
        assert.throws(() => { rule.apply(baseAST, featureAST, imp) }, 'Base-FeatureTree-Parser or Feature-FeatureTree-Parser not correctly defined');
    });

    it('Should throw an error if there is no parser for the feature AST', () => {
        const baseAST = new Node();
        const featureAST = new Node();
        //set a correct ending for the feature node to test only the base node;
        baseAST.ending = 'WAT';
        featureAST.ending = 'FOO';
        const imp = new Imposer(new ParserFactory(), new GeneratorFactory(), new RuleSet());
        imp.getParserFactory().addParser(parserMock, 'WAT');
        assert.throws(() => { rule.apply(baseAST, featureAST, imp) }, 'Base-FeatureTree-Parser or Feature-FeatureTree-Parser not correctly defined');
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
        assert.throws(() => { rule.apply(baseAST, featureAST, imp) }, 'BaseFeatureTree or FeatureFeatureTree does not contain source code');
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
        assert.throws(() => { rule.apply(baseAST, featureAST, imp) }, 'BaseFeatureTree or FeatureFeatureTree does not contain source code');
    });

    it('Should throw an error if there is an empty content for the base AST', () => {
        const baseAST = new Node();
        const featureAST = new Node();
        //set a correct ending for the feature node to test only the base node;
        baseAST.ending = 'WAT';
        featureAST.ending = 'WAT';
        baseAST.content = '';
        const imp = new Imposer(new ParserFactory(), new GeneratorFactory(), new RuleSet());
        imp.getParserFactory().addParser(parserMock, 'WAT');
        assert.throws(() => { rule.apply(baseAST, featureAST, imp) }, 'BaseFeatureTree or FeatureFeatureTree does not contain source code');
    });

    it('Should throw an error if there is an empty content for the feature AST', () => {
        const baseAST = new Node();
        const featureAST = new Node();
        //set a correct ending for the feature node to test only the base node;
        baseAST.ending = 'WAT';
        featureAST.ending = 'WAT';
        baseAST.content = 'blub';
        featureAST.content = '';
        const imp = new Imposer(new ParserFactory(), new GeneratorFactory(), new RuleSet());
        imp.getParserFactory().addParser(parserMock, 'WAT');
        assert.throws(() => { rule.apply(baseAST, featureAST, imp) }, 'BaseFeatureTree or FeatureFeatureTree does not contain source code');
    });

    it('Should throw an error if no suitable Generator is available', () => {
        const baseAST = new Node();
        const featureAST = new Node();
        //set a correct ending for the feature node to test only the base node;
        baseAST.ending = 'WAT';
        featureAST.ending = 'WAT';
        baseAST.content = 'blub';
        featureAST.content = 'blub';
        const imp = new Imposer(new ParserFactory(), new GeneratorFactory(), new RuleSet());
        imp.getParserFactory().addParser(parserMock, 'WAT');
        sinon.stub(imp, 'impose').returns(new Node());
        assert.throws(() => { rule.apply(baseAST, featureAST, imp) }, 'No suitable Generator available for feature context');
        sinon.restore();
    });

    it('Should run successfully', () => {
        const baseAST = new Node();
        const featureAST = new Node();
        //set a correct ending for the feature node to test only the base node;
        baseAST.ending = 'WAT';
        featureAST.ending = 'WAT';
        baseAST.content = 'blub';
        featureAST.content = 'blub';
        const imp = new Imposer(new ParserFactory(), new GeneratorFactory(), new RuleSet());
        imp.getParserFactory().addParser(parserMock, 'WAT');
        const gen = new MockGenerator();
        imp.getGeneratorFactory().addGenerator(gen, 'WAT');
        sinon.stub(imp, 'impose').returns(new Node());
        expect(rule.apply(baseAST, featureAST, imp).content).to.be.equal('blub');
        sinon.restore();
    });
});