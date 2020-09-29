declare type configurationOptions = {
    configPath?: string;
    buildFolder?: string;
    projectFiles?: string;
    projectRules?: string;
    configs?: [];
    plugins?: [];
};
export declare class Project {
    private _workingDir;
    private _configs;
    private _config;
    private _buildTarget;
    private _plugins;
    private _projectAST;
    private _ruleSet;
    private _parserFactory;
    private _generatorFactory;
    private _imposer;
    constructor(options?: configurationOptions);
    build(configName: string): void;
    setConfig(configName: {
        [key: string]: any;
    } | string): void;
    private _getConfigFiles;
    private _loadPlugin;
    private _loadProjectRules;
    private _loadLocally;
    private _loadGlobally;
    private _capitalize;
    private _invokeFunktion;
    private _clearBuildTarget;
}
export {};
