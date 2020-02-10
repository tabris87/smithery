const escodegen = require("escodegen");

function generate(oAST) {
    return escodegen.generate(oAST);
}

module.exports = {
    generate: generate
}