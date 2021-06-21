const DirectoryParser = require('./lib/parsers/DirectoryParser');


let d = new DirectoryParser.DirectoryParser();
const result = d.parse('.', {exclude: ["**/*.ts", "lib", "node_modules", "reports"]});

console.log(result.toString());