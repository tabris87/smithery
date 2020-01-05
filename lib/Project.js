const fileUtils = require('./utils/file-utils');
const DirParser = require('./parser/DirectoryParser');
const DirGenerator = require('./generator/DirGenerator');
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

        this._buildTarget = config.buildFolder;

        this._projectAST = DirParser.parse({
            filePath: path.join(this._workingDir, config.projectFiles)
        });
        /* 
        var aModelFiles = fileUtils.getModelFiles(this._workingDir);
        if (aModelFiles.length === 0) {
            throw new Error('No model files present. Can not distinguish correct feature apply');
        }
        
        var aConfigFiles = fileUtils.getConfigFiles(this._workingDir);
        if (aConfigFiles.length === 0) {
            throw new Error('No configs present. Can not find a default build config!');
        } 
        */
    }

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

    build() {
        if (this._model === null) {
            throw new Error('Model not given, therefore no valid build possible!');
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
        var oImposer = new ImposerCL();

        while (aFeatures.length > 0) {
            //Taking aFeatures like a queue
            var sCurFeature = aFeatures.shift();
            console.log("Imposing feature: " + sCurFeature);
            var featureFST = this._projectAST.children.filter(oChild => oChild.name === sCurFeature);
            if (featureFST.length === 0) {
                throw new Error(sCurFeature + ' feature is not at the source code, stopped building');
            }

            featureFST = featureFST[0];
            debugger;
            resultFST = oImposer.impose(resultFST, featureFST);
            debugger;
        }

        //check if build target already exists and clear it
        this._clearBuildTarget();
        //create the build target newly
        fs.mkdirSync(this._buildTarget);
        DirGenerator.generate({
            fst: resultFST,
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