//setting up test environment
import { expect } from 'chai';
import 'mocha';

//import stuff to test
import { RuleSet } from './RuleSet';
import { IRule } from './Interfaces';
import { Node } from './utils/Node';
import { Imposer } from './Imposer';
import { Rule } from './Rule';

describe('Check the RuleSet', () => {

  it('RuleSet should be fine after creation without parameters', () => {
    expect(new RuleSet()).not.to.be.undefined;
  });

  it('RuleSet should add given rules for construction, additional to the default one', () => {
    const rs = new RuleSet([
      new Rule({
        apply: (_: Node, __: Node, ___: Imposer): Node => {
          return new Node();
        },
        target: 'test',
        selector: 'test'
      }),
      new Rule({
        apply: (_: Node, __: Node, ___: Imposer): Node => {
          return new Node();
        },
        target: 'test2',
        selector: 'test'
      }),
      new Rule({
        apply: (_: Node, __: Node, ___: Imposer): Node => {
          return new Node();
        },
        target: 'test3',
        selector: 'test'
      })]);

    expect(new RuleSet()).not.to.be.undefined;

    expect(rs.getRules().length).equals(4);
    expect(rs.getRules().find(r => r.supportsLanguage('test'))).not.to.be.undefined;
    expect(rs.getRules().find(r => r.supportsLanguage('test2'))).not.to.be.undefined;
    expect(rs.getRules().find(r => r.supportsLanguage('test3'))).not.to.be.undefined;
  });

  it('RuleSet should contain the file impose pattern, if no other rules are provided', () => {
    const rs = new RuleSet();
    expect(rs.getRules().length).equals(1);
  });

  describe('After coping a RuleSet, they should be not the same, but do not differ within thier rules', () => {
    it('Just using the default one', () => {
      const rs = new RuleSet();
      const rsCopy = rs.copy();
      expect(rsCopy).not.to.be.equal(rs);
      expect(rsCopy.getRules().length).equals(rs.getRules().length);
      expect(rsCopy.getRules()[0]).not.to.be.equal(rs.getRules()[0]);
    });

    it('Using a custom fitted RulesSet', () => {
      const rs = new RuleSet();
      rs.addRule({ apply: (_: Node, __: Node, ___: Imposer): Node => { return new Node; }, target: 'test', selector: 'test' });
      rs.addRule({ apply: (_: Node, __: Node, ___: Imposer): Node => { return new Node; }, target: 'test2', selector: 'test2' });
      const rsCopy = rs.copy();

      expect(rsCopy).not.to.be.equal(rs);
      expect(rsCopy.getRules().length).equals(rs.getRules().length);
      expect(rsCopy.getRules()[0]).not.to.be.equals(rs.getRules()[0]);
    });
  })

  it('Check if a manually assigned rule, is available', () => {
    const rs = new RuleSet();
    rs.addRule({
      apply: (_: Node, __: Node, ___: Imposer): Node => {
        return new Node();
      },
      target: 'test',
      selector: 'test'
    });

    expect(rs.getRules().length).equals(2);
    expect(rs.getRules().find(r => r.supportsLanguage('test'))).not.to.be.undefined;
  })

  it('Check if a many manually assigned rules, are available', () => {
    const rs = new RuleSet();
    const manRules = [{
      apply: (_: Node, __: Node, ___: Imposer): Node => {
        return new Node();
      },
      target: 'test',
      selector: 'test'
    }, {
      apply: (_: Node, __: Node, ___: Imposer): Node => {
        return new Node();
      },
      target: 'test2',
      selector: 'test'
    }, {
      apply: (_: Node, __: Node, ___: Imposer): Node => {
        return new Node();
      },
      target: 'test3',
      selector: 'test'
    }];
    rs.addMultipleRules(manRules);

    expect(rs.getRules().length).equals(4);
    expect(rs.getRules().find(r => r.supportsLanguage('test'))).not.to.be.undefined;
    expect(rs.getRules().find(r => r.supportsLanguage('test2'))).not.to.be.undefined;
    expect(rs.getRules().find(r => r.supportsLanguage('test3'))).not.to.be.undefined;
  });

  it('Check if custom rules are used for processing', () => {
    const rs = new RuleSet();
    const rule: IRule = {
      apply: (_: Node, __: Node, ___: Imposer): Node => {
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
      apply: (_: Node, __: Node, ___: Imposer) => {
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

  it('There should be a warning if more than one rule is matching for a FST combination', () => {
    const warnBackup = console.warn;
    const warnings: string[] = [];
    console.warn = (text: string): void => {
      warnings.push(text);
    }
    const rs = new RuleSet();
    const rule: IRule = {
      apply: (_: Node, __: Node, ___: Imposer): Node => {
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
    rs.addRule(rule);

    expect(rs.getMatchingRule(baseNode, featureNode)).not.to.be.undefined;
    expect(warnings.length).equals(1);
    expect(warnings[0]).equals('More than one rule is matching! Taking the first one to proceed. Result can differ from expected Result.');

    console.warn = warnBackup;
  });
});