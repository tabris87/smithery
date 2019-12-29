const fileUtils = require('./utils/file-utils');
const fs = require('fs');
const path = require('path');

class Project {
    constructor() {
        this._workingDir = process.cwd();
        this._model = null;
        this._configs = null;
        this._config = null;
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
        if (this._configs === null) {
            throw new Error('No configs given');
        }

        var oConfig = this._configs.filter(config => config.name === sConfigName);
        if (oConfig.length === 0) {
            throw new Error('Config for ' + sConfigName + ' does not exist withing configs');
        }

        this._config = oConfig[0];
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
    }
}

module.exports = Project;