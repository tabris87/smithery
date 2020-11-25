import { Project } from '../Project';
import { expect, assert } from 'chai';

import * as sinon from 'sinon';

import * as fs from 'fs';
import * as path from 'path';

import * as mock from 'mock-fs';

describe('Multiple errors within playground tests, for retest and correction purposes', () => {
  it('While generating the base config -> README.md is missing, expecting successfull build', () => {
    //creating the current setup of the playground repo 25.11.2020
    mock({
      //first the project files
      'smithery.json': `{
        "model":"./model/model.xml",
        "configs":"configurations",
        "projectFiles":"features",
        "buildFolder":"build"
      }`,
      'README.md': ``,
      '.gitignore': ``,
      'model': {
        //currently we won't use the model.xml, but we placed it here and the model.xml is empty also at the playground
        'model.xml': ``
      },
      'configurations': {
        'config1.config': 'Base\nfeature1',
        'config2.config': 'Base\nfeature1\nfeature2',
        'default.config': 'Base'
      },
      'features': {
        'Base': {
          'README.md': ``
        },
        'feature1': {
          'folder_feature1': {}
        },
        'feature2': {
          'folder_feature1': {
            'file_subFeature1_feature2.txt': ''
          },
          'file_feature2.txt': ''
        }
      }
    });

    const p = new Project();
    p.build('default');

    expect(fs.existsSync('./build')).to.be.true;
    expect(fs.existsSync(path.join('./build', 'README.md'))).to.be.true;

    mock.restore()
  });

  it('While generating the config1 -> README.md is missing only folder_feature1 is present, expecting successfull build', () => {
    //creating the current setup of the playground repo 25.11.2020
    mock({
      //first the project files
      'smithery.json': `{
        "model":"./model/model.xml",
        "configs":"configurations",
        "projectFiles":"features",
        "buildFolder":"build"
      }`,
      'README.md': ``,
      '.gitignore': ``,
      'model': {
        //currently we won't use the model.xml, but we placed it here and the model.xml is empty also at the playground
        'model.xml': ``
      },
      'configurations': {
        'config1.config': 'Base\nfeature1',
        'config2.config': 'Base\nfeature1\nfeature2',
        'default.config': 'Base'
      },
      'features': {
        'Base': {
          'README.md': ''
        },
        'feature1': {
          'folder_feature1': {}
        },
        'feature2': {
          'folder_feature1': {
            'file_subFeature1_feature2.txt': ''
          },
          'file_feature2.txt': ''
        }
      }
    });

    const p = new Project();
    p.build('config1');

    expect(fs.existsSync('./build')).to.be.true;
    expect(fs.existsSync(path.join('./build', 'README.md'))).to.be.true;
    expect(fs.existsSync(path.join('./build', 'folder_feature1'))).to.be.true;

    mock.restore()
  });

  it('While generating the config2 -> throws error folder_feature1 is already present, expecting successfull build', () => {
    //creating the current setup of the playground repo 25.11.2020
    mock({
      //first the project files
      'smithery.json': `{
        "model":"./model/model.xml",
        "configs":"configurations",
        "projectFiles":"features",
        "buildFolder":"build"
      }`,
      'README.md': ``,
      '.gitignore': ``,
      'model': {
        //currently we won't use the model.xml, but we placed it here and the model.xml is empty also at the playground
        'model.xml': ``
      },
      'configurations': {
        'config1.config': 'Base\nfeature1',
        'config2.config': 'Base\nfeature1\nfeature2',
        'default.config': 'Base'
      },
      'features': {
        'Base': {
          'README.md': ''
        },
        'feature1': {
          'folder_feature1': {}
        },
        'feature2': {
          'folder_feature1': {
            'file_subFeature1_feature2.txt': ''
          },
          'file_feature2.txt': ''
        }
      }
    });

    const p = new Project();
    debugger;
    p.build('config2');

    expect(fs.existsSync('./build')).to.be.true;
    expect(fs.existsSync(path.join('./build', 'README.md'))).to.be.true;
    expect(fs.existsSync(path.join('./build', 'folder_feature1'))).to.be.true;
    expect(fs.existsSync(path.join('./build', 'folder_feature1', 'file_subFeature1_feature2.txt'))).to.be.true;
    expect(fs.existsSync(path.join('./build', 'file_feature2.txt'))).to.be.true;

    mock.restore()
  });
});