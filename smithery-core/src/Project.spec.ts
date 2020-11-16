import { expect, assert } from 'chai';
import 'mocha';
import { stub } from 'sinon';
import * as mock from 'mock-fs';

import * as fs from 'fs';

import { Project } from './Project';

describe('Testing the Project class', () => {
  it('Project instantiation should fail if no valid configuration is given', () => {
    // we can not pass a specific error message, because the message includes the execution environment.
    assert.throws(() => { new Project() });
  });

  describe('Project should be able to read different type of configurations', () => {

    it('Project should be able to instantiate by a directly given configuration', () => {
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
      });
      const p = new Project({
        buildFolder: 'build',
        projectFiles: 'features',
        configs: [{ name: 'default', features: ['base'] }]
      });

      expect(p).not.to.be.undefined;
      mock.restore();
    });

    it('Project should be able to instantiate by a configuration path', () => {
      mock({
        'test.config': `{
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
      });

      const p = new Project({ configPath: 'test.config' });
      expect(p).not.to.be.undefined;

      mock.restore();
    });

    it('Project should be able to instantiate by the smithery.json configuration', () => {
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
      });

      const p = new Project();
      expect(p).not.to.be.undefined;

      mock.restore();
    });
  });
});
