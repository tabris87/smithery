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

    it('Project has to throw a error if a given custom configuration is not within the project', () => {
      mock({
        'configurations': {
          'default.config': 'Base'
        },
        'features': {
          'Base': {
            'README.md': 'TEST'
          }
        }
      });

      assert.throws(() => { new Project({ configPath: 'test.config' }) }, 'The configuration "test.config" is not within the project folder!!');

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

    it('All configurations should combine together', () => {
      mock({
        'smithery.json': `{
          "buildFolder":"build"
        }`,
        'test.config': `{
          "configs":"configurations"  
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

      const p = new Project({ projectFiles: 'features', configPath: 'test.config' });
      expect(p).not.to.be.undefined;

      mock.restore();
    })

    it('Project should be able to instantiate by the smithery.json configuration with custom rules', () => {
      mock({
        'smithery.json': `{
          "model":"./model/model.xml",
          "configs":"configurations",
          "projectFiles":"features",
          "buildFolder":"build",
          "projectRules": "custRules"
        }`,
        'configurations': {
          'default.config': 'Base'
        },
        'features': {
          'Base': {
            'README.md': 'TEST'
          }
        },
        'custRules': {
          'testRule.ts': `
          import { IRule } from './Interfaces';
          import { Node } from './utils/Node';
          import { Imposer } from './Imposer';

          export const rule: IRule = {
            apply: (baseFST: Node, featureFST: Node, context: Imposer): Node => {
              return new Node();
            },
            target: ['wat'],
            selector: 'Blub > Bam Whatever Thinkof[att=val]',
          };`
        }
      });

      const p = new Project();
      expect(p).not.to.be.undefined;

      mock.restore();
    });

    it('Project should be able to instantiate by the smithery.json configuration with a single custom rule', () => {
      mock({
        'smithery.json': `{
          "model":"./model/model.xml",
          "configs":"configurations",
          "projectFiles":"features",
          "buildFolder":"build",
          "projectRules": "custRules/testRule.ts"
        }`,
        'configurations': {
          'default.config': 'Base'
        },
        'features': {
          'Base': {
            'README.md': 'TEST'
          }
        },
        'custRules': {
          'testRule.ts': `
          import { IRule } from './Interfaces';
          import { Node } from './utils/Node';
          import { Imposer } from './Imposer';

          export const rule: IRule = {
            apply: (baseFST: Node, featureFST: Node, context: Imposer): Node => {
              return new Node();
            },
            target: ['wat'],
            selector: 'Blub > Bam Whatever Thinkof[att=val]',
          };`
        }
      });

      const p = new Project();
      expect(p).not.to.be.undefined;

      mock.restore();
    });
  });

  describe('Project has to throw a error if a combination of configurations is not complete', () => {
    it('custom config is invalid', () => {
      //We don't have a smithery and custom config
      mock({
        'test.config': `{}`,
        'configurations': {
          'default.config': 'Base'
        },
        'features': {
          'Base': {
            'README.md': 'TEST'
          }
        }
      });

      assert.throws(() => { new Project({ configPath: 'test.config' }) }, `The used configuration for project "${process.cwd()}" is inclomplete.`);

      mock.restore();
    });

    it('smithery.json is invalid', () => {
      //We don't have a smithery and custom config
      mock({
        'smithery.json': `{}`,
        'configurations': {
          'default.config': 'Base'
        },
        'features': {
          'Base': {
            'README.md': 'TEST'
          }
        }
      });

      assert.throws(() => { new Project() }, `The used configuration for project "${process.cwd()}" is inclomplete.`);

      mock.restore();
    });

    it('direct config is invalid', () => {
      //We don't have a smithery and custom config
      mock({
        'configurations': {
          'default.config': 'Base'
        },
        'features': {
          'Base': {
            'README.md': 'TEST'
          }
        }
      });

      assert.throws(() => { new Project({ projectFiles: 'features', configs: [{ name: 'default', features: ['base'] }] }) }, `The used configuration for project "${process.cwd()}" is inclomplete.`);

      mock.restore();
    });
  });

  it('Project should throw an error if the configs path is invalid', () => {
    mock({
      //let's name configurations in german
      'test.config': `{
        "model":"./model/model.xml",
        "configs":"Konfigurationen",
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

    assert.throws(() => { new Project({ configPath: 'test.config' }) }, 'The build-configurations setup is not given properly');

    mock.restore();
  });

  it('Project should throw an error if there are not configurations witch can be set', () => {
    mock({
      //let's name configurations in german
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
      configs: []
    });

    assert.throws(() => {
      p.setConfig('test');
    }, 'No configs given');

    mock.restore();
  });

  it('Project should throw an error if the given config is not a internal saved configurations', () => {
    mock({
      //let's name configurations in german
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

    assert.throws(() => {
      p.setConfig('test');
    }, 'Config for test does not exist withing configurations');

    mock.restore();
  });
});
