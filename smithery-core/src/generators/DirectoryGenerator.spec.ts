//setting up the testenvironment
import { expect } from 'chai';
import 'mocha';
import { stub } from 'sinon';

//import stuff to test
import { DirectoryGenerator } from './DirectoryGenerator';
import { Node } from '../utils/Node';
import { FileType } from '../enums';
import * as fs from 'fs';
import { join } from 'path';

describe('Check the generating ability of the DirectoryGenerator', () => {
  const fakeMkdirSync = (path: fs.PathLike, options?: fs.Mode | fs.MakeDirectoryOptions | null): string | undefined => {
    return undefined;
  };
  let mkdirSyncStub: any;
  let writeFileSyncStub: any;

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
    const AST = new Node();
    AST.children = [];
    AST.type = FileType.Folder;
    AST.name = 'testFolder';

    const dg = new DirectoryGenerator();
    dg.generate(AST, { filePath: 'testPath' });

    expect(mkdirSyncStub.calledOnce).to.be.true;
    expect(mkdirSyncStub.calledWith(join('testPath', 'testFolder'))).to.be.true;
  });

  it('Check a single file to be generated', () => {
    const AST = new Node();
    AST.type = FileType.File;
    AST.name = 'testFile.test';
    AST.content = 'This is my test-content';

    const dg = new DirectoryGenerator();
    dg.generate(AST, { filePath: 'testPath' });

    expect(writeFileSyncStub.calledOnce).to.be.true;
    expect(writeFileSyncStub.calledWith(join('testPath', 'testFile.test'), 'This is my test-content')).to.be.true;
  });

  it('Check a single file nested within a folder to be generated', () => {
    const AST_File = new Node();
    AST_File.type = FileType.File;
    AST_File.name = 'testFile.test';
    AST_File.content = 'This is my test-content';

    const AST_Folder = new Node();
    AST_Folder.children = [AST_File];
    AST_Folder.type = FileType.Folder;
    AST_Folder.name = 'testFolder';

    const dg = new DirectoryGenerator();
    dg.generate(AST_Folder, { filePath: 'testPath' });

    expect(mkdirSyncStub.calledOnce).to.be.true;
    expect(mkdirSyncStub.calledWith(join('testPath', 'testFolder'))).to.be.true;

    expect(writeFileSyncStub.calledOnce).to.be.true;
    expect(writeFileSyncStub.calledWith(join('testPath', 'testFolder', 'testFile.test'), 'This is my test-content')).to.be.true;
  });
});