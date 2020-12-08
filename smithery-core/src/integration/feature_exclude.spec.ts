import { Project } from '../Project';
import { expect } from 'chai';

import * as fs from 'fs';
import * as path from 'path';

import * as mock from 'mock-fs';

describe('New feature "exclude" test', () => {
  it('Try to exclude the "*.md" file', () => {
    //creating the current setup of the playground repo 25.11.2020
    mock({
      //first the project files
      'smithery.json': `{
        "model":"./model/model.xml",
        "configs":"configurations",
        "projectFiles":"features",
        "buildFolder":"build",
        "exclude": "**/*.md"
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
    p.build('config2');

    expect(fs.existsSync('./build')).to.be.true;
    expect(fs.existsSync(path.join('./build', 'README.md'))).to.be.not.true;
    expect(fs.existsSync(path.join('./build', 'folder_feature1'))).to.be.true;
    expect(fs.existsSync(path.join('./build', 'folder_feature1', 'file_subFeature1_feature2.txt'))).to.be.true;
    expect(fs.existsSync(path.join('./build', 'file_feature2.txt'))).to.be.true;

    mock.restore()
  });

  it('Exclude the "folder_feature1" from the build process', () => {
    //creating the current setup of the playground repo 25.11.2020
    mock({
      //first the project files
      'smithery.json': `{
        "model":"./model/model.xml",
        "configs":"configurations",
        "projectFiles":"features",
        "buildFolder":"build",
        "exclude": "**/folder_feature1"
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
    p.build('config2');

    expect(fs.existsSync('./build')).to.be.true;
    expect(fs.existsSync(path.join('./build', 'README.md'))).to.be.true;
    expect(fs.existsSync(path.join('./build', 'folder_feature1'))).to.be.not.true;
    expect(fs.existsSync(path.join('./build', 'file_feature2.txt'))).to.be.true;

    mock.restore()
  });

  it('Expect a successfull build for all files, together with a non matching exclude pattern', () => {
    //creating the current setup of the playground repo 25.11.2020
    mock({
      //first the project files
      'smithery.json': `{
        "model":"./model/model.xml",
        "configs":"configurations",
        "projectFiles":"features",
        "buildFolder":"build",
        "exclude": "*.js"
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
    p.build('config2');

    expect(fs.existsSync('./build')).to.be.true;
    expect(fs.existsSync(path.join('./build', 'README.md'))).to.be.true;
    expect(fs.existsSync(path.join('./build', 'folder_feature1'))).to.be.true;
    expect(fs.existsSync(path.join('./build', 'folder_feature1', 'file_subFeature1_feature2.txt'))).to.be.true;
    expect(fs.existsSync(path.join('./build', 'file_feature2.txt'))).to.be.true;

    mock.restore()
  });
});