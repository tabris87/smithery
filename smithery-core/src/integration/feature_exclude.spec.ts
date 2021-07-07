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

  it('Expect a successfull build for all files, together with excluded files from the build at the build folder', () => {
    //creating the current setup of the playground repo 25.11.2020
    mock({
      //first the project files
      'smithery.json': `{
        "model":"./model/model.xml",
        "configs":"configurations",
        "projectFiles":"features",
        "buildFolder":"build",
        "exclude": "**/node_modules"
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
      },
      'build': {
        'node_modules': {
          'dep1': {},
          'dep2': {},
          'dep3': {}
        },
        'folder_feature1': {
          'file_subFeature1_feature2.txt': ''
        },
        'file_feature2.txt': '',
        'README.md': ''
      }
    });

    const p = new Project();
    expect(fs.existsSync('./build')).to.be.true;
    expect(fs.existsSync(path.join('./build', 'node_modules'))).to.be.true;
    p.build('config2');

    expect(fs.existsSync('./build')).to.be.true;
    expect(fs.existsSync(path.join('./build', 'node_modules'))).to.be.true;
    expect(fs.existsSync(path.join('./build', 'README.md'))).to.be.true;
    expect(fs.existsSync(path.join('./build', 'folder_feature1'))).to.be.true;
    expect(fs.existsSync(path.join('./build', 'folder_feature1', 'file_subFeature1_feature2.txt'))).to.be.true;
    expect(fs.existsSync(path.join('./build', 'file_feature2.txt'))).to.be.true;

    mock.restore()
  });

  it('Exclude the "folder_feature1" and "*.md"-files from the build process, by smither.json', () => {
    mock({
      //first the project files
      'smithery.json': `{
        "model":"./model/model.xml",
        "configs":"configurations",
        "projectFiles":"features",
        "buildFolder":"build",
        "exclude": [
          "**/folder_feature1",
          "**/*.md"
        ]
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
    expect(fs.existsSync(path.join('./build', 'README.md'))).to.be.not.true;
    expect(fs.existsSync(path.join('./build', 'folder_feature1'))).to.be.not.true;
    expect(fs.existsSync(path.join('./build', 'file_feature2.txt'))).to.be.true;

    mock.restore()
  });

  it('Exclude the "folder_feature1" and "*.md"-files from the build process, by customConfig', () => {
    mock({
      //first the project files
      'test.config': `{
        "model":"./model/model.xml",
        "configs":"configurations",
        "projectFiles":"features",
        "buildFolder":"build",
        "exclude": [
          "**/folder_feature1",
          "**/*.md"
        ]
      }`,
      'test2.config': `{
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

    const p = new Project({ configPath: 'test.config' });
    p.build('config2');

    expect(fs.existsSync('./build')).to.be.true;
    expect(fs.existsSync(path.join('./build', 'README.md'))).to.be.not.true;
    expect(fs.existsSync(path.join('./build', 'folder_feature1'))).to.be.not.true;
    expect(fs.existsSync(path.join('./build', 'file_feature2.txt'))).to.be.true;


    const p2 = new Project({ configPath: 'test2.config' });
    p2.build('config2');

    expect(fs.existsSync('./build')).to.be.true;
    expect(fs.existsSync(path.join('./build', 'README.md'))).to.be.true;
    expect(fs.existsSync(path.join('./build', 'folder_feature1'))).to.be.not.true;
    expect(fs.existsSync(path.join('./build', 'file_feature2.txt'))).to.be.true;

    mock.restore()
  });

  it('Exclude the "folder_feature1" and "*.md"-files from the build process, by direct configuration', () => {
    mock({
      //first the project files
      'README.md': ``,
      '.gitignore': ``,
      'model': {
        //currently we won't use the model.xml, but we placed it here and the model.xml is empty also at the playground
        'model.xml': ``
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

    const p = new Project({
      configs: [
        { name: 'config2', features: ['Base', 'feature1', 'feature2'] },
        { name: 'config1', features: ['Base', 'feature1'] },
        { name: 'default', features: ['Base'] }
      ],
      projectFiles: "features",
      buildFolder: "build",
      exclude: [
        "**/folder_feature1",
        "**/*.md"
      ]
    });
    p.build('config2');

    expect(fs.existsSync('./build')).to.be.true;
    expect(fs.existsSync(path.join('./build', 'README.md'))).to.be.not.true;
    expect(fs.existsSync(path.join('./build', 'folder_feature1'))).to.be.not.true;
    expect(fs.existsSync(path.join('./build', 'file_feature2.txt'))).to.be.true;



    const p2 = new Project({
      configs: [
        { name: 'config2', features: ['Base', 'feature1', 'feature2'] },
        { name: 'config1', features: ['Base', 'feature1'] },
        { name: 'default', features: ['Base'] }
      ],
      projectFiles: "features",
      buildFolder: "build",
      exclude: "**/folder_feature1"
    });
    p2.build('config2');

    expect(fs.existsSync('./build')).to.be.true;
    expect(fs.existsSync(path.join('./build', 'README.md'))).to.be.true;
    expect(fs.existsSync(path.join('./build', 'folder_feature1'))).to.be.not.true;
    expect(fs.existsSync(path.join('./build', 'file_feature2.txt'))).to.be.true;

    mock.restore()
  });
});