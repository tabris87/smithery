//setting up test environment
import { expect } from 'chai';
import 'mocha';

//import stuff to test
import { RuleSet } from './RuleSet';

describe('Check the RuleSet', () => {

  it('RuleSet should be fine after creation without parameters', () => {
    expect(new RuleSet()).not.to.be.undefined;
  });

  it('New concrete tests have to be defined', () => {
    expect.fail;
  })
});