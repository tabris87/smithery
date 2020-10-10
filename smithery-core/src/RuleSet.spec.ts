//setting up test environment
import { expect } from 'chai';
import 'mocha';

//import stuff to test
import { RuleSet } from './RuleSet';
import { IRule } from './Interfaces';
import { Node } from './utils/Node';
import { Imposer } from './Imposer';

describe('Check the RuleSet', () => {

  it('RuleSet should be fine after creation without parameters', () => {
    expect(new RuleSet()).not.to.be.undefined;
  });

  it('RuleSet should contain the file impose pattern, if no other rules are provided', () => {
    const rs = new RuleSet();
    expect(rs.getRules().length).equals(1);
  });

  it('After coping a RuleSet, they should be not the same, but do not differ within thier rules', () => {
    const rs = new RuleSet();
    const rsCopy = rs.copy();
    expect(rsCopy).not.to.be.equal(rs);
    expect(rsCopy.getRules().length).equals(rs.getRules().length);
  })

  it('Check if a manually assigned rule, is available', () => {
    const rs = new RuleSet();
    rs.addRule({
      apply: (baseFST: Node, featureFST: Node, context: Imposer): Node => {
        return new Node();
      },
      target: 'test',
      selector: 'test'
    });

    expect(rs.getRules().length).equals(2);
  })

  it('Check if a many manually assigned rules, are available', () => {
    const rs = new RuleSet();
    const manRules = [{
      apply: (baseFST: Node, featureFST: Node, context: Imposer): Node => {
        return new Node();
      },
      target: 'test',
      selector: 'test'
    }, {
      apply: (baseFST: Node, featureFST: Node, context: Imposer): Node => {
        return new Node();
      },
      target: 'test2',
      selector: 'test'
    }, {
      apply: (baseFST: Node, featureFST: Node, context: Imposer): Node => {
        return new Node();
      },
      target: 'test2',
      selector: 'test'
    }];
    rs.addMultipleRules(manRules);

    expect(rs.getRules().length).equals(4);
  });

  it('Check if custom rules are used for processing', () => {
    const rs = new RuleSet();
    const rule: IRule = {
      apply: (baseFST: Node, featureFST: Node, context: Imposer) => {
        return new Node();
      },
      target: 'testing',
      selector: 'test',
      selectorFeature: 'test'
    };

    //setting up the nodes
    const baseNode = new Node();
    const featureNode = new Node();
    baseNode.path = 'test';
    featureNode.path = 'test';

    //add the rule
    rs.addRule(rule);

    expect(rs.getMatchingRule(baseNode, featureNode)).not.to.be.undefined;
  });

  it('Check if language limiting are used for processing', () => {
    const rs = new RuleSet();
    const rule: IRule = {
      apply: (baseFST: Node, featureFST: Node, context: Imposer) => {
        return new Node();
      },
      target: 'testing',
      selector: 'test',
      selectorFeature: 'test'
    };

    //add the rule
    rs.addRule(rule);

    //setting up the nodes
    const baseNode = new Node();
    const featureNode = new Node();
    baseNode.path = 'test';
    featureNode.path = 'test';

    //setting language limit to 'test'
    rs.limitToLanguage('testing');
    expect(rs.getMatchingRule(baseNode, featureNode)).not.to.be.undefined;

    //setting language limit to 'File', has to be undefined, because no rule for path 'test' available
    rs.limitToLanguage('File');
    expect(rs.getMatchingRule(baseNode, featureNode)).to.be.undefined;

    //resetting language limit
    rs.limitToLanguage();
    expect(rs.getMatchingRule(baseNode, featureNode)).not.to.be.undefined;
  });
});