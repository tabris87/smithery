const escodegen = require("escodegen");

function generate(oOptions) {
    return escodegen.generate(oOptions.codeAst);
}

module.exports = {
    generate: generate
}