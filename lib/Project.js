const fileUtils = require('./utils/file-utils');
const ParserCL = require('./Parser');
const GeneratorCL = require('./Generator');
const RuleSetCL = require('./RuleSet');
const ImposerCL = require('./Imposer');

const fs = require('fs');
const path = require('path');

/**
 * @class Project
 * complete project collection.
 * Uses the informations given by configuration options to load plugins, parser, generator rules etc.
 */
class Project {
    /**
     * Contructor with optional options parameter
     * @param {map} [mOptions] the options map
     * @param {string} [mOptions.configPath] a custom path 
     * @param {string} [mOptions.buildFolder] the path to the build folder relative to the current working directory
     * @param {string} [mOptions.projectFiles] the path to the source files of the project
     * @param {string} [mOptions.projectRules] the path to custom rules used by the project
     * @param {array} [mOptions.configs] the possible configurations to use
     * @param {array} [mOptions.plugins] possible plugins to use
     */
    constructor(mOptions) {
        this._workingDir = process.cwd();
        mOptions = mOptions || {}; //just to prevent missing config options access

        /* this._model = null; */
        this._configs = null;
        this._config = null;

        var configPath = undefined;
        var aConfigPaths = [{
            type: "custom",
            path: mOptions.configPath
        },
        {
            type: "smithery",
            path: '.smithery'
        },
        {
            type: "package",
            path: 'package.json'
        }].map(function (oPath) {
            return {
                pathType: oPath.type,
                exists: oPath.path ? fs.existsSync(path.join(this._workingDir, oPath.path)) : false,
                fullPath: oPath.path ? path.join(this._workingDir, oPath.path) : ""
            }
        }.bind(this)).filter(function (oPath) {
            return oPath.exists;
        });

        aConfigPaths.sort(function (a, b) {
            if (a.pathType === "custom") {
                return -1;
            }

            if (a.pathType !== "custom" && b.pathType === "custom") {
                return 1;
            }

            if (a.pathType === "smithery" && b.pathType === "package") {
                return -1
            }

            if (a.pathType === "package" && b.pathType === "smithery") {
                return 1;
            }

            return 0;
        });

        configPath = aConfigPaths[0];
        configPath = configPath ? configPath.fullPath || "" : "";

        var config;
        var sErrMess = "";
        try {
            config = fs.readFileSync(configPath);
            config = JSON.parse(config);
            if (configPath.endsWith('package.json') && config.featureCLI) {
                config = config.smithery;
            }
        } catch (err) {
            //if options object given provide configs, buildfolder and projectfile path 
            //we can continue
            if (mOptions.configs && mOptions.buildFolder && mOptions.projectFiles) {
                config = mOptions;
            }
            if (err.code !== "ENOENT") { // Something else than "File or directory does not exist"
                throw new Error(errorText);
            } else {
                sErrMess = err.message;
            }
        }

        if (!config) {
            const errorText = "Failed to read configuration for project " +
                `at "${this._workingDir}". Error: ${sErrMess}`;

            //Log.error(errorText)
            console.log(errorText);
            process.exit(1);
        }

        //setup the model -> //TODO: add model for config validity checks and config building

        //setup the configs
        if (config.configs && typeof config.configs === "string" && fs.existsSync(path.join(this._workingDir, config.configs))) {
            this._configs = fileUtils.getConfigFiles(path.join(this._workingDir, config.configs));
        } else {
            this._configs = mOptions.configs || config.configs;
        }

        //setting up the src and destination for the build
        this._buildTarget = mOptions.buildFolder || config.buildFolder;

        //setting up the needed classes
        this._parser = new ParserCL();
        this._generator = new GeneratorCL();
        this._ruleSet = new RuleSetCL();

        this._imposer = new ImposerCL({
            parser: this._parser,
            generator: this._generator,
            rules: this._ruleSet
        });

        //take the plugins from the config reed or the options object
        this._plugins = mOptions.plugins || config.plugins;
        if (this._plugins && this._plugins.length > 0) {
            this._plugins.forEach(oPlugin => this._loadPlugin(oPlugin));
        }

        if (config.projectRules && typeof config.projectRules === "string" && fs.existsSync(path.join(this._workingDir, config.projectRules))) {
            var aProjectRules = this._loadProjectRules(path.join(this._workingDir, config.projectRules));
            this._ruleSet.addMultipleRules(aProjectRules);
        }

        //take the project file path from the options or from the readed config;
        this._projectAST = this._parser.parse(path.join(this._workingDir, mOptions.projectFiles || config.projectFiles), 'DIR');
    }

    _loadProjectRules(sPath) {
        if (fs.statSync(sPath).isDirectory()) {
            var aRules = fs.readdirSync(sPath);
            aRules = aRules.map(function (sRulePath) {
                try {
                    return require(path.join(sPath, sRulePath));
                } catch (err) {
                    return;
                }
            }).filter((oRule) => {
                return oRule
            });
            return aRules;
        } else {
            try {
                return [require(sPath)];
            } catch (err) {
                return [];
            }
        }
    }

    _capitalize(sString) {
        return sString.charAt(0).toUpperCase() + sString.slice(1);
    }

    _invokeFunktion(oObject, sFunctionName, oArguments) {
        if (Array.isArray(oArguments)) {
            oObject[sFunctionName](...oArguments);
        } else {
            oObject[sFunctionName](oArguments);
        }
    }

    _loadPlugin(oPlugin) {
        console.log('Try to load plugin: ' + oPlugin.name);
        var oModule = this._loadLocally(path.join(process.cwd(), 'node_modules', oPlugin.name));
        var bGlobalStarter = false;
        if (!oModule && process.argv[1].indexOf('index.js') > -1) {
            bGlobalStarter = true;
            oModule = this._loadGlobally(path.join(process.argv[1].replace('index.js'), '../../../', oPlugin.name));
        }

        if (oModule) {
            if (oModule.parser) {
                if (oModule.parser.fileEnding && oModule.parser.parser) {
                    if (oPlugin.config && oPlugin.config.parser) {
                        Object.keys(oPlugin.config.parser).forEach(sKey => {
                            let sSetter = `set${this._capitalize(sKey)}`;
                            if (typeof oModule.parser.parser[sSetter] !== "undefined") {
                                this._invokeFunktion(oModule.parser.parser, sSetter, oPlugin.config.parser[sKey]);
                            } else {
                                //Log.warn(`\nNo suitable setter for configuration ${sKey} found. Will be ignored!!`)
                                console.log(`\nNo suitable setter for configuration ${sKey} found. Will be ignored!!`);
                            }
                        })
                    }

                    if (Array.isArray(oModule.parser.fileEnding)) {
                        oModule.parser.fileEnding.forEach(function (sEnding) {
                            this._parser.addParser(oModule.parser.parser, sEnding);
                        }.bind(this));
                    } else {
                        this._parser.addParser(oModule.parser.parser, oModule.parser.fileEnding)
                    }
                }
            }

            if (oModule.generator) {
                if (oModule.generator.fileEnding && oModule.generator.generator) {
                    if (oPlugin.config && oPlugin.config.generator) {
                        Object.keys(oPlugin.config.generator).forEach(sKey => {
                            let sSetter = `set${this._capitalize(sKey)}`;
                            if (typeof oModule.generator.generator[sSetter] !== "undefined") {
                                this._invokeFunktion(oModule.generator.generator, sSetter, oPlugin.config.generator[sKey]);
                            } else {
                                //Log.warn(`\nNo suitable setter for configuration ${sKey} found. Will be ignored!!`)
                                console.log(`\nNo suitable setter for configuration ${sKey} found. Will be ignored!!`);
                            }
                        })
                    }
                    if (Array.isArray(oModule.generator.fileEnding)) {
                        oModule.generator.fileEnding.forEach(function (sEnding) {
                            this._generator.addGenerator(oModule.generator.generator, sEnding);
                        }.bind(this));
                    } else {
                        this._generator.addGenerator(oModule.generator.generator, oModule.generator.fileEnding)
                    }
                }
            }

            if (oModule.rules) {
                if (!Array.isArray(oModule.rules)) {
                    //Log.error(`The rules provided by the plugin ${sPluginName} are not as an array, therefore they can not be loaded`);
                    console.error('The rules provided by the plugin ' + sPluginName + 'are not as an array, therefore they can not be loaded');
                } else {
                    this._ruleSet.addMultipleRules(oModule.rules);
                }
            }
        } else {
            if (bGlobalStarter) {
                //Log.error('Plugin could not found locally and globally install the missing plugin and restart the process.');
                console.log('Plugin could not found locally and globally install the missing plugin and restart the process.');
            } else {
                //Log.error('Plugin could not be found, install and the missing plugin and restart the process.');
                console.log('Plugin could not be found, install and the missing plugin and restart the process.');
            }
            process.exit(1);
        }
    }

    _loadLocally(sPluginName) {
        try {
            return require(sPluginName);
        } catch (err) {
            return;
        }
    }

    _loadGlobally(sGlobalPluginPath) {
        try {
            return require(sGlobalPluginPath);
        } catch (err) {
            return;
        }
    }

    //maybe i need this setter at some point
    setModelPath(sModelPath) {
        if (fs.existsSync(path.join(this._workingDir, sModelPath))) {
            this._model = fs.readFileSync(path.join(this._workingDir, sModelPath), 'UTF-8');
        } else {
            throw new Error('ModelPath does not exist!');
        }

    }

    setConfigsPath(sConfigsPath) {
        if (fs.existsSync(path.join(this._workingDir, sConfigsPath))) {
            this._configs = fileUtils.getConfigFiles(path.join(this._workingDir, sConfigsPath));
            if (this._configs.length === 0) {
                throw new Error('No configs given within the path');
            }
        } else {
            throw new Error('Configs path does not exist!');
        }
    }

    setConfig(sConfigName) {
        if (typeof sConfigName === "object") {
            if (typeof sConfigName.config !== "undefined") {
                this._config = sConfigName.config;
            } else {
                if (this._configs === null) {
                    throw new Error('No configs given');
                }

                var oConfig = this._configs.filter(config => config.name === sConfigName.name);
                if (oConfig.length === 0) {
                    throw new Error('Config for ' + sConfigName.name + ' does not exist withing configs');
                }

                this._config = oConfig[0];
            }
        } else {
            if (this._configs === null) {
                throw new Error('No configs given');
            }

            var oConfig = this._configs.filter(config => config.name === sConfigName);
            if (oConfig.length === 0) {
                throw new Error('Config for ' + sConfigName + ' does not exist withing configs');
            }

            this._config = oConfig[0];
        }
    }

    build(sConfigName) {
        /* 
                if (this._model === null) {
                    throw new Error('Model not given, therefore no valid build possible!');
                } */

        if (sConfigName) {
            this.setConfig(sConfigName);
        }

        if (this._config === null) {
            var oDefault = this._configs.filter(config => config.name === 'default');
            if (oDefault.length === 0) {
                throw new Error('No configuration given, therefore no build possible!');
            } else {
                console.warn('No configuration set, switching to default');
                this._config = oDefault[0];
            }
        }

        console.log('Build start for config "' + this._config.name + '"');
        console.log('building...');
        var aFeatures = this._config.features;
        if (!aFeatures.includes('Base')) {
            throw new Error('No Base features set up, ')
        }

        //now we know the features contains base, therefore we can use it.
        //exclude base from the features to be applied.
        aFeatures = aFeatures.filter(sFeatureName => sFeatureName !== "Base");

        var baseFST = this._projectAST.children.filter(oChild => oChild.name === "Base");
        if (baseFST.length === 0) {
            throw new Error('Base feature is not at the source code, therefore we can not start');
        }

        var resultFST = baseFST[0];
        resultFST.name = "root";
        resultFST.featureName = "BASE";

        while (aFeatures.length > 0) {
            //Taking aFeatures like a queue
            var sCurFeature = aFeatures.shift();
            console.log("Imposing feature: " + sCurFeature);
            var featureFST = this._projectAST.children.filter(oChild => oChild.name === sCurFeature);
            if (featureFST.length === 0) {
                throw new Error(`[${sCurFeature}] feature is not at the source code, stopped building`);
            }

            featureFST = featureFST[0];
            featureFST.name = "root";
            featureFST.featureName = sCurFeature.toUpperCase();
            resultFST = this._imposer.impose(resultFST, featureFST, this._parser.getVisitorKeys('DIR'));
        }

        //check if build target already exists and clear it
        this._clearBuildTarget(this._buildTarget);
        //create the build target newly
        fs.mkdirSync(this._buildTarget);
        this._generator.generate(resultFST, 'DIR', {
            filePath: path.join(this._workingDir, this._buildTarget)
        });
        console.log('Build done. -> Have fun.')
    }

    _clearBuildTarget(sPath) {
        if (fs.existsSync(sPath)) {
            fs.readdirSync(sPath).forEach(function (file) {
                var curPath = path.join(sPath, file);
                if (fs.lstatSync(curPath).isDirectory()) {
                    this._clearBuildTarget(curPath);
                } else {
                    fs.unlinkSync(curPath);
                }
            }.bind(this));
            fs.rmdirSync(sPath);
        }
    }
}

module.exports = Project;