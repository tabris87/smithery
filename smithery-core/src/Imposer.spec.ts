//setting up test environment
import { expect } from 'chai';
import 'mocha';

//import project stuff
import { Imposer } from './Imposer';
import { ParserFactory } from './Parser';
import { GeneratorFactory } from './Generator';
import { RuleSet } from './RuleSet';

describe('Check the ImposerClass to work properly with given informations', () => {
  let imp: Imposer;
  beforeEach('Setup the Imposer', () => {
    const pf = new ParserFactory();
    const gf = new GeneratorFactory();
    const rs = new RuleSet();

    imp = new Imposer(pf, gf, rs);
  });

  it('Check if imposer is successfully initialized', () => {
    expect(imp).not.to.be.undefined;
  });

  it('Check if new ParserFactory is assignable', () => {
    const orig_parser = imp.getParserFactory();
    const new_parser = new ParserFactory();
    imp.setParserFactory(new_parser);
    expect(imp.getParserFactory()).not.to.be.undefined;
    expect(imp.getParserFactory()).not.equal(orig_parser);
  });

  it('Check if new GeneratorFactory is assignable', () => {
    const orig_generator = imp.getGeneratorFactory();
    const new_generator = new GeneratorFactory();
    imp.setGeneratorFactory(new_generator);
    expect(imp.getGeneratorFactory()).not.to.be.undefined;
    expect(imp.getGeneratorFactory()).not.equal(orig_generator);
  });

  it('Check if new RuleSet is assignable', () => {
    const orig_ruleSet = imp.getRuleSet();
    const new_ruleSet = new RuleSet();
    imp.setRuleSet(new_ruleSet);
    expect(imp.getRuleSet()).not.to.be.undefined;
    expect(imp.getRuleSet()).not.equal(orig_ruleSet);
  });
});
