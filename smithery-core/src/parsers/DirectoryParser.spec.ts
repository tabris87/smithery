//setting up the testenvironment
import { expect } from 'chai';
import 'mocha';
import { stub } from 'sinon';

//import stuff to test
import { DirectoryParser } from './DirectoryParser';
import { FileType } from '../enums';
import * as fs from 'fs';


describe('Check if the Directory Parser correctly parses file systems into the espree AST', () => {
  it('Check the correct visitor keys', () => {
    const dp = new DirectoryParser();
    expect(dp).to.be.not.undefined;
    expect(dp.getVisitorKeys()).to.be.eql({
      Folder: ['children'],
      File: []
    });
  });

  it('Check a single file to be parsed into the AST representation', () => {
    const lstatSyncStub = stub(fs, 'lstatSync');
    lstatSyncStub.returns({
      isFile: () => true,
      isDirectory: () => false,
      isBlockDevice: () => false,
      isCharacterDevice: () => false,
      isSymbolicLink: () => false,
      isFIFO: () => false,
      isSocket: () => false,
      dev: 0,
      ino: 0,
      mode: 0,
      nlink: 0,
      uid: 0,
      gid: 0,
      rdev: 0,
      size: 2000,
      blksize: 200,
      blocks: 2,
      atimeMs: 2000,
      mtimeMs: 2000,
      ctimeMs: 2000,
      birthtimeMs: 2000,
      atime: new Date(),
      mtime: new Date(),
      ctime: new Date(),
      birthtime: new Date()
    });

    const readFileSyncStub = stub(fs, 'readFileSync');
    readFileSyncStub.returns('This is the correct File content');

    const dp = new DirectoryParser();
    const ast = dp.parse('testPath');
    expect(ast).not.to.be.undefined;
    expect(ast.type).to.be.equal(FileType.File);
    expect(ast.content).to.be.equal('This is the correct File content');
  });
});
