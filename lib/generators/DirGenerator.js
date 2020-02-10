"use strict";
const fs = require('fs');
const path = require('path');


function generate(oFST, oOptions) {
    var route = oOptions.filePath;

    var aItemsToProcess = oFST.children;
    if (aItemsToProcess) {
        _processFiles(aItemsToProcess, route);
    }
}

function _processFiles(aFilesToProcess, sTargetPath) {
    for (var oItem of aFilesToProcess) {
        if (oItem.type === "Folder") {
            fs.mkdirSync(path.join(sTargetPath, oItem.name));
            _processFiles(oItem.children, path.join(sTargetPath, oItem.name));
        } else {
            fs.writeFileSync(path.join(sTargetPath, oItem.name), oItem.content);
        }
    }
}

module.exports = {
    generate: generate
}