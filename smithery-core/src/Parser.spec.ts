//setting up test environment
import { expect } from 'chai';
import 'mocha';

//import stuff to test
import { ParserFactory } from './Parser';
import { FileType } from './enums';

describe('Check the ParserFactory', () => {

  it('ParserFactory should be fine after creation', () => {
    expect(new ParserFactory()).not.to.be.undefined;
  });

  it('GeneratorFactory should contain at least the "File" and "Folder" parser.', () => {
    const parseFact = new ParserFactory();
    expect(parseFact.getParser(FileType.File)).not.to.be.undefined;
    expect(parseFact.getParser(FileType.Folder)).not.to.be.undefined;
  });
});