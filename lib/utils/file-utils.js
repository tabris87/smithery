const fs = require('fs');
const path = require('path');

function getConfigFiles(sDirPath) {
    if (fs.existsSync(sDirPath)) {
        return fs.readdirSync(sDirPath).filter(fn => fn.endsWith('.config')).map((config) => {
            return {
                name: config.replace(sDirPath + '/', '').replace('.config', ''),
                content: fs.readFileSync(path.join(sDirPath, config), 'UTF-8')
            }
        })
    } else {
        throw new Error('No config folder present, therefore no configs')
    }
}

module.exports = {
    getConfigFiles: getConfigFiles
}