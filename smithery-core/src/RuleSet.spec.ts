//setting up test environment
import { expect } from 'chai';
import 'mocha';
import { Imposer } from './Imposer';
import { IRule } from './Interfaces';
import { Rule } from './Rule';

//import stuff to test
import { RuleSet } from './RuleSet';
import { FSTNode } from './utils/FSTNode';
import { FSTNonTerminal } from './utils/FSTNonTerminal';

describe('Check the RuleSet', () => {

  const customRule1: IRule = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    apply: (baseFST: FSTNode, featureFST: FSTNode, targetNode: FSTNode, parent: FSTNonTerminal | undefined, context: Imposer): void => {
      console.log('empty rule body 1');
    },
    id: 'customRule1',
    package: 'tests'
  }

  const customRule2: IRule = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    apply: (baseFST: FSTNode, featureFST: FSTNode, targetNode: FSTNode, parent: FSTNonTerminal | undefined, context: Imposer): void => {
      console.log('empty rule body 1');
    },
    id: 'customRule2',
    package: 'tests'
  }

  it('RuleSet should be fine after creation without parameters', () => {
    expect(new RuleSet()).not.to.be.undefined;
  });

  it('RuleSet should be fine after creation with parameter', () => {
    const rs = new RuleSet([new Rule(customRule1), new Rule(customRule2)]);
    expect(rs).not.to.be.undefined;
    expect(rs.getRules().length).to.be.equal(4);
    expect(rs.getRule('customRule2'));
    expect(rs.getRule('customRule1'));
  });

  it('RuleSet should accept and handle rules, added afterwards', () => {
    const rs = new RuleSet();
    expect(rs).not.to.be.undefined;
    expect(rs.getRules().length).to.be.equal(2);

    rs.addMultipleRules([customRule1, customRule2]);
    expect(rs.getRules().length).to.be.equal(4);
    expect(rs.getRule('customRule2')).to.be.not.undefined;
  });

  it('Create and alter a copy of the RuleSet', () => {
    const rs = new RuleSet();
    expect(rs).not.to.be.undefined;
    expect(rs.getRules().length).to.be.equal(2);

    const c_rs = rs.copy();
    expect(c_rs).not.to.be.undefined;
    expect(c_rs.getRules().length).to.be.equal(2);
    expect(c_rs).not.to.be.equal(rs);

    c_rs.addRule(customRule2);
    expect(c_rs.getRules().length).to.be.equal(3);
    expect(c_rs.getRule('customRule1')).to.be.undefined;
  });
});