import { expect, assert } from 'chai';
import * as sinon from 'sinon';
import { FileType } from '../enums';
import { GeneratorFactory } from '../Generator';
import { Imposer } from '../Imposer';
import { IGenerator, IParser } from '../Interfaces';
import { ParserFactory } from '../Parser';
import { RuleSet } from '../RuleSet';
import { FSTNode } from '../utils/FSTNode';
import { FSTNonTerminal } from '../utils/FSTNonTerminal';
import { FSTTerminal } from '../utils/FSTTerminal';

class MockParser implements IParser {
    [key: string]: any;
    parse(content: string, options?: { [key: string]: unknown; }): FSTNode {
        return new FSTTerminal('', '');
    }
}

class MockGenerator implements IGenerator {
    generate(fst: FSTNode, options?: { [key: string]: unknown; }): string {
        return '';
    }
}

describe('Check if the rule for file imposing works correctly', () => {
    let parserMock: IParser;
    let generatorMock: IGenerator;

    let parseStub: any;
    let genStub: any;

    let imp: Imposer;
    let gf: GeneratorFactory;
    let pf: ParserFactory;
    let rs: RuleSet;
    beforeEach(() => {
        parserMock = new MockParser();
        generatorMock = new MockGenerator();


        const funcMain_base = new FSTTerminal('function', 'main', 'display -> "Hello World!"');
        funcMain_base.setMergeStrategy('override');
        const funcMain_feature = new FSTTerminal('function', 'main', 'display -> "Burning World!"');
        funcMain_feature.setMergeStrategy('override');

        parseStub = sinon.stub(parserMock, 'parse');
        parseStub.onCall(0).returns(
            new FSTNonTerminal('program', 'content', [
                funcMain_base
            ])
        );
        parseStub.onCall(1).returns(
            new FSTNonTerminal('program', 'content', [
                funcMain_feature
            ])
        );

        genStub = sinon.stub(generatorMock, 'generate');
        genStub.onCall(0).returns('display -> "Burning World!"');

        rs = new RuleSet();
        //file-impose is part of default rules, therefore not added explicitly
        gf = new GeneratorFactory();
        pf = new ParserFactory();
        pf.addParser(parserMock, 'test');
        gf.addGenerator(generatorMock, 'test');
        imp = new Imposer(pf, gf, rs);
    });

    afterEach(() => {
        parseStub.restore();
        genStub.restore();
    });

    it('Single file compose', () => {
        const file_base = new FSTTerminal(FileType.File, 'temp', 'content');
        const file_feature = new FSTTerminal(FileType.File, 'temp', 'content');
        file_base.setCodeLanguage('test');
        file_feature.setCodeLanguage('test');
        file_base.setMergeStrategy('file_compose');
        file_feature.setMergeStrategy('file_compose');
        file_base.setFeatureName('base');
        file_feature.setFeatureName('feature');

        const baseTree = new FSTNonTerminal(FileType.Folder, 'feature', [
            file_base
        ]);
        baseTree.setFeatureName('base');
        const featureTree = new FSTNonTerminal(FileType.Folder, 'feature', [
            file_feature
        ]);
        featureTree.setFeatureName('feature');

        const result = imp.impose({ 'base': baseTree, 'feature': featureTree }, ['base', 'feature']);

        expect(result instanceof FSTNonTerminal).to.be.true;
        expect((result as FSTNonTerminal).getChildren().length).to.be.equal(1);

        const child = (result as FSTNonTerminal).getChildAt(0);
        expect(child instanceof FSTTerminal).to.be.true;
        expect((child as FSTTerminal).getCodeLanguage()).to.be.equal('test');
        expect((child as FSTTerminal).getFeatureName()).to.be.equal('feature');
        expect((child as FSTTerminal).getMergeStrategy()).to.be.equal('file_compose');
        expect((child as FSTTerminal).getContent()).to.be.equal('display -> "Burning World!"');
        expect((child as FSTTerminal).getType()).to.be.equal(FileType.File);
        expect((child as FSTTerminal).getTreePath()).to.be.equal('feature<&>temp');
    });

    it('Check if only nodes composed which have a specific language definition', () => {
        const file_base = new FSTTerminal(FileType.File, 'temp', 'content');
        const file_feature = new FSTTerminal(FileType.File, 'temp', 'content');
        file_base.setMergeStrategy('file_compose');
        file_feature.setMergeStrategy('file_compose');
        file_base.setFeatureName('base');
        file_feature.setFeatureName('feature');

        const baseTree = new FSTNonTerminal(FileType.Folder, 'feature', [
            file_base
        ]);
        baseTree.setFeatureName('base');
        const featureTree = new FSTNonTerminal(FileType.Folder, 'feature', [
            file_feature
        ]);
        featureTree.setFeatureName('feature');

        assert.throws(() => { imp.impose({ 'base': baseTree, 'feature': featureTree }, ['base', 'feature']) }, `'base' Node or 'feature' node do not provide a concrete language definition.`);
    });

    it('Check if only nodes with same language definition will be targeted', () => {
        const file_base = new FSTTerminal(FileType.File, 'temp', 'content');
        const file_feature = new FSTTerminal(FileType.File, 'temp', 'content');
        file_base.setCodeLanguage('test');
        file_feature.setCodeLanguage('not_test');
        file_base.setMergeStrategy('file_compose');
        file_feature.setMergeStrategy('file_compose');
        file_base.setFeatureName('base');
        file_feature.setFeatureName('feature');

        const baseTree = new FSTNonTerminal(FileType.Folder, 'feature', [
            file_base
        ]);
        baseTree.setFeatureName('base');
        const featureTree = new FSTNonTerminal(FileType.Folder, 'feature', [
            file_feature
        ]);
        featureTree.setFeatureName('feature');

        assert.throws(() => { imp.impose({ 'base': baseTree, 'feature': featureTree }, ['base', 'feature']) }, `'base' and 'feature' node do not provide the same language definition.`);
    });

    it('Check if only nodes composed at which the parser is correctly defined', () => {
        const file_base = new FSTTerminal(FileType.File, 'temp', 'content');
        const file_feature = new FSTTerminal(FileType.File, 'temp', 'content');
        file_base.setCodeLanguage('test');
        file_feature.setCodeLanguage('test');
        file_base.setMergeStrategy('file_compose');
        file_feature.setMergeStrategy('file_compose');
        file_base.setFeatureName('base');
        file_feature.setFeatureName('feature');
        //Setting the imposer to the 'blank' default setup
        imp = new Imposer(new ParserFactory(), gf, rs);

        const baseTree = new FSTNonTerminal(FileType.Folder, 'feature', [
            file_base
        ]);
        baseTree.setFeatureName('base');
        const featureTree = new FSTNonTerminal(FileType.Folder, 'feature', [
            file_feature
        ]);
        featureTree.setFeatureName('feature');

        assert.throws(() => { imp.impose({ 'base': baseTree, 'feature': featureTree }, ['base', 'feature']) }, 'Parser not correctly defined');
    });

    it('Check if only nodes get composed if a generator exists', () => {
        const file_base = new FSTTerminal(FileType.File, 'temp', 'content');
        const file_feature = new FSTTerminal(FileType.File, 'temp', 'content');
        file_base.setCodeLanguage('test');
        file_feature.setCodeLanguage('test');
        file_base.setMergeStrategy('file_compose');
        file_feature.setMergeStrategy('file_compose');
        file_base.setFeatureName('base');
        file_feature.setFeatureName('feature');

        //Setting the imposer to the 'blank' default setup
        imp = new Imposer(pf, new GeneratorFactory(), rs);

        const baseTree = new FSTNonTerminal(FileType.Folder, 'feature', [
            file_base
        ]);
        baseTree.setFeatureName('base');
        const featureTree = new FSTNonTerminal(FileType.Folder, 'feature', [
            file_feature
        ]);
        featureTree.setFeatureName('feature');

        assert.throws(() => { imp.impose({ 'base': baseTree, 'feature': featureTree }, ['base', 'feature']) }, 'Generator not correctly defined');
    });

    it('Check if only nodes composed if both contain sources', () => {
        const file_base = new FSTTerminal(FileType.File, 'temp', 'content');
        const file_feature = new FSTTerminal(FileType.File, 'temp');
        file_base.setCodeLanguage('test');
        file_feature.setCodeLanguage('test');
        file_base.setMergeStrategy('file_compose');
        file_feature.setMergeStrategy('file_compose');
        file_base.setFeatureName('base');
        file_feature.setFeatureName('feature');

        const baseTree = new FSTNonTerminal(FileType.Folder, 'feature', [
            file_base
        ]);
        baseTree.setFeatureName('base');
        const featureTree = new FSTNonTerminal(FileType.Folder, 'feature', [
            file_feature
        ]);
        featureTree.setFeatureName('feature');

        assert.throws(() => { imp.impose({ 'base': baseTree, 'feature': featureTree }, ['base', 'feature']) }, `'base' node or 'feature' node does not contain source code'`);
    });
});