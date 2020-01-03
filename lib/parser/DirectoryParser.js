"use strict";
const fs = require('fs');
const path = require('path');


function parse(oOptions) {
    var route = oOptions.filePath;
    var stats = fs.lstatSync(route),
        oToken = {
            loc: route,
            name: path.basename(route)
        };

    if (stats.isDirectory()) {
        oToken.type = 'Folder';
        oToken.children = fs.readdirSync(route).map(function (child) {
            return parse({
                filePath: path.join(route, child)
            });
        });
    } else {
        oToken.type = 'File';
        oToken.ending = path.extname(route).replace('.', '').toUpperCase();
        oToken.content = fs.readFileSync(route, 'UTF-8');
    }
    return oToken;
}

module.exports = {
    parse: parse
}