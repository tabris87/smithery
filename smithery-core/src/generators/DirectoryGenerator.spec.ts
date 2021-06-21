//setting up the testenvironment
import { expect } from 'chai';
import 'mocha';
import { stub } from 'sinon';

//import stuff to test
import { DirectoryGenerator } from './DirectoryGenerator';
import { FileType } from '../enums';
import * as fs from 'fs';
import { join } from 'path';
import { FSTTerminal } from '../utils/FSTTerminal';
import { FSTNonTerminal } from '../utils/FSTNonTerminal';

describe('Check the generating ability of the DirectoryGenerator', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fakeMkdirSync = (_: fs.PathLike, __?: fs.Mode | fs.MakeDirectoryOptions | null): string | undefined => {
    return undefined;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mkdirSyncStub: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let writeFileSyncStub: any;

  fs.mkdirSync

  beforeEach(() => {
    mkdirSyncStub = stub(fs, 'mkdirSync');
    mkdirSyncStub.callsFake(fakeMkdirSync);

    writeFileSyncStub = stub(fs, 'writeFileSync');
  });

  afterEach(() => {
    writeFileSyncStub.restore();
    mkdirSyncStub.restore();
  })

  it('Check a single folder to be generated ', () => {
    const fst = new FSTTerminal(FileType.Folder, 'testFolder');
    const dg = new DirectoryGenerator();
    dg.generate(fst, { filePath: 'testPath' });

    expect(mkdirSyncStub.calledOnce).to.be.true;
    expect(mkdirSyncStub.calledWith(join('testPath', 'testFolder'))).to.be.true;
  });

  it('Check a single file to be generated', () => {
    const fst = new FSTTerminal(FileType.File, 'testFile.test', 'This is my test-content');
    const dg = new DirectoryGenerator();
    dg.generate(fst, { filePath: 'testPath' });

    expect(writeFileSyncStub.calledOnce).to.be.true;
    expect(writeFileSyncStub.calledWith(join('testPath', 'testFile.test'), 'This is my test-content')).to.be.true;
  });

  it('Check a single file nested within a folder to be generated', () => {
    const fstFile = new FSTTerminal(FileType.File, 'testFile.test', 'This is my test-content')
    const fstFolder = new FSTNonTerminal(FileType.Folder, 'testFolder', [fstFile]);

    const dg = new DirectoryGenerator();
    dg.generate(fstFolder, { filePath: 'testPath' });

    expect(mkdirSyncStub.calledOnce).to.be.true;
    expect(mkdirSyncStub.calledWith(join('testPath', 'testFolder'))).to.be.true;

    expect(writeFileSyncStub.calledOnce).to.be.true;
    expect(writeFileSyncStub.calledWith(join('testPath', 'testFolder', 'testFile.test'), 'This is my test-content')).to.be.true;
  });
});