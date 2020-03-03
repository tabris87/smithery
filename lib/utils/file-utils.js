const fs = require('fs');
const path = require('path');

function getConfigFiles(sDirPath) {
    if (fs.existsSync(sDirPath)) {
        return fs.readdirSync(sDirPath).filter(fn => fn.endsWith('.config')).map((config) => {
            return {
                name: config.replace(sDirPath + '/', '').replace('.config', ''),
                features: fs.readFileSync(path.join(sDirPath, config), 'UTF-8').split(/\r?\n/).filter((sFeature) => {
                    return sFeature !== "";
                })
            }
        })
    } else {
        throw new Error('No config folder present, therefore no configs')
    }
}

function checkForFile(sString) {
    const curDir = process.cwd();
    const stat = fs.lstatSync(path.resolve(curDir, sString));
    var sResturnString = "";
    if (stat.isFile()) {
        sResturnString = fs.readFileSync(path.resolve(curDir, sString));
    }
    return sResturnString;
}

module.exports = {
    getConfigFiles: getConfigFiles,
    checkForFile: checkForFile
}