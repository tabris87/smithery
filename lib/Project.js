const fileUtils = require('./utils/file-utils');
const ParserCL = require('./Parser');
const GeneratorCL = require('./Generator');
const RuleSetCL = require('./RuleSet');
const fs = require('fs');
const path = require('path');

const ImposerCL = require('./Imposer');

class Project {
    constructor() {
        this._workingDir = process.cwd();

        this._model = null;
        this._configs = null;
        this._config = null;

        var config = fs.readFileSync(path.join(this._workingDir, '.featureJS'));
        config = JSON.parse(config);

        if (!config) {
            throw new Error("No config file found within current path, use 'fjs init before'!!");
        }

        //setup the model
        if (fs.existsSync(path.join(this._workingDir, config.model))) {
            this._model = fs.readFileSync(path.join(this._workingDir, config.model), 'UTF-8');
        }

        //setup the configs
        if (fs.existsSync(path.join(this._workingDir, config.configs))) {
            this._configs = fileUtils.getConfigFiles(path.join(this._workingDir, config.configs));
        }

        //setting up the src and destination for the build
        this._buildTarget = config.buildFolder;

        //setting up the needed classes
        this._parser = new ParserCL();
        this._generator = new GeneratorCL();
        this._ruleSet = new RuleSetCL();

        this._imposer = new ImposerCL({
            parser: this._parser,
            generator: this._generator,
            rules: this._ruleSet
        });

        this._plugins = config.plugins;
        if (this._plugins && this._plugins.length > 0) {
            this._plugins.forEach(this._loadPlugin.bind(this));
        }

        this._projectAST = this._parser.parse(path.join(this._workingDir, config.projectFiles), 'DIR');
    }

    _loadPlugin(sPluginName) {
        console.log('Try to load plugin: ' + sPluginName);
        console.log(path.join(process.argv[1].replace('index.js'), '../../../', sPluginName));
        var bExists = fs.existsSync(path.join(process.argv[1].replace('index.js'), '../../../', sPluginName));
        console.log('Exists: ' + bExists);
        if (bExists) {
            const oModule = require(path.join(process.argv[1].replace('index.js'), '../../../', sPluginName));
            if (oModule.parser) {
                if (oModule.parser.fileEnding && oModule.parser.parser) {
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
                    console.error('The rules provided by the plugin ' + sPluginName + 'are not as an array, therefore they can not be loaded');
                } else {
                    this._ruleSet.addMultipleRules(oModule.rules);
                }
            }

            //TODO: check dependencies??
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
        if (this._model === null) {
            throw new Error('Model not given, therefore no valid build possible!');
        }

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
        var aFeatures = this._config.content.split(/\r?\n/);
        if (!aFeatures.includes('base')) {
            throw new Error('No base features set up, ')
        }

        //now we know the features contains base, therefore we can use it.
        //exclude base from the features to be applied.
        aFeatures = aFeatures.filter(sFeatureName => sFeatureName !== "base");

        var baseFST = this._projectAST.children.filter(oChild => oChild.name === "base");
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
                throw new Error(sCurFeature + ' feature is not at the source code, stopped building');
            }

            featureFST = featureFST[0];
            featureFST.name = "root";
            featureFST.featureName = sCurFeature.toUpperCase();
            resultFST = this._imposer.impose(resultFST, featureFST, this._parser.getVisitorKeys('DIR'));
        }

        //check if build target already exists and clear it
        this._clearBuildTarget();
        //create the build target newly
        fs.mkdirSync(this._buildTarget);
        this._generator.generate(resultFST, 'DIR', {
            filePath: path.join(this._workingDir, this._buildTarget)
        });
    }

    _clearBuildTarget() {
        if (fs.existsSync(this._buildTarget)) {
            fs.readdirSync(this._buildTarget).forEach(function (file, index) {
                var curPath = path.join(this._buildTarget, file);
                if (fs.lstatSync(curPath).isDirectory()) {
                    this._clearBuildTarget(curPath);
                } else {
                    fs.unlinkSync(curPath);
                }
            }.bind(this));
            fs.rmdirSync(this._buildTarget);
        }
    }
}

module.exports = Project;