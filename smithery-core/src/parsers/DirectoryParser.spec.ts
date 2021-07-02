//setting up the testenvironment
import { expect } from 'chai';
import 'mocha';
import { assert, stub } from 'sinon';

//import stuff to test
import { DirectoryParser } from './DirectoryParser';
import { FileType } from '../enums';
import * as fs from 'fs';
import * as path from 'path';
import { FSTTerminal } from '../utils/FSTTerminal';
import { FSTNonTerminal } from '../utils/FSTNonTerminal';

const dp = new DirectoryParser();

describe('Check if the Directory Parser correctly parses file systems into the FST', () => {
  it('Check the correct creation without any information', () => {
    const dp = new DirectoryParser();
    expect(dp).to.be.not.undefined;
  });

  it('Check a single file to be parsed into the FST representation', () => {
    //setup the test
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

    //perform test
    const fst = dp.parse('testPath');
    expect(fst).not.to.be.undefined;

    expect(fst.getName()).to.be.equal("testPath");
    expect(fst.getParent()).to.be.undefined;
    expect(fst.getType()).to.be.equal(FileType.File);

    //now check the most important the node type !
    expect(fst instanceof FSTTerminal).to.be.true;

    //if the terminal node provides no language the override strategy should be used
    expect((fst as FSTTerminal).getCodeLanguage()).to.be.equal('');
    expect((fst as FSTTerminal).getMergeStrategy()).to.be.equal('fileOverride');

    readFileSyncStub.restore();
    lstatSyncStub.restore();
  });

  it('Check if language is correctly determined', () => {
    //setup the test
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

    //perform test
    const fst2 = dp.parse('terminal.lang');
    expect(fst2).not.to.be.undefined;

    expect(fst2.getName()).to.be.equal("terminal.lang");
    expect(fst2.getParent()).to.be.undefined;
    expect(fst2.getType()).to.be.equal(FileType.File);

    //now check the most important the node type !
    expect(fst2 instanceof FSTTerminal).to.be.true;

    //if the terminal node provides no language the override strategy should be used
    expect((fst2 as FSTTerminal).getCodeLanguage()).to.be.equal('lang');
    expect((fst2 as FSTTerminal).getMergeStrategy()).to.be.equal('fileOverride');

    readFileSyncStub.restore();
    lstatSyncStub.restore();
  });

  it('Check one folder one subfile to FST production', () => {
    const lstatSyncStub = stub(fs, 'lstatSync');
    lstatSyncStub.onFirstCall()
      .returns({
        isFile: () => false,
        isDirectory: () => true,
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
      }).onSecondCall().returns({
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
    const fileContent = 'This is the correct File content';
    readFileSyncStub.returns(fileContent);

    const readdirSyncStub = stub(fs, 'readdirSync');
    readdirSyncStub.onFirstCall().returns(['testFile']);

    const dp = new DirectoryParser();
    const fst = dp.parse('testPath');
    expect(fst).not.to.be.undefined;

    expect(fst.getName()).to.be.equal("root");
    expect(fst.getParent()).to.be.undefined;
    expect(fst.getType()).to.be.equal(FileType.Folder);

    //now check the most important the node type !
    expect(fst instanceof FSTNonTerminal).to.be.true;

    //check the children
    expect((fst as FSTNonTerminal).getChildren().length).to.be.equal(1);
    expect((fst as FSTNonTerminal).getChildAt(0) instanceof FSTTerminal).to.be.true;
    const firstChild = (fst as FSTNonTerminal).getChildAt(0);
    expect(firstChild?.getName()).to.be.equal('testFile');
    expect(firstChild?.getType()).to.be.equal(FileType.File);
    expect((firstChild as FSTTerminal).getContent()).to.be.equal(fileContent);

    //if the terminal node provides no language the override strategy should be used
    expect((firstChild as FSTTerminal).getCodeLanguage()).to.be.equal('');
    expect((firstChild as FSTTerminal).getMergeStrategy()).to.be.equal('fileOverride');

    lstatSyncStub.restore();
    readFileSyncStub.restore();
    readdirSyncStub.restore();
  });
});
