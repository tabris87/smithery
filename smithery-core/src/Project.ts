import { lstatSync, existsSync, readFileSync, readdirSync, mkdirSync, unlinkSync, rmdirSync } from 'fs';
import { join } from 'path';
import * as pm from 'picomatch';

import { RuleSet } from './RuleSet';
import { GeneratorFactory } from './Generator';
import { ParserFactory } from './Parser';
import { Imposer } from './Imposer';
import { IPlugin, IRule } from './Interfaces';
import { Node } from './utils/Node';
import { Rule } from './Rule';

import { FileType } from './enums';

type configurationOptions = {
  configPath?: string;
  buildFolder?: string;
  projectFiles?: string;
  projectRules?: string;
  configs?: { name: string, features: string[] }[];
  plugins?: [];
  exclude?: string | string[];
};

type internalConfig = {
  configs: string | { name: string, features: string[] }[], //musthave
  buildFolder: string, //musthave
  projectFiles: string, //musthave
  plugins: IPlugin | IPlugin[],
  projectRules: string | Rule[],
  exclude: string[]
};

export class Project {
  private _workingDir: string
  private _configs: { name: string; features: string[] }[];
  private _config: null | { name: string; features: string[] } = null;
  private _buildTarget: string;
  private _plugins: IPlugin[] | null;
  private _projectAST: Node | undefined;

  private _ruleSet: RuleSet = new RuleSet();
  private _parserFactory: ParserFactory = new ParserFactory();
  private _generatorFactory: GeneratorFactory = new GeneratorFactory();
  private _imposer: Imposer = new Imposer(this._parserFactory, this._generatorFactory, this._ruleSet);

  private _configurationOptions: internalConfig;

  private checkCustomConfiguration(path: string | undefined): { content?: { [key: string]: any }, exists: boolean } {
    if (path && path !== '') {
      if (existsSync(join(this._workingDir, path))) {
        const cont = JSON.parse(readFileSync(join(this._workingDir, path), 'utf-8'));
        return { content: cont, exists: true };
      } else {
        throw new Error(`The configuration "${path}" is not within the project folder!!`);
      }
    } else {
      return { exists: false };
    }
  }

  private checkSmitheryConfig(): { content?: { [key: string]: any }, exists: boolean } {
    if (existsSync(join(this._workingDir, 'smithery.json'))) {
      const cont = JSON.parse(readFileSync(join(this._workingDir, 'smithery.json'), 'utf-8'));
      return { content: cont, exists: true };
    } else {
      return { exists: false };
    }
  }

  constructor(options?: configurationOptions) {
    this._workingDir = process.cwd();
    options = options || {};

    // we should have 3 options for configurations 
    // 1. the .smithery config file written in json
    // 2. a custom config file written in json
    // 3. configuration options directly given by the configuration options object

    // They are priorized bottom to top to allow overwriting

    const smithConfig = this.checkSmitheryConfig();
    const custConfig = this.checkCustomConfiguration(options.configPath);
    const directConfig = {
      content: {
        configs: options?.configs,
        buildFolder: options?.buildFolder,
        projectFiles: options?.projectFiles,
        plugins: options?.plugins,
        projectRules: options?.projectRules,
        exclude: options?.exclude
      },
      exists: options?.configs ||
        options?.buildFolder ||
        options?.projectFiles ||
        options?.projectFiles ||
        options?.plugins ||
        options?.projectRules ||
        options?.exclude
    }

    const errorTextSetup = `Failed to setup configuration for project at "${this._workingDir}".`;
    const errorTextInvalidConfiguration = `The used configuration for project "${this._workingDir}" is inclomplete.`;

    if (!smithConfig.exists && !custConfig.exists && !directConfig.exists) {
      throw new Error(errorTextSetup);
    }

    const config: internalConfig = {
      configs: '', //musthave
      buildFolder: '', //musthave
      projectFiles: '', //musthave
      plugins: [],
      projectRules: [],
      exclude: []
    }

    if (smithConfig.exists) {
      config.configs = smithConfig.content?.configs ?? '';
      config.buildFolder = smithConfig.content?.buildFolder ?? '';
      config.projectFiles = smithConfig.content?.projectFiles ?? '';
      config.plugins = smithConfig.content?.plugins ?? [];
      config.projectRules = smithConfig.content?.projectRules ?? [];
      if (smithConfig.content?.exclude) {
        if (Array.isArray(smithConfig.content.exclude)) {
          config.exclude = smithConfig.content.exclude;
        } else {
          config.exclude = [smithConfig.content.exclude];
        }
      } else {
        config.exclude = [];
      }
    }

    if (custConfig.exists) {
      config.configs = custConfig.content?.configs || config.configs;
      config.buildFolder = custConfig.content?.buildFolder || config.buildFolder;
      config.projectFiles = custConfig.content?.projectFiles || config.projectFiles;
      config.plugins = custConfig.content?.plugins || config.plugins;
      config.projectRules = custConfig.content?.projectRules || config.projectRules;
      if (custConfig.content?.exclude) {
        if (Array.isArray(custConfig.content.exclude)) {
          config.exclude = custConfig.content.exclude;
        } else {
          config.exclude = [custConfig.content.exclude];
        }
      } else {
        config.exclude = [];
      }
    }

    if (directConfig.exists) {
      config.configs = directConfig.content?.configs || config.configs;
      config.buildFolder = directConfig.content?.buildFolder || config.buildFolder;
      config.projectFiles = directConfig.content?.projectFiles || config.projectFiles;
      config.plugins = directConfig.content?.plugins || config.plugins;
      config.projectRules = directConfig.content?.projectRules || config.projectRules;
      if (directConfig.content?.exclude) {
        if (Array.isArray(directConfig.content.exclude)) {
          config.exclude = directConfig.content.exclude;
        } else {
          config.exclude = [directConfig.content.exclude];
        }
      } else {
        config.exclude = [];
      }
    }

    if (typeof config.configs === 'undefined' || typeof config.buildFolder === 'undefined' || typeof config.projectFiles === 'undefined' || config.configs === '' || config.buildFolder === '' || config.projectFiles === '') {
      throw new Error(errorTextInvalidConfiguration);
    }

    // setup the configs
    if (typeof config.configs === 'string' && existsSync(join(this._workingDir, config.configs))) {
      this._configs = this._getConfigFiles(join(this._workingDir, config.configs));
    } else if (typeof config.configs !== 'string') {
      this._configs = config.configs;
    } else {
      throw new Error('The build-configurations setup is not given properly')
    }

    // setting up the src and destination for the build
    this._buildTarget = config.buildFolder;

    // take the plugins from the config read or the options object
    if (config.plugins && Array.isArray(config.plugins)) {
      this._plugins = config.plugins;
    } else if (config.plugins) {
      this._plugins = [config.plugins];
    } else {
      this._plugins = [];
    }

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

    this._configurationOptions = config;
  }

  public build(configName?: string): void {
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
      throw new Error('No Base feature set up! Build not possible!');
    }

    // now we know the features contains base, therefore we can use it.
    // exclude base from the features to be applied.
    let aBuildFeatures = aFeatures.filter((sFeatureName) => sFeatureName !== 'Base');

    //have to place it here, to always have a fresh copy of the filesystem
    //maybe we need a more performant solution
    this._projectAST =
      this._parserFactory
        .getParser(FileType.Folder)
        ?.parse(join(this._workingDir, this._configurationOptions.projectFiles), {
          exclude: this._configurationOptions.exclude
        }) || new Node();

    const baseFST: Node[] = this._projectAST.children?.filter((oChild) => oChild.name === 'Base') || [];
    if (baseFST.length === 0) {
      throw new Error('Base feature is not at the source code, therefore we can not start');
    }

    let resultFST: Node | Node[] = baseFST[0].clone();
    resultFST.name = 'root';
    resultFST.featureName = 'BASE';

    while (aBuildFeatures.length > 0) {
      // Taking aFeatures like a queue
      const curFeature = aBuildFeatures.shift() || '';
      // tslint:disable-next-line: no-console
      console.log(`Imposing feature: ${curFeature}`);
      const featuresArray = this._projectAST.children?.filter((oChild) => oChild.name === curFeature) || [];
      if (featuresArray.length === 0) {
        throw new Error(`[${curFeature}] feature is not at the source code, stopped building`);
      }

      const featureFST: Node = featuresArray[0];
      featureFST.name = 'root';
      featureFST.featureName = curFeature.toUpperCase();
      resultFST = this._imposer.impose(
        resultFST,
        featureFST,
        this._parserFactory.getParser(FileType.Folder)?.getVisitorKeys() || {},
      );
    }

    // check if build target already exists and clear it
    const buildRemains: boolean = this._clearBuildTarget(join(this._workingDir, this._buildTarget));
    // create the build target newly
    if (!buildRemains) { mkdirSync(join(this._workingDir, this._buildTarget)); }
    this._generatorFactory.getGenerator(FileType.Folder)?.generate(resultFST, {
      filePath: join(this._workingDir, this._buildTarget),
    });

    // tslint:disable-next-line: no-console
    console.log('Build done. -> Have fun.');
  }

  public setConfig(configName: string): void {
    if (this._configs === null || (Array.isArray(this._configs) && this._configs.length === 0)) {
      throw new Error('No configs given');
    }

    const oConfig = this._configs.filter((config) => config.name === configName);
    if (oConfig.length === 0) {
      throw new Error('Config for ' + configName + ' does not exist withing ' + (typeof this._configurationOptions.configs === 'string' ? this._configurationOptions.configs : 'configurations'));
    }

    this._config = oConfig[0];
  }

  public getProjectRoot(): string {
    return this._configurationOptions.projectFiles;
  }

  private _getConfigFiles(dirPath: string) {
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

  private _clearBuildTarget(buildPath: string): boolean {
    const matcher = this._configurationOptions?.exclude ? pm(this._configurationOptions.exclude) : undefined;
    //Firstly check if the buildPath is available
    if (!existsSync(buildPath)) {
      return false;
    }

    if (
      //matcher is not defined
      typeof matcher === 'undefined' ||
      //matcher is defined, the buildpath exists and but the path is not excluded from build
      //therefore the files have to been kept, because the developer copied them
      typeof matcher !== 'undefined' && !matcher(buildPath)
    ) {
      const removalResult: boolean = readdirSync(buildPath).map((file: string) => {
        const curPath = join(buildPath, file);
        if (lstatSync(curPath).isDirectory()) {
          return this._clearBuildTarget(curPath);
        } else {
          //if there is no matcher defined we can remove the file directly otherwise the path don't have to fit to the exclude pattern
          if (typeof matcher === 'undefined' || matcher && !matcher(curPath)) {
            unlinkSync(curPath);
            return false;
          } else {
            return true;
          }
        }
      }).some((result: boolean) => result);

      //we can remove the directory if it does not contain any unremovable content
      if (!removalResult) {
        rmdirSync(buildPath);
      }
      return removalResult;
    } else {
      // we can return because the matchers is present and says the build path should be ignored
      return true;
    }
  }
}
