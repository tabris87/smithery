const espree = require("espree");

function createAst(sCodeString, iECMAVersion) {
    try {
        return espree.parse(sCodeString, {
            range: false,
            loc: false,
            comment: true,
            tokens: false,
            ecmaVersion: iECMAVersion
        })
    } catch (error) {
        console.log(error);
    }
}

function setupECMAVersion(sGiven) {
    switch (sGiven) {
        case "2015":
            return 6;
        case "2016":
            return 7;
        case "2017":
            return 8;
        case "2018":
            return 9
        case "2019":
            return 10
        case "":
        case undefined:
            return 5;
        default:
            return parseInt(sGiven, 10);
    }
}

function parse(sCodeString, oOptions) {
    var ecmaVer = oOptions.version;
    return createAst(sCodeString, setupECMAVersion(ecmaVer));
}

module.exports = {
    parse: parse
}