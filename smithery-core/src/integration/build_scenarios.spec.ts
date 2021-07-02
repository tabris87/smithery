import { Project } from '../Project';
import { expect, assert } from 'chai';

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

  describe('Test successfull builds', () => {
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
      debugger;
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

    it('Perform build of default if no configuration name is given', () => {
      const backupWarn = console.warn;
      const warnings: string[] = [];
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

      console.warn = (warning: string) => {
        warnings.push(warning);
      }

      const mkdirSyncStub = sinon.stub(fs, 'mkdirSync');
      const writeFileSyncStub = sinon.stub(fs, 'writeFileSync');

      const p = new Project();
      p.build();

      //first the build folder because this one is missing
      //second call for the root folder
      expect(mkdirSyncStub.calledOnce).to.be.true;
      expect(mkdirSyncStub.calledWith(path.join(process.cwd(), 'build'))).to.be.true;

      expect(writeFileSyncStub.calledOnce).to.be.true;
      expect(writeFileSyncStub.calledWith('README.md', 'utf-8'));
      expect(warnings.includes('No configuration set, switching to default'));

      mock.restore();
      console.warn = backupWarn;
      mkdirSyncStub.restore();
      writeFileSyncStub.restore();
    });

    it('Perform build of simple basic Base folder with deletion of previous build', () => {
      mock({
        'build': {
          'README.md': 'TEST',
          'src': {
            'main.js': 'console.log("HelloWorld");'
          }
        },
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
      const unlinkSyncSpy = sinon.spy(fs, 'unlinkSync');
      const rmdirSyncSpy = sinon.spy(fs, 'rmdirSync');

      const p = new Project();
      p.build('default');

      //first the build folder because this one is missing
      //second call for the root folder
      expect(mkdirSyncStub.calledOnce).to.be.true;
      expect(mkdirSyncStub.calledWith(path.join(process.cwd(), 'build'))).to.be.true;

      expect(writeFileSyncStub.calledOnce).to.be.true;
      expect(writeFileSyncStub.calledWith('README.md', 'utf-8'));

      expect(unlinkSyncSpy.calledTwice).to.be.true;
      expect(unlinkSyncSpy.calledWith('README.md'));
      expect(unlinkSyncSpy.calledWith('main.js'));

      expect(rmdirSyncSpy.calledTwice).to.be.true;
      expect(rmdirSyncSpy.calledWith('src'));
      expect(rmdirSyncSpy.calledWith('build'));
      mock.restore();
      mkdirSyncStub.restore();
      writeFileSyncStub.restore();
    });
  });

  describe('Check correct error handling', () => {
    it('Throw an error if no specific configuration is set and the default configuration is not present', () => {
      mock({
        'smithery.json': `{
                  "model":"./model/model.xml",
                  "configs":"configurations",
                  "projectFiles":"features",
                  "buildFolder":"build"
                }`,
        'configurations': {
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
      });

      const p = new Project();
      assert.throws(() => { p.build() }, 'No configuration given, therefore no build possible!')

      mock.restore();
    });

    it('Throw an error if the base feature is missing from the used configuration', () => {
      mock({
        'smithery.json': `{
                  "model":"./model/model.xml",
                  "configs":"configurations",
                  "projectFiles":"features",
                  "buildFolder":"build"
                }`,
        'configurations': {
          'default.config': 'One',
          'one.config': 'Base\nOne'
        },
        'features': {
          'One': {
            'src': {
              'main.js': 'function run() {console.log("running");}\n\nrun();'
            }
          }
        }
      });

      const p = new Project();
      assert.throws(() => { p.build() }, 'No Base feature set up! Build not possible!')

      mock.restore();
    });

    it('Throw an error if the base feature is missing from the features', () => {
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
          'One': {
            'src': {
              'main.js': 'function run() {console.log("running");}\n\nrun();'
            }
          }
        }
      });

      const p = new Project();
      assert.throws(() => { p.build() }, 'Base feature is not at the source code, therefore we can not start')

      mock.restore();
    });

    it('Throw an error if the feature to imply is not at the features', () => {
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
          }
        }
      });

      const p = new Project();
      assert.throws(() => { p.build('one') }, '[One] feature is not at the source code, stopped building')

      mock.restore();
    });
  });
});
