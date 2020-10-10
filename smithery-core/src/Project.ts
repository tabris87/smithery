import { lstatSync, existsSync, readFileSync, readdirSync, mkdirSync, unlinkSync, rmdirSync } from 'fs';
import { join } from 'path';

import { RuleSet } from './RuleSet';
import { GeneratorFactory } from './Generator';
import { ParserFactory } from './Parser';
import { Imposer } from './Imposer';
import { IPlugin, IRule } from './Interfaces';
import { Node } from './utils/Node';

type configurationOptions = {
  configPath?: string;
  buildFolder?: string;
  projectFiles?: string;
  projectRules?: string;
  configs?: [];
  plugins?: [];
};

export class Project {
  private _workingDir: string
  private _configs: { name: string; features: string[] }[];
  private _config: null | { name: string; features: string[] };
  private _buildTarget: string;
  private _plugins: IPlugin[] | null;
  private _projectAST: Node;

  private _ruleSet: RuleSet = new RuleSet();
  private _parserFactory: ParserFactory = new ParserFactory();
  private _generatorFactory: GeneratorFactory = new GeneratorFactory();
  private _imposer: Imposer = new Imposer(this._parserFactory, this._generatorFactory, this._ruleSet);

  constructor(options?: configurationOptions) {
    this._workingDir = process.cwd();
    options = options || {};

    this._configs = [];
    this._config = null;

    let configPath:
      | string
      | {
        pathType: string;
        fullPath: string;
        exists: boolean;
      };
    const configPaths = [
      {
        type: 'custom',
        path: options.configPath,
      },
      {
        type: 'smithery',
        path: '.smithery',
      },
      {
        type: 'package',
        path: 'package.json',
      },
    ]
      .map((path) => {
        return {
          pathType: path.type,
          exists: path.path ? existsSync(join(this._workingDir, path.path)) : false,
          fullPath: path.path ? join(this._workingDir, path.path) : '',
        };
      })
      .filter((path) => path.exists);

    configPaths.sort((a, b) => {
      if (a.pathType === 'custom') {
        return -1;
      }

      if (a.pathType !== 'custom' && b.pathType === 'custom') {
        return 1;
      }

      if (a.pathType === 'smithery' && b.pathType === 'package') {
        return -1;
      }

      if (a.pathType === 'package' && b.pathType === 'smithery') {
        return 1;
      }

      return 0;
    });

    configPath = configPaths[0];
    configPath = configPath?.fullPath || '';

    let config;
    let sErrMess = '';

    const errorText = 'Failed to read configuration for project ' + `at "${this._workingDir}". Error: ${sErrMess}`;
    try {
      const configContent = readFileSync(configPath, { encoding: 'utf-8' });
      config = JSON.parse(configContent);
      if (configPath.endsWith('package.json') && config.featureCLI) {
        config = config.smithery;
      }
    } catch (err) {
      // if options object given configs, buildfolder and projectfile path
      // we can continue
      if (options.configs && options.buildFolder && options.projectFiles) {
        config = options;
      }
      if (err.code !== 'ENOENT') {
        throw new Error(errorText);
      } else {
        sErrMess = err.message;
      }
    }

    if (!config) {
      // tslint:disable-next-line: no-console
      console.log(errorText);
      process.exit(1);
    }

    /**
     * @todo:setup the model ->  add model for config validity checks and config building
     */
    // setup the configs
    if (config.configs && typeof config.configs === 'string' && existsSync(join(this._workingDir, config.configs))) {
      this._configs = this._getConfigFiles(join(this._workingDir, config.configs));
    } else {
      this._configs = options.configs || config.configs;
    }

    // setting up the src and destination for the build
    this._buildTarget = options.buildFolder || config.buildFolder;

    // take the plugins from the config reed or the options object
    this._plugins = options.plugins || config.plugins;
    if (this._plugins && this._plugins.length > 0) {
      this._plugins.forEach((oPlugin) => this._loadPlugin(oPlugin));
    }

    if (
      config.projectRules &&
      typeof config.projectRules === 'string' &&
      existsSync(join(this._workingDir, config.projectRules))
    ) {
      const aProjectRules = this._loadProjectRules(join(this._workingDir, config.projectRules));
      this._ruleSet.addMultipleRules(aProjectRules);
    }

    // take the project file path from the options or from the readed config;
    this._projectAST =
      this._parserFactory
        .getParser('DIR')
        ?.parse(join(this._workingDir, options.projectFiles || config.projectFiles)) || new Node();
  }

  public build(configName: string): void {
    if (configName) {
      this.setConfig(configName);
    }

    if (this._config === null) {
      const oDefault = this._configs.filter((config) => config.name === 'default');
      if (oDefault.length === 0) {
        throw new Error('No configuration given, therefore no build possible!');
      } else {
        // tslint:disable-next-line: no-console
        console.warn('No configuration set, switching to default');
        this._config = oDefault[0];
      }
    }

    // tslint:disable-next-line: no-console
    console.log('Build start for config "' + this._config.name + '"');
    // tslint:disable-next-line: no-console
    console.log('building...');
    let aFeatures = this._config.features;
    if (!aFeatures.includes('Base')) {
      throw new Error('No Base features set up, ');
    }

    // now we know the features contains base, therefore we can use it.
    // exclude base from the features to be applied.
    aFeatures = aFeatures.filter((sFeatureName) => sFeatureName !== 'Base');

    const baseFST: Node[] = this._projectAST?.children?.filter((oChild) => oChild.name === 'Base') || [];
    if (baseFST.length === 0) {
      throw new Error('Base feature is not at the source code, therefore we can not start');
    }

    let resultFST: Node | Node[] = baseFST[0];
    resultFST.name = 'root';
    resultFST.featureName = 'BASE';

    while (aFeatures.length > 0) {
      // Taking aFeatures like a queue
      const curFeature = aFeatures.shift() || '';
      // tslint:disable-next-line: no-console
      console.log(`Imposing feature: ${curFeature}`);
      const featuresArray = this._projectAST?.children?.filter((oChild) => oChild.name === curFeature) || [];
      if (featuresArray.length === 0) {
        throw new Error(`[${curFeature}] feature is not at the source code, stopped building`);
      }

      const featureFST: Node = featuresArray[0];
      featureFST.name = 'root';
      featureFST.featureName = curFeature.toUpperCase();
      /**
       * @todo -> hier eine Lösung schaffen!!!
       */
      resultFST = this._imposer.impose(
        resultFST,
        featureFST,
        this._parserFactory.getParser('DIR')?.getVisitorKeys() || {},
      );
    }

    // check if build target already exists and clear it
    this._clearBuildTarget(this._buildTarget);
    // create the build target newly
    mkdirSync(this._buildTarget);
    this._generatorFactory.getGenerator('DIR')?.generate(resultFST, {
      filePath: join(this._workingDir, this._buildTarget),
    });

    // tslint:disable-next-line: no-console
    console.log('Build done. -> Have fun.');
  }

  public setConfig(configName: string): void {
    if (this._configs === null) {
      throw new Error('No configs given');
    }

    const oConfig = this._configs.filter((config) => config.name === configName);
    if (oConfig.length === 0) {
      throw new Error('Config for ' + configName + ' does not exist withing configs');
    }

    this._config = oConfig[0];
  }

  private _getConfigFiles(dirPath: string) {
    if (existsSync(dirPath)) {
      return readdirSync(dirPath)
        .filter((fn) => fn.endsWith('.config'))
        .map((config) => {
          return {
            name: config.replace(dirPath + '/', '').replace('.config', ''),
            features: readFileSync(join(dirPath, config), { encoding: 'utf-8' })
              .split(/\r?\n/)
              .filter((sFeature) => {
                return sFeature !== '';
              }),
          };
        });
    } else {
      throw new Error('No config folder present, therefore no configs');
    }
  }

  private _loadPlugin(plugin: IPlugin) {
    // tslint:disable-next-line: no-console
    console.log('Try to load plugin: ' + plugin.name);
    let module: IPlugin | undefined = this._loadLocally(plugin.name);
    let globalStarter = false;
    if (!module && process.argv[1].indexOf('index.js') > -1) {
      globalStarter = true;
      module = this._loadGlobally(plugin.name);
    }

    if (module !== undefined) {
      if (module.parser.fileEnding && module.parser.parser) {
        if (plugin.config && plugin.config.parser) {
          Object.keys(plugin.config.parser).forEach((key) => {
            const setter = `set${this._capitalize(key)}`;
            if (module !== undefined && typeof module.parser.parser[setter] !== 'undefined') {
              if (plugin.config?.parser) {
                this._invokeFunktion(module.parser.parser, setter, plugin.config?.parser[key]);
              }
            } else {
              // Log.warn(`\nNo suitable setter for configuration ${sKey} found. Will be ignored!!`)
              // tslint:disable-next-line: no-console
              console.log(`\nNo suitable setter for configuration ${key} found. Will be ignored!!`);
            }
          });
        }

        if (Array.isArray(module.parser.fileEnding)) {
          module.parser.fileEnding.forEach((sEnding) => {
            if (module !== undefined) {
              this._parserFactory.addParser(module.parser.parser, sEnding);
            }
          });
        } else {
          this._parserFactory.addParser(module.parser.parser, module.parser.fileEnding);
        }
      }

      if (module.generator !== undefined) {
        if (module.generator.fileEnding !== undefined && module.generator.generator !== undefined) {
          if (plugin.config && plugin.config.generator) {
            Object.keys(plugin.config.generator).forEach((sKey) => {
              const setter = `set${this._capitalize(sKey)}`;
              if (typeof module?.generator.generator[setter] !== 'undefined') {
                if (plugin.config?.generator) {
                  this._invokeFunktion(module.generator.generator, setter, plugin.config.generator[sKey]);
                }
              } else {
                // Log.warn(`\nNo suitable setter for configuration ${sKey} found. Will be ignored!!`)
                // tslint:disable-next-line: no-console
                console.log(`\nNo suitable setter for configuration ${sKey} found. Will be ignored!!`);
              }
            });
          }
          if (Array.isArray(module.generator.fileEnding)) {
            module.generator.fileEnding.forEach((ending: string) => {
              if (module !== undefined) {
                this._generatorFactory.addGenerator(module.generator.generator, ending);
              }
            });
          } else {
            this._generatorFactory.addGenerator(module.generator.generator, module.generator.fileEnding);
          }
        }
      }

      if (module.rules) {
        if (!Array.isArray(module.rules)) {
          // Log.error(`The rules provided by the plugin ${sPluginName} are not as an array, therefore they can not be loaded`);
          // tslint:disable-next-line: no-console
          console.error(
            `The rules provided by the plugin ${plugin.name} are not as an array, therefore they can not be loaded`,
          );
        } else {
          this._ruleSet.addMultipleRules(module.rules);
        }
      }
    } else {
      if (globalStarter) {
        // Log.error('Plugin could not found locally and globally install the missing plugin and restart the process.');
        // tslint:disable-next-line: no-console
        console.log('Plugin could not found locally and globally install the missing plugin and restart the process.');
      } else {
        // Log.error('Plugin could not be found, install and the missing plugin and restart the process.');
        // tslint:disable-next-line: no-console
        console.log('Plugin could not be found, install and the missing plugin and restart the process.');
      }
      process.exit(1);
    }
  }

  private _loadProjectRules(rulePath: string): IRule[] {
    if (lstatSync(rulePath).isDirectory()) {
      const rules = readdirSync(rulePath);
      const loadedRules = rules
        .map((sRulePath) => {
          try {
            return require(join(rulePath, sRulePath));
          } catch (err) {
            return;
          }
        })
        .filter((oRule) => {
          return oRule;
        });
      return loadedRules;
    } else {
      try {
        return [require(rulePath)];
      } catch (err) {
        return [];
      }
    }
  }

  private _loadLocally(pluginPath: string): IPlugin | undefined {
    try {
      return require(join(process.cwd(), 'node_modules', pluginPath));
    } catch (err) {
      return;
    }
  }

  private _loadGlobally(pluginPath: string): IPlugin | undefined {
    try {
      return require(join(process.argv[1].replace('index.js', ''), '../../../', pluginPath));
    } catch (err) {
      return;
    }
  }

  private _capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _invokeFunktion(object: any, fktName: string, argumentMap: { [key: string]: any }) {
    if (Array.isArray(argumentMap)) {
      object[fktName](...argumentMap);
    } else {
      object[fktName](argumentMap);
    }
  }

  private _clearBuildTarget(buildPath: string): void {
    if (existsSync(buildPath)) {
      readdirSync(buildPath).forEach((file: string) => {
        const curPath = join(buildPath, file);
        if (lstatSync(curPath).isDirectory()) {
          this._clearBuildTarget(curPath);
        } else {
          unlinkSync(curPath);
        }
      });
      rmdirSync(buildPath);
    }
  }
}
