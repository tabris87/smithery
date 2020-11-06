import { expect, assert } from 'chai';
import 'mocha';
import { stub } from 'sinon';

import * as fs from 'fs';

import { Project } from './Project';

describe('Testing the Project class', () => {
  it('Project instantiation should fail if no valid configuration is given', () => {
    // we can not pass a specific error message, because the message includes the execution environment.
    assert.throws(() => { new Project() });
  });

  describe('Project should be able to read different type of configurations', () => {

    it('Project should be able to instantiate by a directly given configuration', () => {
      const p = new Project({
        buildFolder: 'build',
        projectFiles: 'features',
        configs: [{ name: 'default', features: ['base'] }]
      });

      expect(p).not.to.be.undefined;
    });

    it('Project should be able to instantiate by a configuration path', () => {
      const existsSyncStub = stub(fs, 'existsSync');
      existsSyncStub
        //used for checkSmitheryConfig
        .onCall(0).returns(false)
        //used for checkCustomConfigurations
        .onCall(1).returns(true)
        //used on line 137 (// setup the configs)
        .onCall(2).returns(true)
        //used at _getConfigFiles
        .onCall(3).returns(true);

      const readFileSyncStub = stub(fs, 'readFileSync');
      readFileSyncStub
        //used to read the configuration file
        .onFirstCall().returns(`{
          "model":"./model/model.xml",
          "configs":"configurations",
          "projectFiles":"features",
          "buildFolder":"build"
        }`)
        //used at _getConfigFiles
        .onSecondCall().returns(`
          Base
        `);

      const readdirSyncStub = stub(fs, 'readdirSync');
      readdirSyncStub
        //used to get all configurations at the given configuration path
        .onFirstCall().returns(['default.config']);

      const p = new Project({ configPath: 'test.config' });
      expect(p).not.to.be.undefined;

      existsSyncStub.restore();
      readdirSyncStub.restore();
      readFileSyncStub.restore();
    });

    it('Project should be able to instantiate by the smithery.json configuration', () => {
      const existsSyncStub = stub(fs, 'existsSync');
      existsSyncStub
        //used for checkSmitheryConfig
        .onCall(0).returns(true)
        //not called because of precheck on empty paths
        /* //used for checkCustomConfigurations
        .onCall(1).returns(false) */
        //used on line 137 (// setup the configs)
        .onCall(1).returns(true)
        //used at _getConfigFiles
        .onCall(2).returns(true);

      const readFileSyncStub = stub(fs, 'readFileSync');
      readFileSyncStub
        //used to read the configuration file
        .onFirstCall().returns(`{
          "model":"./model/model.xml",
          "configs":"configurations",
          "projectFiles":"features",
          "buildFolder":"build"
        }`)
        //used at _getConfigFiles
        .onSecondCall().returns(`
          Base
        `);

      const readdirSyncStub = stub(fs, 'readdirSync');
      readdirSyncStub
        //used to get all configurations at the given configuration path
        .onFirstCall().returns(['default.config']);

      const p = new Project();
      expect(p).not.to.be.undefined;

      existsSyncStub.restore();
      readdirSyncStub.restore();
      readFileSyncStub.restore();
    });
  });
});
