import { expect } from 'chai';
import 'mocha';
import { Rule } from './Rule';
import { override } from './rules';

//import stuff to test

describe('Check the Rule Class', () => {
  it('Simply check the creation of a rule by given description', () => {
    const r = new Rule(override);
    expect(r).not.to.be.undefined;
  });

  it('Check if a copy is not the same reference but has the same functionality', () => {
    const r = new Rule(override);
    const c_r = r.copy();

    expect(c_r).not.to.be.equal(r);
    expect(c_r.getID()).to.be.equal(r.getID());
    expect(c_r.apply).not.to.be.undefined;
  })
})