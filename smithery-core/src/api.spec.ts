import { expect } from 'chai';
import 'mocha';
import {
    GeneratorFactory,
    ParserFactory,
    RuleSet,
    Enums,
    Imposer,
    Utils,
    Rule
} from './api';

describe('Test all project parts by using the api', () => {
    it('All parts should be instantiated if no FileSystem dependency exists', () => {
        expect(new GeneratorFactory()).to.be.not.undefined;
        expect(new ParserFactory()).to.be.not.undefined;
        expect(new RuleSet()).to.be.not.undefined;

        expect(new Rule({
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            apply: (_: Utils.FSTNode, featureFST: Utils.FSTNode, targetNode: Utils.FSTNode, parent: Utils.FSTNonTerminal | undefined, context: Imposer): void => { /* empty dummy */ },
            id: 'id',
            package: 'test'
        })).to.be.not.undefined;
        expect(new Imposer(new ParserFactory(), new GeneratorFactory(), new RuleSet)).to.be.not.undefined;

        expect(new Utils.FSTTerminal('', '')).not.to.be.undefined;
        expect(new Utils.FSTNonTerminal('', '')).not.to.be.undefined;

        expect(Enums.FileType.File).to.be.equal('File');
        expect(Enums.FileType.Folder).to.be.equal('Folder');
    });
});