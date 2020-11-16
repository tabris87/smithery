import { Project } from '../Project';
import { expect } from 'chai';

import * as sinon from 'sinon';

import * as fs from 'fs';
import * as path from 'path';

import * as mock from 'mock-fs';

describe('Scenario test for builds using different configurations', () => {
  let backupLog: { (...data: any[]): void; (message?: any, ...optionalParams: any[]): void; (...data: any[]): void; (message?: any, ...optionalParams: any[]): void; };
  let texts: string[] = [];

  beforeEach(() => {
    backupLog = console.log;
    console.log = function (message?: string): void {
      if (message) {
        texts.push(message);
      }
    }
  });

  afterEach(() => {
    afterEach(function () {
      if (this?.currentTest?.state === 'failed') {
        console.log = backupLog;
        texts.forEach((msg: string) => {
          console.log(msg);
        });
        texts = [];
      }
      if (this?.currentTest?.state !== 'passed') {
        // a test, before(), or beforeEach() hook just failed
      }
    });
  });

  it('Perform build of simple basic Base folder only', () => {
    mock({
      'smithery.json': `{
                "model":"./model/model.xml",
                "configs":"configurations",
                "projectFiles":"features",
                "buildFolder":"build"
              }`,
      'configurations': {
        'default.config': 'Base'
      },
      'features': {
        'Base': {
          'README.md': 'TEST'
        }
      }
    })

    const mkdirSyncStub = sinon.stub(fs, 'mkdirSync');
    const writeFileSyncStub = sinon.stub(fs, 'writeFileSync');

    const p = new Project();
    p.build('default');

    //first the build folder because this one is missing
    //second call for the root folder
    expect(mkdirSyncStub.calledOnce).to.be.true;
    expect(mkdirSyncStub.calledWith(path.join(process.cwd(), 'build'))).to.be.true;

    expect(writeFileSyncStub.calledOnce).to.be.true;
    expect(writeFileSyncStub.calledWith('README.md', 'utf-8'));

    mock.restore();
    mkdirSyncStub.restore();
    writeFileSyncStub.restore();
  });

  it('Perform build of one additional folder and file withing', () => {
    mock({
      'smithery.json': `{
                "model":"./model/model.xml",
                "configs":"configurations",
                "projectFiles":"features",
                "buildFolder":"build"
              }`,
      'configurations': {
        'default.config': 'Base',
        'one.config': 'Base\nOne'
      },
      'features': {
        'Base': {
          'README.md': 'TEST'
        },
        'One': {
          'src': {
            'main.js': 'function run() {console.log("running");}\n\nrun();'
          }
        }
      }
    })

    const mkdirSyncStub = sinon.stub(fs, 'mkdirSync');
    const writeFileSyncStub = sinon.stub(fs, 'writeFileSync');

    const p = new Project();
    p.build('one');
    //first the build folder because this one is missing
    //second call for the root folder
    expect(mkdirSyncStub.calledTwice).to.be.true;
    expect(mkdirSyncStub.calledWith(path.join(process.cwd(), 'build'))).to.be.true;
    expect(mkdirSyncStub.calledWith(path.join(process.cwd(), 'build', 'src'))).to.be.true;

    expect(writeFileSyncStub.calledTwice).to.be.true;
    expect(writeFileSyncStub.calledWith(path.join(process.cwd(), 'build', 'README.md'), 'utf-8'));
    expect(writeFileSyncStub.calledWith(path.join(process.cwd(), 'build', 'src', 'main.js'), 'utf-8'));

    mock.restore();
    mkdirSyncStub.restore();
    writeFileSyncStub.restore();
  });
});
