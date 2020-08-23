'use strict';
const fs = require('fs');
const path = require('path');
const {
    Node
} = require('smithery-equipment').types;

function parse(sFilePath, oOptions) {
    var route = sFilePath;
    var stats = fs.lstatSync(route),
        oToken = new Node();

    oToken.name = path.basename(route);
    oToken.sourcePath = route;

    if (stats.isDirectory()) {
        oToken.type = 'Folder';
    } else {
        oToken.type = 'File';
    }

    if (oOptions && oOptions.parent) {
        oToken.path = oOptions.parent.path !== '' ? oOptions.parent.path + '.' + oToken.type : oToken.type;
        oToken.parent = oOptions.parent;
    } else {
        oToken.path = '';
        oToken.parent = undefined;
        oOptions = {};
    }

    if (stats.isDirectory()) {
        oToken.children = fs.readdirSync(route).map(function (child) {
            oOptions.parent = oToken;
            return parse(path.join(route, child), oOptions);
        });
    } else {
        oToken.ending = path.extname(route).replace('.', '').toUpperCase();
        oToken.content = fs.readFileSync(route, 'UTF-8');
    }

    return oToken;
}

module.exports = {
    parse: parse,
    visitorKeys: {
        Folder: ['children'],
        File: []
    }
};