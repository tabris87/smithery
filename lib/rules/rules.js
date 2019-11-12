const fs = require('fs');
const constants = require('./utils/constants');

function getRules() {
    var aRules = fs.readdirSync("./lib/rules/");
    var modulePath = __dirname;
    var aRuleList = aRules
        .filter(file => !fs.lstatSync(modulePath + '/' + file).isDirectory() && file !== "rule.js")
        .map((rule) => {
            return {
                id: rule.replace('.js', ''),
                rule: require(modulePath + '/' + rule.replace('.js', ''))
            }
        });
    return aRuleList;
}

function getFunctionRules() {
    var aRules = getRules();
    return aRules.filter(rule => rule.rule.type === constants.types.FUNCTION);
}

module.exports = {
    getRules: getRules,
    getFunctionRules: getFunctionRules
}