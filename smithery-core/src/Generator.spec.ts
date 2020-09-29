//setting up test environment
import { expect } from 'chai';
import 'mocha';

//import stuff to test
import { GeneratorFactory } from './Generator';
import { FileType } from './enums';

describe('Check the GeneratorFactory', () => {

  it('GenFactory should be fine after creation', () => {
    expect(new GeneratorFactory()).not.to.be.undefined;
  });

  it('GeneratorFactory should contain at least the "File" and "Folder" generators.', () => {
    const genFact = new GeneratorFactory();
    expect(genFact.getGenerator(FileType.File)).not.to.be.undefined;
    expect(genFact.getGenerator(FileType.Folder)).not.to.be.undefined;
  });

});