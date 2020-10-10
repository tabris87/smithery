//setting up test environment
import { expect } from 'chai';
import 'mocha';

import { Node } from './Node';

describe('Check the Utility Class Node, to prove it is correct working', () => {

  it('Check if Node is createable without any parameters', () => {
    expect(new Node()).not.to.be.undefined;
  });

  it('Check if Node creates with position parameter', () => {
    const n = new Node(1);
    expect(n).not.to.be.undefined;
    expect(n.start).equal(1);
  });

  it('Check if Node can be correctly copied, without just copying the node reference', () => {
    const n = new Node();
    n.type = 'test';
    n.name = 'Test-Name';
    n.path = 'root';
    n.sourePath = 'elsewhere';
    n.setAttribute('att1', 'value1');

    const copy_n = n.clone();

    //checks
    expect(copy_n).not.equal(n);
    expect(copy_n.type).equal(n.type);
    expect(copy_n.path).equal(n.path);
    expect(copy_n.sourcePath).equal(n.sourcePath);
    expect(copy_n.getAttribute('att1')).equal(n.getAttribute('att1'));
  });
})