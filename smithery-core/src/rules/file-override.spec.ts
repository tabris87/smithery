import { expect, assert } from 'chai';
import { GeneratorFactory } from '../Generator';
import { Imposer } from '../Imposer';
import { ParserFactory } from '../Parser';
import { Rule } from '../Rule';
import { RuleSet } from '../RuleSet';
import { FSTNonTerminal } from '../utils/FSTNonTerminal';
import { FSTTerminal } from '../utils/FSTTerminal';
import { rule as overrideRule } from './file-override';

const emptyImposer = new Imposer(new ParserFactory(), new GeneratorFactory(), new RuleSet());

describe('Check if the rule for file-overriding works correct', () => {
    let rule: Rule;
    beforeEach('Setup the rule', () => {
        rule = new Rule(overrideRule);
    });

    it('Good case: Two Terminal Nodes of same type and name', () => {
        const baseN = new FSTTerminal('type', 'name', 'content');
        const featureN = new FSTTerminal('type', 'name', 'new content');
        const resultNode = baseN.shallowClone();

        rule.apply(baseN, featureN, resultNode, undefined, emptyImposer);
        expect(resultNode).to.be.not.undefined;
        expect(resultNode.getName()).to.be.equal('name');
        expect(resultNode.getType()).to.be.equal('type');
        expect((resultNode as FSTTerminal).getContent()).to.be.equal('new content');
    });

    it('Bad case: one of the two notes are not a terminal node', () => {
        const terminal = new FSTTerminal('type', 'name', 'content');
        const nonTerminal = new FSTNonTerminal('type2', 'name');
        const resultNode = terminal.shallowClone();

        assert.throws(() => { rule.apply(terminal, nonTerminal, resultNode, undefined, emptyImposer) });
        assert.throws(() => { rule.apply(nonTerminal, terminal, resultNode, undefined, emptyImposer) });
    });
});