module.exports = {
    rules: [], //array of rules where ever they are comming from 
    parser: {
        fileEnding: [] || "",
        parserCL: {}
    }, //parser object needed for the plugin to work, needs to be conform with the already given parser
    generator: {
        fileEnding: [] || "",
        generatorCL: {}
    }, //generator object, needed for the plugin to work, needs to be conform with the already given parser
    dependencies: [{
        pluginName: "", //npm plugin name
        version: "" //npm version system 
    }] //array of other plugins, expected to be installed to work properly
}