import { expect } from 'chai';
import 'mocha';

//import stuff to test
import { Imposer } from './Imposer';
import { RuleSet } from './RuleSet';
import { GeneratorFactory } from './Generator';
import { ParserFactory } from './Parser';

import { Rule } from './Rule';
import { IRule } from './Interfaces';
import { Node } from './utils/Node';

describe('Check the Rule Class', () => {
  it('A Rule should be build up just by providing simple information', () => {
    const ruleSetup: IRule = {
      apply: (_: Node, __: Node, ___: Imposer) => {
        return new Node();
      },
      target: 'testing',
      selector: 'test'
    }
    const rule = new Rule(ruleSetup);
    expect(rule).not.to.be.undefined;
  });

  it('A rule should provide correctly witch language it supports, either normal written, uppercase, lowercase', () => {
    const ruleSetup: IRule = {
      apply: (_: Node, __: Node, ___: Imposer) => {
        return new Node();
      },
      target: 'testing',
      selector: 'test'
    }
    const rule = new Rule(ruleSetup);
    expect(rule.supportsLanguage('testing')).to.be.true;
    expect(rule.supportsLanguage('Testing')).to.be.true;
    expect(rule.supportsLanguage('TESTING')).to.be.true;
    expect(rule.supportsLanguage('TeStInG')).to.be.true;

    expect(rule.supportsLanguage('Whatsoever')).not.to.be.true;
  });

  it('A rule states if it fits to a node combination', () => {
    const ruleSetup: IRule = {
      apply: (_: Node, __: Node, ___: Imposer) => {
        return new Node();
      },
      target: 'testing',
      selector: 'test'
    }
    const rule = new Rule(ruleSetup);

    //setting up the nodes
    const baseNode = new Node();
    const featureNode = new Node();
    baseNode.path = 'test';
    featureNode.path = 'test';

    expect(rule.isMatching(baseNode, featureNode)).to.be.true;

    //change the combination of nodes
    featureNode.path = 'test2';
    expect(rule.isMatching(baseNode, featureNode)).to.be.false;
  });

  it('A rule states if it fits to a node combination, extended by node properties', () => {
    const ruleSetup: IRule = {
      apply: (base: Node, feature: Node, context: Imposer) => {
        return new Node();
      },
      target: 'testing',
      selector: 'test[wat]',
      selectorFeature: 'test[wat=foo]'
    }
    const rule = new Rule(ruleSetup);

    //setting up the nodes
    const baseNode = new Node();
    const featureNode = new Node();
    baseNode.path = 'test';
    featureNode.path = 'test';
    baseNode.setAttribute('wat', 'foo');
    featureNode.setAttribute('wat', 'foo');
    expect(rule.isMatching(baseNode, featureNode)).to.be.true;
  });

  it('A rule states if it fits to a node combination, and is apply to apply the solution', () => {
    const ruleSetup: IRule = {
      apply: (base: Node, feature: Node, context: Imposer) => {
        return new Node();
      },
      target: 'testing',
      selector: 'test[wat]',
      selectorFeature: 'test[wat=foo]'
    }
    const rule = new Rule(ruleSetup);

    //setting up the nodes
    const baseNode = new Node();
    const featureNode = new Node();
    baseNode.path = 'test';
    featureNode.path = 'test';
    baseNode.setAttribute('wat', 'foo');
    featureNode.setAttribute('wat', 'foo');
    expect(rule.isMatching(baseNode, featureNode)).to.be.true;
    expect(rule.apply).to.be.not.undefined;

    const rs = new RuleSet();
    const pf = new ParserFactory();
    const gf = new GeneratorFactory();

    const imp = new Imposer(pf, gf, rs);
    expect(rule.apply(baseNode, featureNode, imp)).to.be.not.undefined;
  });
})